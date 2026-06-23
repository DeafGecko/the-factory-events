// src/components/admin/BookingTable.tsx
// Full booking table with search, filter, edit, delete

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

  // Filter and search logic
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

  // Delete handler
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

  // Bulk delete
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-[#e8e4dc]/50">
      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name, account, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1c1c1e] text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-[#e8e4dc] rounded-md px-4 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1c1c1e] text-sm"
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
            className="px-4 py-2.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition text-sm disabled:opacity-50"
          >
            Delete {selectedIds.length} selected
          </button>
        )}
      </div>

      {/* Bookings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8e4dc]/60">
              <th className="py-3 pr-2 w-8">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredBookings.length && filteredBookings.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="text-left py-3 px-2 font-medium text-[#8e8e93] text-xs uppercase tracking-wider">Account</th>
              <th className="text-left py-3 px-2 font-medium text-[#8e8e93] text-xs uppercase tracking-wider">Client</th>
              <th className="text-left py-3 px-2 font-medium text-[#8e8e93] text-xs uppercase tracking-wider">Email</th>
              <th className="text-left py-3 px-2 font-medium text-[#8e8e93] text-xs uppercase tracking-wider">Event Date</th>
              <th className="text-left py-3 px-2 font-medium text-[#8e8e93] text-xs uppercase tracking-wider">Guests</th>
              <th className="text-left py-3 px-2 font-medium text-[#8e8e93] text-xs uppercase tracking-wider">Total</th>
              <th className="text-left py-3 px-2 font-medium text-[#8e8e93] text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-2 font-medium text-[#8e8e93] text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#8e8e93]">
                  No bookings found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b._id} className="border-b border-[#e8e4dc]/30 hover:bg-gray-50 transition">
                  <td className="py-3 pr-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(b._id)}
                      onChange={() => toggleSelect(b._id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="py-3 px-2 font-mono text-sm text-[#1c1c1e]">{b.accountNumber}</td>
                  <td className="py-3 px-2 font-medium text-[#1c1c1e]">{b.clientName}</td>
                  <td className="py-3 px-2 text-[#555]">{b.email}</td>
                  <td className="py-3 px-2 text-[#555]">
                    {new Date(b.eventDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-2 text-[#555]">{b.guestCount}</td>
                  <td className="py-3 px-2 font-medium text-[#1c1c1e]">
                    ${(b.totalPrice || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(
                        b.paymentStatus
                      )}`}
                    >
                      {b.paymentStatus || 'unpaid'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/admin/edit/${b._id}`}
                        className="text-[#6B6B6B] hover:text-[#1c1c1e] transition text-sm underline-offset-2 hover:underline"
                      >
                        Edit
                      </a>
                      <button
                        onClick={() => handleDelete(b._id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 transition text-sm disabled:opacity-50"
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

      {/* Footer stats */}
      <div className="mt-4 pt-4 border-t border-[#e8e4dc]/40 flex justify-between text-sm text-[#8e8e93] flex-wrap gap-2">
        <span>
          Showing {filteredBookings.length} of {bookings.length} bookings
        </span>
        <span>
          Paid: {bookings.filter((b) => b.paymentStatus === 'paid').length} &nbsp;·&nbsp;
          Partial: {bookings.filter((b) => b.paymentStatus === 'partial').length} &nbsp;·&nbsp;
          Unpaid: {bookings.filter((b) => b.paymentStatus !== 'paid' && b.paymentStatus !== 'partial').length}
        </span>
      </div>
    </div>
  );
}