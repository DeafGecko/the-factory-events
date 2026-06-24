// src/components/admin/BookingTable.tsx
// Swiss-Industrial styled booking table with search, filter, edit, delete

import { useState, useMemo } from 'react';

interface Booking {
  _id: string;
  accountNumber: string;
  clientName: string;
  email: string;
  phone?: string;
  eventDate: string;
  eventType?: string;
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
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'partial':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partial';
      default:
        return 'Unpaid';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#e8e4dc] shadow-sm overflow-hidden">
      {/* Header with search and filter */}
      <div className="p-5 border-b border-[#e8e4dc] bg-[#faf9f7]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[220px]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a898] text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search by name, account, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-[#e8e4dc] rounded-md bg-white text-sm text-[#1c1c1e] placeholder:text-[#b0a898] focus:outline-none focus:ring-1 focus:ring-[#1c1c1e] transition"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-[#e8e4dc] rounded-md px-4 py-2.5 bg-white text-sm text-[#1c1c1e] focus:outline-none focus:ring-1 focus:ring-[#1c1c1e] transition"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="px-4 py-2.5 rounded-md bg-[#b91c1c] text-white hover:bg-[#991b1b] transition text-sm disabled:opacity-50"
              >
                Delete {selectedIds.length} selected
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8e4dc] bg-[#f5f3ef]">
              <th className="py-3.5 px-3 w-8">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredBookings.length && filteredBookings.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-[#d0c8bc] accent-[#1c1c1e]"
                />
              </th>
              <th className="text-left py-3.5 px-3 font-medium text-[#8a7a6a] text-[11px] uppercase tracking-[0.8px]">Account</th>
              <th className="text-left py-3.5 px-3 font-medium text-[#8a7a6a] text-[11px] uppercase tracking-[0.8px]">Client</th>
              <th className="text-left py-3.5 px-3 font-medium text-[#8a7a6a] text-[11px] uppercase tracking-[0.8px] hidden md:table-cell">Email</th>
              <th className="text-left py-3.5 px-3 font-medium text-[#8a7a6a] text-[11px] uppercase tracking-[0.8px] hidden lg:table-cell">Event Date</th>
              <th className="text-left py-3.5 px-3 font-medium text-[#8a7a6a] text-[11px] uppercase tracking-[0.8px] hidden sm:table-cell">Guests</th>
              <th className="text-left py-3.5 px-3 font-medium text-[#8a7a6a] text-[11px] uppercase tracking-[0.8px] hidden md:table-cell">Total</th>
              <th className="text-left py-3.5 px-3 font-medium text-[#8a7a6a] text-[11px] uppercase tracking-[0.8px]">Status</th>
              <th className="text-left py-3.5 px-3 font-medium text-[#8a7a6a] text-[11px] uppercase tracking-[0.8px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#b0a898]">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-sm">No bookings found matching your criteria.</p>
                </td>
              </tr>
            ) : (
              filteredBookings.map((b, index) => (
                <tr
                  key={b._id}
                  className={`border-b border-[#f0ece6] hover:bg-[#faf9f7] transition ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#fcfbfa]'
                  }`}
                >
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(b._id)}
                      onChange={() => toggleSelect(b._id)}
                      className="rounded border-[#d0c8bc] accent-[#1c1c1e]"
                    />
                  </td>
                  <td className="py-3 px-3 font-mono text-[13px] text-[#1c1c1e] tracking-[0.2px]">{b.accountNumber}</td>
                  <td className="py-3 px-3 font-medium text-[#1c1c1e]">{b.clientName}</td>
                  <td className="py-3 px-3 text-[#6a5a4a] hidden md:table-cell">{b.email}</td>
                  <td className="py-3 px-3 text-[#6a5a4a] hidden lg:table-cell">
                    {new Date(b.eventDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-3 text-[#6a5a4a] hidden sm:table-cell">{b.guestCount}</td>
                  <td className="py-3 px-3 font-medium text-[#1c1c1e] hidden md:table-cell">
                    ${(b.totalPrice || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(
                        b.paymentStatus
                      )}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        b.paymentStatus === 'paid' ? 'bg-emerald-500' :
                        b.paymentStatus === 'partial' ? 'bg-amber-500' :
                        'bg-gray-400'
                      }`} />
                      {getStatusLabel(b.paymentStatus)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <a
                        href={`/admin/edit/${b._id}`}
                        className="px-3 py-1.5 text-[#6a5a4a] hover:text-[#1c1c1e] hover:bg-[#f0ece6] rounded-md transition text-xs font-medium"
                      >
                        Edit
                      </a>
                      <button
                        onClick={() => handleDelete(b._id)}
                        disabled={loading}
                        className="px-3 py-1.5 text-[#b0a898] hover:text-[#b91c1c] hover:bg-[#fef2f2] rounded-md transition text-xs font-medium disabled:opacity-50"
                      >
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
      <div className="px-5 py-4 border-t border-[#e8e4dc] bg-[#faf9f7] flex flex-wrap justify-between items-center gap-3">
        <span className="text-sm text-[#8a7a6a]">
          Showing <strong className="text-[#1c1c1e]">{filteredBookings.length}</strong> of{' '}
          <strong className="text-[#1c1c1e]">{bookings.length}</strong> bookings
        </span>
        <div className="flex items-center gap-4 text-sm text-[#8a7a6a]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Paid: {bookings.filter((b) => b.paymentStatus === 'paid').length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Partial: {bookings.filter((b) => b.paymentStatus === 'partial').length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Unpaid: {bookings.filter((b) => b.paymentStatus !== 'paid' && b.paymentStatus !== 'partial').length}
          </span>
        </div>
      </div>
    </div>
  );
}