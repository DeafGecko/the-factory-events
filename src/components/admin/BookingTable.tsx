// src/components/admin/BookingTable.tsx
import { useState, useMemo } from 'react';
import { Search, Inbox, Trash2, Edit, X, Plus } from 'lucide-react';
import CustomSelect from './CustomSelect';

interface Booking {
  _id: string;
  accountNumber: string;
  clientName: string;
  email: string;
  phone?: string;
  eventDate: string;
  eventType?: string;
  bookingType?: string;
  assignedSpace?: string;
  spaceType?: string;
  guestCount: number;
  totalPrice?: number;
  amountPaid?: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid' | string;
  notes?: string;
  createdAt: string;
}

interface Props { initialBookings: Booking[]; }

const statusStyle = (s: string) =>
  s === 'paid'    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
  s === 'partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
  s === 'owe'     ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-red-50 text-red-700 border-red-200';

const dotColor = (s: string) =>
  s === 'paid'    ? 'bg-emerald-500' :
  s === 'partial' ? 'bg-amber-500' :
  s === 'owe'     ? 'bg-blue-500' :
                    'bg-red-500';

const statusLabel = (s: string) =>
  s === 'paid' ? 'Paid' : s === 'partial' ? 'Partial' : s === 'owe' ? 'Owes Refund' : 'Unpaid';

const FILTERS = ['all', 'paid', 'partial', 'unpaid', 'owe'] as const;

