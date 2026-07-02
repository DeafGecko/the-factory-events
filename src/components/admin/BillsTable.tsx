// src/components/admin/BillsTable.tsx
import { useState } from 'react';
import { DollarSign, X, XCircle, RefreshCw } from 'lucide-react';

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

interface Props { initialBookings: Booking[]; }

// Derive status from actual numbers — don't trust stale stored paymentStatus
const deriveStatus = (totalPrice: number, amountPaid: number): string => {
  const paid = amountPaid || 0;
  const total = totalPrice || 0;
  if (paid <= 0) return 'unpaid';
  if (paid > total) return 'credit';
  if (paid === total) return 'paid';
  return 'partial';
};

const statusStyle = (s: string) =>
  s === 'paid'    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
  s === 'partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
  s === 'credit'  ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-red-50 text-red-700 border-red-200';

const statusLabel = (s: string) =>
  s === 'paid'    ? 'Paid' :
  s === 'partial' ? 'Partial' :
  s === 'credit'  ? 'Owe Refund' :
                    'Unpaid';

export default function BillsTable({ initialBookings }: Props) {
  const [bookings, setBookings]       = useState(initialBookings);
  const [loading, setLoading]         = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [error, setError]             = useState<string | null>(null);
  const [backfilling, setBackfilling] = useState(false);

  const missingCount = bookings.filter(b => !b.accountNumber).length;

  const handleBackfill = async () => {
    setBackfilling(true);
    try {
      const res = await fetch('/api/admin/backfill-accounts', { method: 'POST' });
      if (!res.ok) throw new Error('Backfill failed');
      await res.json();
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBackfilling(false);
    }
  };

  const handleRecordPayment = async (id: string) => {
    if (paymentAmount <= 0) { setError('Amount must be greater than 0'); return; }
    setLoading(true); setError(null);
    try {
      const booking = bookings.find(b => b._id === id);
      if (!booking) throw new Error('Booking not found');
      const newAmountPaid = (booking.amountPaid || 0) + paymentAmount;
      const newStatus = newAmountPaid >= (booking.totalPrice || 0) ? 'paid' : 'partial';
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountPaid: newAmountPaid, paymentStatus: newStatus }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      setBookings(prev => prev.map(b => b._id === id ? { ...b, amountPaid: newAmountPaid, paymentStatus: newStatus } : b));
      setRecordingId(null); setPaymentAmount(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelRecording = () => { setRecordingId(null); setPaymentAmount(0); setError(null); };
  const getBalance = (b: Booking) => (b.totalPrice || 0) - (b.amountPaid || 0);

  const totalRevenue     = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
  const totalPaid        = bookings.reduce((s, b) => s + (b.amountPaid || 0), 0);
  const totalOutstanding = totalRevenue - totalPaid;

  const counts = {
    paid:    bookings.filter(b => deriveStatus(b.totalPrice, b.amountPaid) === 'paid').length,
    partial: bookings.filter(b => deriveStatus(b.totalPrice, b.amountPaid) === 'partial').length,
    unpaid:  bookings.filter(b => deriveStatus(b.totalPrice, b.amountPaid) === 'unpaid').length,
    credit:  bookings.filter(b => deriveStatus(b.totalPrice, b.amountPaid) === 'credit').length,
  };

  const handleMarkRefunded = async (id: string) => {
    if (!confirm('Mark this refund as paid out? Amount paid will be reset to the total.')) return;
    setLoading(true); setError(null);
    try {
      const booking = bookings.find(b => b._id === id);
      if (!booking) throw new Error('Booking not found');
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountPaid: booking.totalPrice, paymentStatus: 'paid' }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      setBookings(prev => prev.map(b => b._id === id ? { ...b, amountPaid: booking.totalPrice, paymentStatus: 'paid' } : b));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm flex flex-col max-h-[calc(100vh-13rem)]">

      {/* Toolbar */}
      <div className="px-3 py-2.5 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex-1" />
        <div className="flex items-center gap-3 text-xs">
          <span className="text-emerald-600 font-medium">{counts.paid} paid</span>
          <span className="text-amber-600 font-medium">{counts.partial} partial</span>
          <span className="text-red-600 font-medium">{counts.unpaid} unpaid</span>
          {counts.credit > 0 && <span className="text-blue-600 font-medium">{counts.credit} owe refund</span>}
        </div>
        {missingCount > 0 && (
          <button type="button" onClick={handleBackfill} disabled={backfilling}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-amber-300 bg-amber-50 text-amber-700 text-xs hover:bg-amber-100 transition disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${backfilling ? 'animate-spin' : ''}`} />
            {backfilling ? 'Assigning…' : `Assign account #s (${missingCount} missing)`}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-xs border-b border-red-200 flex items-center gap-2">
          <XCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              {['Account', 'Client', 'Date', 'Total', 'Paid', 'Balance', 'Status', 'Actions'].map(h => (
                <th key={h} className={`text-left px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af]
                  ${h === 'Date' ? 'hidden md:table-cell' : ''}
                  ${h === 'Actions' ? 'w-36' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#9ca3af]">
                  <DollarSign className="w-10 h-10 mx-auto mb-2 text-[#e5e7eb]" />
                  <p className="text-xs">No billing records found.</p>
                </td>
              </tr>
            ) : bookings.map(b => {
              const balance = getBalance(b);
              const effectiveStatus = deriveStatus(b.totalPrice, b.amountPaid);
              return (
                <tr key={b._id} className="hover:bg-[#fafafa] transition">
                  <td className="px-3 py-2 font-mono text-xs text-[#6b7280]">
                    {b.accountNumber || <span className="text-amber-500 italic">unassigned</span>}
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-[#111827] leading-tight">{b.clientName}</p>
                    <p className="text-[0.65rem] text-[#9ca3af]">{b.email}</p>
                  </td>
                  <td className="px-3 py-2 text-xs text-[#6b7280] hidden md:table-cell">
                    {b.eventDate ? new Date(b.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-3 py-2 text-xs font-medium text-[#111827]">${(b.totalPrice || 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-xs text-[#6b7280]">${(b.amountPaid || 0).toFixed(2)}</td>
                  <td className={`px-3 py-2 text-xs font-medium ${balance > 0 ? 'text-red-600' : balance < 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                    ${balance.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.6rem] font-medium border ${statusStyle(effectiveStatus)}`}>
                      {statusLabel(effectiveStatus)}
                    </span>
                  </td>
                  <td className="px-3 py-2 w-36">
                    {recordingId === b._id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" step="0.01" min="0.01" max={balance}
                          value={paymentAmount || ''}
                          onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                          placeholder="$" disabled={loading}
                          className="w-16 h-7 border border-[#e5e7eb] rounded-md px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#374151]" />
                        <button type="button" onClick={() => handleRecordPayment(b._id)}
                          disabled={loading || paymentAmount <= 0}
                          className="h-7 px-2.5 rounded-md bg-emerald-600 text-white text-xs hover:bg-emerald-700 transition disabled:opacity-50">
                          Save
                        </button>
                        <button type="button" onClick={cancelRecording} title="Cancel"
                          className="h-7 w-7 flex items-center justify-center rounded-md text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button type="button"
                        onClick={effectiveStatus === 'credit'
                          ? () => handleMarkRefunded(b._id)
                          : () => { setRecordingId(b._id); setPaymentAmount(balance > 0 ? balance : 0); setError(null); }}
                        disabled={effectiveStatus === 'paid'}
                        className={`w-full h-7 rounded-md text-xs font-medium transition ${effectiveStatus === 'unpaid' || effectiveStatus === 'partial' ? 'btn-primary' : effectiveStatus === 'credit' ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' : 'bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed'}`}>
                        {effectiveStatus === 'paid' ? 'Fully Paid' : effectiveStatus === 'credit' ? 'Mark Refunded' : 'Record Payment'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#f9fafb] border-t-2 border-[#e5e7eb]">
              <td colSpan={3} className="px-3 py-2 text-xs font-semibold text-[#374151]">Totals</td>
              <td className="px-3 py-2 text-xs font-semibold text-[#111827]">${totalRevenue.toFixed(2)}</td>
              <td className="px-3 py-2 text-xs font-semibold text-[#111827]">${totalPaid.toFixed(2)}</td>
              <td className={`px-3 py-2 text-xs font-semibold ${totalOutstanding > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ${totalOutstanding.toFixed(2)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#9ca3af] shrink-0">
        <span>{bookings.length} record{bookings.length !== 1 ? 's' : ''}</span>
        <span>Outstanding: <strong className="text-red-600">${totalOutstanding.toFixed(2)}</strong></span>
      </div>
    </div>
  );
}
