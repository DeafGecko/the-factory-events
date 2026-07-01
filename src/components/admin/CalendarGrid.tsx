// src/components/admin/CalendarGrid.tsx
// Interactive monthly calendar with event dots and modal

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, PartyPopper, FileText, ShoppingCart } from 'lucide-react';

interface Booking {
      _id: string;
      accountNumber: string;
      clientName: string;
      eventDate: string;
      paymentStatus: 'paid' | 'partial' | 'unpaid' | string;
      bookingType?: string;
      assignedSpace?: string;
      guestCount?: number;
}

interface Props {
      bookings: Booking[];
}

// Calendar grid component
export default function CalendarGrid({ bookings }: Props) {
      const [currentDate, setCurrentDate] = useState(new Date());
      const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
      const [isModalOpen, setIsModalOpen] = useState(false);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

// ── Get bookings for the current month ──
      const monthBookings = useMemo(() => {
            return bookings.filter((b) => {
                  const d = new Date(b.eventDate);
                  return d.getFullYear() === year && d.getMonth() === month;
      });
      }, [bookings, year, month]);

// ── Build calendar grid ──
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

      const getDayBookings = (day: number) => {
            return monthBookings.filter((b) => {
                  const d = new Date(b.eventDate);
                  return d.getDate() === day;
            });
      };

// ── Navigation ──
      const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
      const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
      const goToToday = () => setCurrentDate(new Date());

// ── Date formatting ──
      const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Status colors ──
      const getStatusColor = (status: string) => {
            switch (status) {
                  case 'paid': return 'bg-emerald-500';
                  case 'partial': return 'bg-amber-500';
                  default: return 'bg-red-500';
            }
      };

      const getStatusLabel = (status: string) => {
            switch (status) {
                  case 'paid': return 'Paid';
                  case 'partial': return 'Partial';
                  default: return 'Unpaid';
            }
      };

      const getTypeIcon = (type?: string) => {
            switch (type) {
                  case 'lease': return <FileText className="w-3 h-3" />;
                  case 'market-booth': return <ShoppingCart className="w-3 h-3" />;
                  default: return <PartyPopper className="w-3 h-3" />;
            }
      };

// ── Open modal ──
      const openModal = (booking: Booking) => {
            setSelectedBooking(booking);
            setIsModalOpen(true);
      };

      const closeModal = () => {
            setIsModalOpen(false);
            setSelectedBooking(null);
      };

      return (
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
            
{/* ── Header ── */}
            <div className="px-6 py-4 border-b border-[#e5e7eb] bg-[#f9fafb] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                        <button
                              onClick={prevMonth}
                              className="p-2 hover:bg-[#f3f4f6] rounded-md transition"
                              aria-label="Previous month"
                        >
                        <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
                        </button>
                        <h2 className="text-lg font-light tracking-wide text-gray-900">
                              {monthNames[month]} {year}
                        </h2>
                        <button
                              onClick={nextMonth}
                              className="p-2 hover:bg-[#f3f4f6] rounded-md transition"
                              aria-label="Next month"
                        >
                        <ChevronRight className="w-5 h-5 text-[#6b7280]" />
                        </button>
                  </div>
                  <button
                        onClick={goToToday}
                        className="px-4 py-1.5 rounded-md border border-[#e5e7eb] hover:bg-[#f3f4f6] transition text-sm text-[#6b7280]"
                  >
                        Today
                  </button>
            </div>

{/* ── Day headers ── */}
      <div className="grid grid-cols-7 gap-px bg-[#e5e7eb]">
            {dayNames.map((day) => (
            <div
                  key={day}
                  className="py-2 text-center text-xs font-semibold text-[#6b7280] uppercase tracking-wider bg-[#f3f4f6]"
            >
                  {day}
            </div>
            ))}
            </div>

{/* ── Calendar grid ── */}
            <div className="grid grid-cols-7 gap-px bg-[#e5e7eb]">
                  {/* Empty days before the 1st */}
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div
                        key={`empty-${i}`}
                        className="bg-white min-h-25 p-1"
                  />
                  ))}

