// src/components/admin/BookingEditForm.tsx
// React edit form for updating booking details

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

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

interface Space {
      _id: string;
      code: string;
      name: string;
      type: string;
}

interface Props {
      booking: Booking;
      formattedEventDate: string;
}

export default function BookingEditForm({ booking, formattedEventDate }: Props) {
      const [loading, setLoading] = useState(false);
      const [success, setSuccess] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [spaces, setSpaces] = useState<Space[]>([]);
      const [spacesLoading, setSpacesLoading] = useState(true);

// ── Fetch spaces for dropdown ──
      useEffect(() => {
      const fetchSpaces = async () => {
            try {
                  const res = await fetch('/api/admin/spaces');
                  if (res.ok) {
                        const data = await res.json();
                        setSpaces(data);
                  }
            } catch (err) {
                  console.error('Failed to load spaces:', err);
            } finally {
                  setSpacesLoading(false);
            }
      };
      fetchSpaces();
      }, []);

// Form state
      const [formData, setFormData] = useState({
            clientName: booking.clientName || '',
            email: booking.email || '',
            phone: booking.phone || '',
            eventDate: formattedEventDate || '',
            eventType: booking.eventType || 'other',
            bookingType: booking.bookingType || 'party',
            assignedSpace: booking.assignedSpace || '',
            spaceType: booking.spaceType || '',
            guestCount: booking.guestCount || 1,
            totalPrice: booking.totalPrice || 0,
            amountPaid: booking.amountPaid || 0,
            paymentStatus: booking.paymentStatus || 'unpaid',
            notes: booking.notes || '',
      });

// Handle input changes
const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
      const { name, value, type } = e.target;
      setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
      }));
};

// Auto-calculate balance
const balance = (formData.totalPrice || 0) - (formData.amountPaid || 0);