const EMPTY_FORM = {
  clientName: '', email: '', phone: '',
  eventDate: '', eventType: 'other', bookingType: 'party',
  assignedSpace: '', spaceType: '', guestCount: 1,
  totalPrice: 0, amountPaid: 0, paymentStatus: 'unpaid', notes: '',
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="block text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af] mb-0.5">{children}</span>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full border border-[#e5e7eb] rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151] ${props.className || ''}`} />
);


export default function BookingTable({ initialBookings }: Props) {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [loading, setLoading]   = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData]   = useState({ ...EMPTY_FORM });
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const deriveStatus = (b: Booking) => {
    const paid = b.amountPaid || 0;
    const total = b.totalPrice || 0;
    if (paid > total && total > 0) return 'owe';
    return b.paymentStatus || 'unpaid';
  };

  const filtered = useMemo(() =>
    bookings.filter((b) => {
      const q = search.toLowerCase();
      const matchSearch = b.clientName.toLowerCase().includes(q) ||
        (b.accountNumber || '').toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q);
      const effectiveStatus = deriveStatus(b);
      const matchFilter = filter === 'all' || effectiveStatus === filter ||
        (filter === 'unpaid' && !b.paymentStatus);
      return matchSearch && matchFilter;
    }), [bookings, search, filter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this booking? This cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) { setBookings(b => b.filter(x => x._id !== id)); setSelectedIds(s => s.filter(x => x !== id)); }
      else alert('Failed to delete booking.');
    } catch { alert('Error deleting booking.'); }
    finally { setLoading(false); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length || !confirm(`Delete ${selectedIds.length} bookings?`)) return;
    setLoading(true);
    try {
      await Promise.all(selectedIds.map(id => fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })));
      setBookings(b => b.filter(x => !selectedIds.includes(x._id)));
      setSelectedIds([]);
    } catch { alert('Error deleting bookings.'); }
    finally { setLoading(false); }
  };

  const allSelected = selectedIds.length === filtered.length && filtered.length > 0;
  const toggleAll   = () => setSelectedIds(allSelected ? [] : filtered.map(b => b._id));
  const toggleOne   = (id: string) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const counts = {
    paid:    bookings.filter(b => deriveStatus(b) === 'paid').length,
    partial: bookings.filter(b => deriveStatus(b) === 'partial').length,
    unpaid:  bookings.filter(b => deriveStatus(b) === 'unpaid').length,
    owe:     bookings.filter(b => deriveStatus(b) === 'owe').length,
  };

  const openModal = () => { setFormData({ ...EMPTY_FORM }); setFormError(null); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setFormError(null); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setFormError(null);
    try {
      const res = await fetch('/api/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create booking');
      // Reload page so new booking appears with its generated account number
      window.location.reload();
    } catch (err: any) {
      setFormError(err.message);
      setSaving(false);
    }
  };

  const balance = (formData.totalPrice || 0) - (formData.amountPaid || 0);

  return (
    <>
    <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm flex flex-col max-h-[calc(100vh-13rem)]">

      {/* Toolbar */}
      <div className="px-3 py-2 border-b border-[#e5e7eb] flex items-center gap-2 shrink-0">
        <div className="relative flex-1 min-w-36">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
          <input type="search" placeholder="Search name, account, email…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]" />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1">
          {FILTERS.map(f => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={`h-8 px-4 rounded-md text-xs font-medium transition capitalize ${filter === f ? 'btn-primary' : 'border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6]'}`}>
              {f === 'all' ? `All (${bookings.length})` :
               f === 'paid' ? `Paid (${counts.paid})` :
               f === 'partial' ? `Partial (${counts.partial})` :
               f === 'owe' ? `Owes Refund (${counts.owe})` :
               `Unpaid (${counts.unpaid})`}
            </button>
          ))}
        </div>

        {selectedIds.length > 0 ? (
          <button type="button" onClick={handleBulkDelete} disabled={loading}
            className="h-8 flex items-center gap-1 px-4 rounded-md bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-50 transition">
            <Trash2 className="w-3.5 h-3.5" /> Delete {selectedIds.length}
          </button>
        ) : (
          <button type="button" onClick={openModal}
            className="h-8 flex items-center gap-1 px-4 rounded-md btn-primary text-xs transition">
            <Plus className="w-3.5 h-3.5" /> New Booking
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <th className="px-3 py-2 w-8">
                <input type="checkbox" title="Select all" checked={allSelected} onChange={toggleAll}
                  className="rounded border-[#d1d5db]" />
              </th>
              {['Account', 'Client', 'Email', 'Date', 'Guests', 'Total', 'Status', 'Actions'].map(h => (
                <th key={h} className={`text-left px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af]
                  ${h === 'Email'  ? 'hidden md:table-cell' : ''}
                  ${h === 'Date'   ? 'hidden lg:table-cell' : ''}
                  ${h === 'Guests' ? 'hidden sm:table-cell' : ''}
                  ${h === 'Total'  ? 'hidden md:table-cell' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#9ca3af]">
                  <Inbox className="w-10 h-10 mx-auto mb-2 text-[#e5e7eb]" />
                  <p className="text-xs">No bookings found.</p>
                </td>
              </tr>
            ) : filtered.map(b => (
              <tr key={b._id} className="hover:bg-[#fafafa] transition">
                <td className="px-3 py-2">
                  <input type="checkbox" title={`Select ${b.clientName}`} checked={selectedIds.includes(b._id)} onChange={() => toggleOne(b._id)}
                    className="rounded border-[#d1d5db]" />
                </td>
                <td className="px-3 py-2 font-mono text-xs text-[#6b7280]">{b.accountNumber}</td>
                <td className="px-3 py-2">
                  <p className="text-sm font-medium text-[#111827] leading-tight">{b.clientName}</p>
                  <p className="text-[0.65rem] text-[#9ca3af] md:hidden">{b.email}</p>
                </td>
                <td className="px-3 py-2 text-sm text-[#6b7280] hidden md:table-cell">{b.email}</td>
                <td className="px-3 py-2 text-xs text-[#6b7280] hidden lg:table-cell">
                  {new Date(b.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-3 py-2 text-xs text-[#6b7280] hidden sm:table-cell">{b.guestCount}</td>
                <td className="px-3 py-2 text-xs font-medium text-[#111827] hidden md:table-cell">${(b.totalPrice || 0).toFixed(2)}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-medium border ${statusStyle(deriveStatus(b))}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor(deriveStatus(b))}`} />
                    {statusLabel(deriveStatus(b))}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <a href={`/admin/edit/${b._id}`} title={`Edit ${b.clientName}`}
                      className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition">
                      <Edit className="w-3.5 h-3.5" />
                    </a>
                    <button type="button" title={`Delete ${b.clientName}`} onClick={() => handleDelete(b._id)} disabled={loading}
                      className="p-1.5 rounded-md text-[#9ca3af] hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#e5e7eb] flex items-center justify-between gap-3 text-xs text-[#9ca3af] shrink-0">
        <span>Showing <strong className="text-[#374151]">{filtered.length}</strong> of <strong className="text-[#374151]">{bookings.length}</strong></span>
        <div className="flex items-center gap-3">
          {([['bg-emerald-500', 'Paid', counts.paid], ['bg-amber-500', 'Partial', counts.partial], ['bg-red-500', 'Unpaid', counts.unpaid]] as const).map(([color, label, count]) => (
            <span key={label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              {label}: <strong className="text-[#374151]">{count}</strong>
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* ── New Booking Modal ── */}
    {showModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

          {/* Modal header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb]">
            <h3 className="text-sm font-semibold text-[#111827]">New Booking</h3>
            <button type="button" onClick={closeModal} title="Close" className="p-1 rounded-md text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="px-4 py-3 space-y-3">
            {formError && (
              <div className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">{formError}</div>
            )}

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Client Name *</Label>
                <Input name="clientName" value={formData.clientName} onChange={handleChange} required placeholder="Jane Smith" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="jane@email.com" />
              </div>
            </div>

            <div>
              <Label>Phone</Label>
              <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(555) 000-0000" />
            </div>

            {/* Event Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Event Date & Time *</Label>
                <Input type="datetime-local" name="eventDate" value={formData.eventDate} onChange={handleChange} required />
              </div>
              <div>
                <Label>Guests *</Label>
                <Input type="number" name="guestCount" value={formData.guestCount} onChange={handleChange} min="1" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Booking Type</Label>
                <CustomSelect value={formData.bookingType} onChange={v => setFormData(p => ({ ...p, bookingType: v }))}
                  options={[
                    { value: 'party', label: 'Party / Event' },
                    { value: 'lease', label: 'Lease / Rental' },
                    { value: 'market-booth', label: 'Farm Market Booth' },
                  ]} />
              </div>
              <div>
                <Label>Event Type</Label>
                <CustomSelect value={formData.eventType} onChange={v => setFormData(p => ({ ...p, eventType: v }))}
                  options={[
                    { value: 'wedding', label: 'Wedding' },
                    { value: 'corporate', label: 'Corporate' },
                    { value: 'birthday', label: 'Birthday' },
                    { value: 'party', label: 'Party' },
                    { value: 'graduation', label: 'Graduation' },
                    { value: 'shower', label: 'Baby/Bridal Shower' },
                    { value: 'concert', label: 'Concert / Show' },
                    { value: 'holiday', label: 'Holiday Event' },
                    { value: 'farm-market', label: 'Farm Market' },
                    { value: 'tenant', label: 'Tenant' },
                    { value: 'venue-rental', label: 'Venue Rental' },
                    { value: 'other', label: 'Other' },
                  ]} />
              </div>
            </div>

            <div>
              <Label>Assigned Space</Label>
              <Input name="assignedSpace" value={formData.assignedSpace} onChange={handleChange} placeholder="e.g. A1, B3" />
            </div>

            {/* Financial */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Total Price ($)</Label>
                <Input type="number" name="totalPrice" value={formData.totalPrice} onChange={handleChange} min="0" step="0.01" />
              </div>
              <div>
                <Label>Amount Paid ($)</Label>
                <Input type="number" name="amountPaid" value={formData.amountPaid} onChange={handleChange} min="0" step="0.01" />
              </div>
              <div>
                <Label>Balance</Label>
                <p className={`pt-1.5 text-sm font-semibold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>${balance.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <Label>Payment Status</Label>
              <CustomSelect value={formData.paymentStatus} onChange={v => setFormData(p => ({ ...p, paymentStatus: v }))}
                options={[
                  { value: 'unpaid', label: 'Unpaid' },
                  { value: 'partial', label: 'Partial' },
                  { value: 'paid', label: 'Paid' },
                ]} />
            </div>

            <div>
              <Label>Notes</Label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2}
                placeholder="Internal notes…"
                className="w-full border border-[#e5e7eb] rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151] resize-none" />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-[#e5e7eb]">
              <button type="submit" disabled={saving}
                className="flex-1 py-2 rounded-md btn-primary text-sm disabled:opacity-50 transition">
                {saving ? 'Creating…' : 'Create Booking'}
              </button>
              <button type="button" onClick={closeModal}
                className="px-4 py-2 rounded-md border border-[#e5e7eb] text-sm text-[#6b7280] hover:bg-[#f3f4f6] transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
