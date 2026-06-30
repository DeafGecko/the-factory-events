// src/components/admin/BookingTable.tsx
import { useState, useMemo } from 'react';
import { Search, Inbox, Trash2, Edit } from 'lucide-react';

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

interface Props {
  initialBookings: Booking[];
}

export default function BookingTable({ initialBookings }: Props) {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.clientName.toLowerCase().includes(search.toLowerCase()) ||
        b.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === 'all' || b.paymentStatus === filter;

      return matchesSearch && matchesFilter;
    });
  }, [bookings, search, filter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this booking? This action cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings(bookings.filter((b) => b._id !== id));
        setSelectedIds(selectedIds.filter((sid) => sid !== id));
      } else {
        alert('Failed to delete booking.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected bookings?`)) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
        )
      );
      setBookings(bookings.filter((b) => !selectedIds.includes(b._id)));
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      alert('Error deleting bookings.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBookings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBookings.map((b) => b._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'paid':    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'partial': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'unpaid':  return 'bg-red-50 text-red-700 border-red-200';
      default:        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getDotColor = (status: string) => {
    switch (status) {
      case 'paid':    return 'bg-emerald-600';
      case 'partial': return 'bg-amber-600';
      case 'unpaid':  return 'bg-red-500';
      default:        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':    return 'Paid';
      case 'partial': return 'Partial';
      case 'unpaid':  return 'Unpaid';
      default:        return status || 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-[#e5e7eb] bg-[#f9fafb] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, account, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#e5e7eb] rounded-lg bg-white text-sm text-gray-900 placeholder:text-[#9ca3af] ring-primary transition"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-[#e5e7eb] rounded-lg px-4 py-2 bg-white text-sm text-gray-900 ring-primary"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete {selectedIds.length} selected
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f3f4f6]">
              <th className="py-3.5 px-3 w-8">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredBookings.length && filteredBookings.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-[#d1d5db] accent-[var(--admin-primary)]"
                />
              </th>
              <th className="text-left py-3.5 px-3 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px]">Account</th>
              <th className="text-left py-3.5 px-3 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px]">Client</th>
              <th className="text-left py-3.5 px-3 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px] hidden md:table-cell">Email</th>
              <th className="text-left py-3.5 px-3 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px] hidden lg:table-cell">Date</th>
              <th className="text-left py-3.5 px-3 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px] hidden sm:table-cell">Guests</th>
              <th className="text-left py-3.5 px-3 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px] hidden md:table-cell">Total</th>
              <th className="text-left py-3.5 px-3 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px]">Status</th>
              <th className="text-left py-3.5 px-3 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#9ca3af]">
                  <Inbox className="w-12 h-12 mx-auto mb-3 text-[#9ca3af]" />
                  <p className="text-sm">No bookings found.</p>
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b._id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition">
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(b._id)}
                      onChange={() => toggleSelect(b._id)}
                      className="rounded border-[#d1d5db] accent-[var(--admin-primary)]"
                    />
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-[#111827]">{b.accountNumber}</td>
                  <td className="py-3 px-3 font-medium text-[#111827]">{b.clientName}</td>
                  <td className="py-3 px-3 text-[#6b7280] hidden md:table-cell">{b.email}</td>
                  <td className="py-3 px-3 text-[#6b7280] hidden lg:table-cell">
                    {new Date(b.eventDate).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-3 text-[#6b7280] hidden sm:table-cell">{b.guestCount}</td>
                  <td className="py-3 px-3 font-medium text-[#111827] hidden md:table-cell">
                    ${(b.totalPrice || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(b.paymentStatus)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getDotColor(b.paymentStatus)}`} />
                      {getStatusLabel(b.paymentStatus)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <a
                        href={`/admin/edit/${b._id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] rounded-md transition text-xs font-medium"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </a>
                      <button
                        onClick={() => handleDelete(b._id)}
                        disabled={loading}
                        className="flex items-center gap-1 px-3 py-1.5 text-[#9ca3af] hover:text-red-600 hover:bg-red-50 rounded-md transition text-xs font-medium disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#e5e7eb] bg-[#f9fafb] flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-[#6b7280]">
          Showing <strong className="text-[#111827]">{filteredBookings.length}</strong> of{' '}
          <strong className="text-[#111827]">{bookings.length}</strong> bookings
        </span>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#6b7280]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Paid: {bookings.filter((b) => b.paymentStatus === 'paid').length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Partial: {bookings.filter((b) => b.paymentStatus === 'partial').length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            Unpaid: {bookings.filter((b) => b.paymentStatus !== 'paid' && b.paymentStatus !== 'partial').length}
          </span>
        </div>
      </div>
    </div>
  );
}