// Submit form
      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setSuccess(false);

      try {
            const response = await fetch(`/api/admin/bookings/${booking._id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formData),
            });

            if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to update booking');
            }

            setSuccess(true);
// Redirect back to bookings list after a short delay
            setTimeout(() => {
                  window.location.href = '/admin';
            }, 1500);
      } catch (err: any) {
            setError(err.message || 'Something went wrong');
      } finally {
            setLoading(false);
      }
};

// Reset form to original data
const handleReset = () => {
      setFormData({
            clientName: booking.clientName || '',
            email: booking.email || '',
            phone: booking.phone || '',
            eventDate: formattedEventDate || '',                  
            eventType: booking.eventType || 'other',
            bookingType: booking.bookingType || 'party',
            assignedSpace: booking.assignedSpace || '',
            spaceType: booking.spaceType || '',
            guestCount: booking.guestCount || 1,
            totalPrice: booking.totalPrice || 0,
            amountPaid: booking.amountPaid || 0,
            paymentStatus: booking.paymentStatus || 'unpaid',
            notes: booking.notes || '',
      });
};

return (
      <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-card p-6 border border-[#e5e7eb]/50 space-y-6"
      >
{/* Success Message */}
            {success && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" /> Booking updated successfully! Redirecting...
                  </div>
            )}

{/* Error Message */}
            {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
            )}

{/* Account / Created Info */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#e5e7eb]/40">
                  <div>
                        <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wider">Account Number</label>
                        <p className="mt-1 font-mono text-sm text-[#111827]">{booking.accountNumber}</p>
                  </div>
                  <div>
                        <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wider">Created</label>
                        <p className="mt-1 text-sm text-[#555]">
                        {new Date(booking.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                        })}
                        </p>
                  </div>
            </div>

{/* Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                        <label htmlFor="clientName" className="block text-sm font-medium text-[#111827]">
                              Client Name *
                        </label>
                        <input
                              type="text"
                              id="clientName"
                              name="clientName"
                              value={formData.clientName}
                              onChange={handleChange}
                              required
                              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                        />
                  </div>
                  <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#111827]">
                              Email *
                        </label>
                        <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                        />
                        </div>
                  </div>

                  <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-[#111827]">
                              Phone
                        </label>
                        <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                        />
                  </div>

{/* Booking Category & Space Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                        <label htmlFor="bookingType" className="block text-sm font-medium text-[#111827]">
                              Booking Category
                        </label>
                        <select
                              id="bookingType"
                              name="bookingType"
                              value={formData.bookingType}
                              onChange={handleChange}
                              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                        >
                              <option value="party">Party / Event</option>
                              <option value="lease">Lease / Rental</option>
                              <option value="market-booth">Farm Market Booth</option>
                        </select>
                  </div>
                  <div>
                        <label htmlFor="spaceType" className="block text-sm font-medium text-[#111827]">
                              Space Type
                  </label>
                  <select
                        id="spaceType"
                        name="spaceType"
                        value={formData.spaceType}
                        onChange={handleChange}
                        className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                  >
                        <option value="">Select type</option>
                        <option value="party">Party Room</option>
                        <option value="market">Farm Market Booth</option>
                        <option value="lease">Lease / Rental</option>
                  </select>
                  </div>
            </div>
{/* Assigned Space – Dropdown from Spaces API */}
            <div>
                  <label htmlFor="assignedSpace" className="block text-sm font-medium text-[#111827]">
                        Assigned Space
                  </label>
                  {spacesLoading ? (
                        <div className="mt-1 text-sm text-[#6b7280]">Loading spaces...</div>
                  ) : (
                  <select
                        id="assignedSpace"
                        name="assignedSpace"
                        value={formData.assignedSpace || ''}
                        onChange={handleChange}
                        className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                  >
                        <option value="">— Select a space —</option>
                        {spaces.map((s) => (
                              <option key={s._id} value={s.code}>
                                    {s.code} {s.name ? `· ${s.name}` : ''}
                              </option>
                        ))}
                  </select>
                  )}
            </div>

{/* Event Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                        <label htmlFor="eventDate" className="block text-sm font-medium text-[#111827]">
                              Event Date & Time *
                        </label>
                        <input
                              type="datetime-local"
                              id="eventDate"
                              name="eventDate"
                              value={formData.eventDate}
                              onChange={handleChange}
                              required
                              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                        />
                  </div>
{/* Event Type */}
                  <div>
                        <label htmlFor="eventType" className="block text-sm font-medium text-[#111827]">
                              Event Type
                        </label>
                        <select
                              id="eventType"
                              name="eventType"
                              value={formData.eventType}
                              onChange={handleChange}
                              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                        >
                              <option value="wedding">Wedding</option>
                              <option value="corporate">Corporate</option>
                              <option value="birthday">Birthday</option>
                              <option value="conference">Conference</option>
                              <option value="other">Other</option>
                        </select>
                  </div>
            </div>

{/* Guests */}
            <div>
                  <label htmlFor="guestCount" className="block text-sm font-medium text-[#111827]">
                        Number of Guests *
                  </label>
                  <input
                        type="number"
                        id="guestCount"
                        name="guestCount"
                        value={formData.guestCount}
                        onChange={handleChange}
                        min="1"
                        max="1000"
                        required
                        className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                  />
            </div>

{/* Financial */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                        <label htmlFor="totalPrice" className="block text-sm font-medium text-[#111827]">
                              Total Price ($)
                        </label>
                        <input
                              type="number"
                              id="totalPrice"
                              name="totalPrice"
                              value={formData.totalPrice}
                              onChange={handleChange}
                              min="0"
                              step="0.01"
                              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                        />
                  </div>
                  <div>
                        <label htmlFor="amountPaid" className="block text-sm font-medium text-[#111827]">
                              Amount Paid ($)
                        </label>
                        <input
                              type="number"
                              id="amountPaid"
                              name="amountPaid"
                              value={formData.amountPaid}
                              onChange={handleChange}
                              min="0"
                              step="0.01"
                              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                        />
                  </div>
                  <div>
                        <label className="block text-sm font-medium text-[#111827]">Balance</label>
                        <p className={`mt-1 text-lg font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              ${balance.toFixed(2)}
                        </p>
                  </div>
            </div>

{/* Payment Status */}
            <div>
                  <label htmlFor="paymentStatus" className="block text-sm font-medium text-[#111827]">
                        Payment Status
                  </label>
                  <select
                        id="paymentStatus"
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleChange}
                        className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                  >
                        <option value="unpaid">Unpaid</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                  </select>
            </div>

{/* Notes */}
            <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-[#111827]">
                        Notes
                  </label>
                  <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={4}
                        className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                        placeholder="Add internal notes about this booking..."
                  />
            </div>

{/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[#e5e7eb]/40">
                  <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-md btn-primary transition text-sm disabled:opacity-50"
                  >
                        {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-md border border-[#e5e7eb] hover:bg-gray-50 transition text-sm disabled:opacity-50"
                  >
                        Reset
                  </button>
                  <a
                        href="/admin"
                        className="px-6 py-2.5 rounded-md text-[#6b7280] hover:text-[#111827] transition text-sm ml-auto"
                  >
                        Cancel
                  </a>
            </div>
      </form>
);
}