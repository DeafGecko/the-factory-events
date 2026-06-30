// src/components/admin/BillsTable.tsx
// Bills & Payments table with inline payment recording

import { useState } from 'react';
import { DollarSign, CheckCircle, AlertCircle, X, XCircle } from 'lucide-react';

interface Booking {
  _id: string;
  accountNumber: string;
  clientName: string;
  email: string;
  totalPrice: number;
  amountPaid: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid' | string;
  eventDate: string;
  bookingType?: string;
  assignedSpace?: string;
}

interface Props {
  initialBookings: Booking[];
}

export default function BillsTable({ initialBookings }: Props) {
  const [bookings, setBookings] = useState(initialBookings);
  const [loading, setLoading] = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // ── Record payment ──
  const handleRecordPayment = async (id: string) => {
    if (paymentAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const booking = bookings.find((b) => b._id === id);
      if (!booking) throw new Error('Booking not found');

      const newAmountPaid = (booking.amountPaid || 0) + paymentAmount;
      const newStatus = newAmountPaid >= (booking.totalPrice || 0) ? 'paid' : 'partial';

      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountPaid: newAmountPaid,
          paymentStatus: newStatus,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to record payment');
      }

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id
            ? { ...b, amountPaid: newAmountPaid, paymentStatus: newStatus }
            : b
        )
      );
      setRecordingId(null);
      setPaymentAmount(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Cancel recording ──
  const cancelRecording = () => {
    setRecordingId(null);
    setPaymentAmount(0);
    setError(null);
  };

  // ── Calculate balance ──
  const getBalance = (booking: Booking) => {
    return (booking.totalPrice || 0) - (booking.amountPaid || 0);
  };

  // ── Status label ──
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

  // ── Totals ──
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalPaid = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const totalOutstanding = totalRevenue - totalPaid;

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#e5e7eb] bg-[#f9fafb] flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-[#6b7280]">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-emerald-600">✓ Paid: {bookings.filter((b) => b.paymentStatus === 'paid').length}</span>
          <span className="text-amber-600">◐ Partial: {bookings.filter((b) => b.paymentStatus === 'partial').length}</span>
          <span className="text-gray-600">○ Unpaid: {bookings.filter((b) => b.paymentStatus === 'unpaid' || !b.paymentStatus).length}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-3 bg-red-50 text-red-600 text-sm border-b border-red-200 flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f3f4f6]">
              <th className="text-left py-3 px-4 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px]">Account</th>
              <th className="text-left py-3 px-4 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px]">Client</th>
              <th className="text-left py-3 px-4 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px] hidden md:table-cell">Event</th>
              <th className="text-left py-3 px-4 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px]">Total</th>
              <th className="text-left py-3 px-4 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px]">Paid</th>
              <th className="text-left py-3 px-4 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px]">Balance</th>
              <th className="text-left py-3 px-4 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px]">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#9ca3af]">
                  <DollarSign className="w-10 h-10 mx-auto mb-3 text-[#9ca3af]" />
                  <p className="text-sm">No bookings found.</p>
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const balance = getBalance(b);
                return (
                  <tr key={b._id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition">
                    <td className="py-3 px-4 font-mono text-xs text-[#111827]">{b.accountNumber}</td>
                    <td className="py-3 px-4 font-medium text-[#111827]">{b.clientName}</td>
                    <td className="py-3 px-4 text-[#6b7280] hidden md:table-cell">
                      {b.eventDate ? new Date(b.eventDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#111827]">${(b.totalPrice || 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-[#111827]">${(b.amountPaid || 0).toFixed(2)}</td>
                    <td className={`py-3 px-4 font-medium ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      ${balance.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(b.paymentStatus)}`}>
                        {getStatusLabel(b.paymentStatus)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {recordingId === b._id ? (
                        // ── Inline payment form ──
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={balance}
                            value={paymentAmount || ''}
                            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                            className="w-24 border border-[#e5e7eb] rounded-md px-2 py-1 text-sm ring-primary"
                            placeholder="$"
                            disabled={loading}
                          />
                          <button
                            onClick={() => handleRecordPayment(b._id)}
                            disabled={loading || paymentAmount <= 0}
                            className="px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition text-xs disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelRecording}
                            className="p-1 text-[#6b7280] hover:text-[#111827]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        // ── Record Payment button ──
                        <button
                          onClick={() => {
                            setRecordingId(b._id);
                            setPaymentAmount(balance > 0 ? balance : 0);
                            setError(null);
                          }}
                          disabled={balance <= 0}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                            balance > 0
                              ? 'btn-primary'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {balance > 0 ? 'Record Payment' : 'Fully Paid'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="bg-[#f3f4f6] border-t-2 border-[#e5e7eb]">
              <td colSpan={3} className="py-3 px-4 font-semibold text-[#111827]">Totals</td>
              <td className="py-3 px-4 font-semibold text-[#111827]">${totalRevenue.toFixed(2)}</td>
              <td className="py-3 px-4 font-semibold text-[#111827]">${totalPaid.toFixed(2)}</td>
              <td className={`py-3 px-4 font-semibold ${totalOutstanding > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ${totalOutstanding.toFixed(2)}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer stats */}
      <div className="px-6 py-3 border-t border-[#e5e7eb] bg-[#f9fafb] flex flex-wrap items-center justify-between gap-3 text-sm text-[#6b7280]">
        <span>
          {bookings.filter((b) => b.paymentStatus === 'paid').length} paid ·{' '}
          {bookings.filter((b) => b.paymentStatus === 'partial').length} partial ·{' '}
          {bookings.filter((b) => b.paymentStatus === 'unpaid' || !b.paymentStatus).length} unpaid
        </span>
        <span>
          Outstanding: <strong className="text-red-600">${totalOutstanding.toFixed(2)}</strong>
        </span>
      </div>
    </div>
  );
}