{/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayBookings = getDayBookings(day);
            const isToday = new Date().getDate() === day &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

            return (
                  <div
                        key={day}
                        className="bg-white min-h-25 p-1.5 transition hover:bg-[#f9fafb]"
                        style={isToday ? { boxShadow: 'inset 0 0 0 2px var(--admin-primary)' } : {}}
                  >
                  <span
                    className="text-sm font-medium px-2 py-0.5 rounded-full inline-block"
                    style={isToday ? { background: 'var(--admin-primary)', color: '#fff' } : { color: '#111827' }}
                  >
                        {day}
                  </span>

{/* Event dots */}
                  <div className="mt-1 space-y-0.5">
                        {dayBookings.slice(0, 3).map((b) => (
                              <button
                                    key={b._id}
                                    onClick={() => openModal(b)}
                                    className="w-full text-left text-xs truncate flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#f3f4f6] transition"
                              >
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(b.paymentStatus)}`} />
                                    <span className="text-[#6b7280] truncate">
                                          {getTypeIcon(b.bookingType)} {b.clientName}
                                    </span>
                              </button>
                  ))}
                  {dayBookings.length > 3 && (
                        <div className="text-[10px] text-[#6b7280] pl-1.5">
                              +{dayBookings.length - 3} more
                        </div>
                  )}
                  </div>
                  </div>
                  );
                  })}
      </div>

{/* ── Legend ── */}
      <div className="px-6 py-3 border-t border-[#e5e7eb] bg-[#f9fafb] flex flex-wrap items-center gap-4 text-xs text-[#6b7280]">
            <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
            Paid
            </span>
            <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
            Partial
            </span>
            <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
            Unpaid
            </span>
            <span className="flex items-center gap-1.5 ml-4">
                  <PartyPopper className="w-3 h-3" /> Party
            </span>
            <span className="flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> Lease
            </span>
            <span className="flex items-center gap-1.5">
                  <ShoppingCart className="w-3 h-3" /> Market
            </span>
            <span className="ml-auto text-[#6b7280]">
                  {monthBookings.length} events this month
            </span>
      </div>

{/* ── Modal ── */}
      {isModalOpen && selectedBooking && (
            <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                  onClick={closeModal}
            >
            <div
                  className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
            >
            <div className="flex justify-between items-start mb-4">
                  <div>
                        <h3 className="text-xl font-light tracking-wide">{selectedBooking.clientName}</h3>
                        <p className="text-sm text-[#6b7280]">{selectedBooking.accountNumber}</p>
                  </div>
                  <button
                        onClick={closeModal}
                        className="p-1 hover:bg-[#f3f4f6] rounded-md transition"
                  >
                        <X className="w-5 h-5 text-[#6b7280]" />
                  </button>
            </div>

            <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-[#f3f4f6]">
                        <span className="text-[#6b7280]">Date</span>
                        <span className="text-[#111827]">
                              {new Date(selectedBooking.eventDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                        })}
                        </span>
                  </div>
            <div className="flex justify-between py-1.5 border-b border-[#f3f4f6]">
                  <span className="text-[#6b7280]">Time</span>
                  <span className="text-[#111827]">
                        {new Date(selectedBooking.eventDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        })}
                  </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#f3f4f6]">
                  <span className="text-[#6b7280]">Type</span>
                  <span className="text-[#111827]">
                        <span className="flex items-center gap-1.5">
                          {selectedBooking.bookingType === 'lease' ? <><FileText className="w-3.5 h-3.5" /> Lease</> :
                          selectedBooking.bookingType === 'market-booth' ? <><ShoppingCart className="w-3.5 h-3.5" /> Market Booth</> :
                          <><PartyPopper className="w-3.5 h-3.5" /> Party / Event</>}
                        </span>
                  </span>
            </div>
            {selectedBooking.assignedSpace && (
                  <div className="flex justify-between py-1.5 border-b border-[#f3f4f6]">
                        <span className="text-[#6b7280]">Space</span>
                        <span className="text-[#111827] font-mono">{selectedBooking.assignedSpace}</span>
                  </div>
            )}
            <div className="flex justify-between py-1.5 border-b border-[#f3f4f6]">
                  <span className="text-[#6b7280]">Guests</span>
                  <span className="text-[#111827]">{selectedBooking.guestCount || '—'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#f3f4f6]">
                  <span className="text-[#6b7280]">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        selectedBooking.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : selectedBooking.paymentStatus === 'partial'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                              {getStatusLabel(selectedBooking.paymentStatus)}
                  </span>
            </div> 
            </div>

            <div className="mt-6 flex gap-3">
                  <a
                        href={`/admin/edit/${selectedBooking._id}?from=calendar`}
                        className="flex-1 text-center px-4 py-2 rounded-md btn-primary transition text-sm"
                  >
                        Edit Booking
                  </a>
                  <button
                        onClick={closeModal}
                        className="px-4 py-2 rounded-md border border-[#e5e7eb] hover:bg-[#f3f4f6] transition text-sm"
                  >
                        Close
                  </button>
            </div>
      </div>
      </div>
      )}
      </div>
);
}