// src/components/admin/QRCodesManager.tsx
import { useState, useEffect, useRef } from 'react';
import { Plus, RefreshCw, Users, ChevronDown, ChevronUp, Download, Copy, Trash2, QrCode, Check, Search } from 'lucide-react';

interface Booking {
  _id: string;
  clientName: string;
  accountNumber: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
}

interface QREntry {
  id: string;
  booking_id: string;
  token: string;
  created_at: number;
  deadline: number | null;
  rsvp_count: number;
  total_guests: number;
  booking: Booking | null;
}

interface RSVP {
  id: string;
  guest_name: string;
  party_size: number;
  notes: string | null;
  submitted_at: number;
}

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

export default function QRCodesManager() {
  const [qrCodes, setQrCodes] = useState<QREntry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rsvps, setRsvps] = useState<Record<string, RSVP[]>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [bookingSearch, setBookingSearch] = useState('');
  const [deadline, setDeadline] = useState('');
  const qrCanvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [qrRes, bookingRes] = await Promise.all([
        fetch('/api/admin/event-qr'),
        fetch('/api/admin/bookings'),
      ]);
      if (qrRes.ok) setQrCodes(await qrRes.json());
      if (bookingRes.ok) {
        const data = await bookingRes.json();
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // Render QR codes into canvases after load
  useEffect(() => {
    qrCodes.forEach(qr => renderQR(qr.token));
  }, [qrCodes]);

  const renderQR = async (token: string) => {
    const canvas = qrCanvasRefs.current[token];
    if (!canvas) return;
    try {
      const QRCode = (await import('qrcode')).default;
      await QRCode.toCanvas(canvas, `${BASE_URL}/rsvp/${token}`, {
        width: 180, margin: 2,
        color: { dark: '#1f2937', light: '#ffffff' },
      });
    } catch (_) {}
  };

  const handleGenerate = async () => {
    const match = availableBookings[0];
    if (!match) { alert('No matching booking found. Try a different name.'); return; }
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/event-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: match._id, deadline: deadline || match.eventDate }),
      });
      if (res.ok) { await fetchAll(); setBookingSearch(''); setDeadline(''); }
      else { const d = await res.json(); alert(d.error); }
    } finally { setGenerating(false); }
  };

  const loadRsvps = async (token: string) => {
    if (rsvps[token]) return;
    const res = await fetch(`/api/admin/event-qr/${token}/rsvps`);
    if (res.ok) {
      const data = await res.json();
      setRsvps(prev => ({ ...prev, [token]: data }));
    }
  };

  const toggleExpand = async (token: string) => {
    if (expanded === token) { setExpanded(null); return; }
    setExpanded(token);
    await loadRsvps(token);
  };

  const deleteRsvp = async (token: string, id: string) => {
    if (!confirm('Remove this RSVP?')) return;
    await fetch(`/api/admin/event-qr/${token}/rsvps`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setRsvps(prev => ({ ...prev, [token]: (prev[token] || []).filter(r => r.id !== id) }));
    setQrCodes(prev => prev.map(q => q.token === token
      ? { ...q, rsvp_count: q.rsvp_count - 1, total_guests: q.total_guests - ((rsvps[token]?.find(r => r.id === id)?.party_size) || 0) }
      : q
    ));
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${BASE_URL}/rsvp/${token}`);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadQR = (token: string, name: string) => {
    const canvas = qrCanvasRefs.current[token];
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Bookings that don't already have a QR code
  const existingBookingIds = new Set(qrCodes.map(q => q.booking_id));
  const availableBookings = bookings.filter(b =>
    !existingBookingIds.has(b._id) &&
    (!bookingSearch.trim() || b.clientName.toLowerCase().includes(bookingSearch.toLowerCase()))
  );

  const formatDate = (d: string) => d
    ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  if (loading) return (
    <div className="flex items-center justify-center py-12 text-[#9ca3af]">
      <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading…
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Generate panel */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <QrCode className="w-4 h-4 text-[#6b7280] shrink-0" />
          <div className="relative flex-1 min-w-36">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search client name…"
              value={bookingSearch}
              onChange={e => setBookingSearch(e.target.value)}
              className="h-8 w-full pl-8 pr-3 border border-[#e5e7eb] rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#374151]"
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <label className="text-[0.6rem] text-[#9ca3af] uppercase tracking-wider whitespace-nowrap">RSVP Deadline</label>
            <input
              type="date"
              title="RSVP deadline"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="h-8 px-2 border border-[#e5e7eb] rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#374151]"
            />
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!bookingSearch.trim() || availableBookings.length === 0 || generating}
            className="h-8 flex items-center gap-1.5 px-4 rounded-md btn-primary text-xs disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {generating ? 'Generating…' : 'Generate QR'}
          </button>
        </div>
        <p className="text-[0.65rem] text-[#9ca3af] mt-2">Deadline defaults to the event date if not set. Guests cannot RSVP after the deadline.</p>
        {availableBookings.length === 0 && bookings.length > 0 && (
          <p className="text-xs text-[#9ca3af] mt-1">All bookings already have a QR code.</p>
        )}
      </div>

      {/* QR list */}
      {qrCodes.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm py-12 text-center text-[#9ca3af]">
          <QrCode className="w-10 h-10 mx-auto mb-2 text-[#e5e7eb]" />
          <p className="text-xs">No QR codes yet. Generate one above for a booking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {qrCodes.map(qr => {
            const rsvpList = rsvps[qr.token] || [];
            const isOpen = expanded === qr.token;
            const rsvpUrl = `${BASE_URL}/rsvp/${qr.token}`;
            const isExpired = qr.deadline ? Math.floor(Date.now() / 1000) > qr.deadline : false;
            const deadlineLabel = qr.deadline
              ? new Date(qr.deadline * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : null;

            return (
              <div key={qr.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isExpired ? 'border-[#f3f4f6] opacity-60' : 'border-[#e5e7eb]'}`}>
                {/* QR card header */}
                <div className="p-4 flex gap-4 flex-wrap">
                  {/* QR canvas */}
                  <div className="shrink-0">
                    <canvas
                      ref={el => { qrCanvasRefs.current[qr.token] = el; if (el) renderQR(qr.token); }}
                      className="rounded-md border border-[#e5e7eb]"
                      width={180} height={180}
                    />
                    <div className="flex gap-1 mt-1.5">
                      <button onClick={() => downloadQR(qr.token, qr.booking?.clientName || 'event')}
                        className="flex-1 h-7 flex items-center justify-center gap-1 border border-[#e5e7eb] rounded text-[0.6rem] text-[#6b7280] hover:bg-[#f3f4f6] transition">
                        <Download className="w-3 h-3" /> Download
                      </button>
                      <button onClick={() => copyLink(qr.token)}
                        className="flex-1 h-7 flex items-center justify-center gap-1 border border-[#e5e7eb] rounded text-[0.6rem] text-[#6b7280] hover:bg-[#f3f4f6] transition">
                        {copied === qr.token ? <><Check className="w-3 h-3 text-emerald-600" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Link</>}
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#111827]">{qr.booking?.clientName || 'Unknown Booking'}</p>
                          {isExpired
                            ? <span className="px-1.5 py-0.5 rounded text-[0.6rem] font-semibold bg-red-50 text-red-600 border border-red-200">Expired</span>
                            : deadlineLabel && <span className="px-1.5 py-0.5 rounded text-[0.6rem] font-medium bg-[#f3f4f6] text-[#6b7280]">Deadline {deadlineLabel}</span>
                          }
                        </div>
                        <p className="text-xs text-[#6b7280] mt-0.5">
                          {qr.booking?.eventType && <span className="capitalize">{qr.booking.eventType} · </span>}
                          {formatDate(qr.booking?.eventDate || '')}
                          {qr.booking?.accountNumber && <span className="text-[#9ca3af]"> · #{qr.booking.accountNumber}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex gap-4 mt-3">
                      <div className="text-center">
                        <p className="text-xl font-bold text-[#111827]">{qr.total_guests}</p>
                        <p className="text-[0.6rem] text-[#9ca3af] uppercase tracking-wider">Total Guests</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-[#111827]">{qr.rsvp_count}</p>
                        <p className="text-[0.6rem] text-[#9ca3af] uppercase tracking-wider">RSVPs</p>
                      </div>
                      {qr.booking?.guestCount && (
                        <div className="text-center">
                          <p className={`text-xl font-bold ${qr.total_guests > qr.booking.guestCount ? 'text-red-600' : 'text-emerald-600'}`}>
                            {qr.booking.guestCount}
                          </p>
                          <p className="text-[0.6rem] text-[#9ca3af] uppercase tracking-wider">Expected</p>
                        </div>
                      )}
                    </div>

                    {/* RSVP link */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[0.6rem] text-[#9ca3af] uppercase tracking-wider">RSVP Link</span>
                      <code className="text-[0.65rem] text-[#374151] bg-[#f3f4f6] px-2 py-0.5 rounded truncate max-w-xs">{rsvpUrl}</code>
                    </div>

                    {/* Guest list toggle */}
                    <button
                      onClick={() => toggleExpand(qr.token)}
                      className="mt-3 flex items-center gap-1 text-xs text-[#374151] hover:text-[#111827] transition"
                    >
                      <Users className="w-3.5 h-3.5" />
                      {isOpen ? 'Hide' : 'View'} Guest List
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Guest list */}
                {isOpen && (
                  <div className="border-t border-[#e5e7eb]">
                    {rsvpList.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-[#9ca3af]">No RSVPs yet — share the QR code or link with guests.</div>
                    ) : (
                      <>
                        <div className="px-4 py-2 bg-[#f9fafb] flex items-center justify-between">
                          <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af]">Guest List</span>
                          <span className="text-[0.6rem] text-[#9ca3af]">{qr.total_guests} people total</span>
                        </div>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#f3f4f6]">
                              {['Name', 'Party Size', 'Notes', 'Submitted', ''].map(h => (
                                <th key={h} className="text-left px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f3f4f6]">
                            {rsvpList.map(r => (
                              <tr key={r.id} className="hover:bg-[#fafafa]">
                                <td className="px-3 py-2 text-xs font-medium text-[#111827]">{r.guest_name}</td>
                                <td className="px-3 py-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    {r.party_size} {r.party_size === 1 ? 'person' : 'people'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-xs text-[#6b7280]">{r.notes || '—'}</td>
                                <td className="px-3 py-2 text-xs text-[#9ca3af]">
                                  {new Date(r.submitted_at * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </td>
                                <td className="px-3 py-2">
                                  <button onClick={() => deleteRsvp(qr.token, r.id)}
                                    className="p-1 text-[#9ca3af] hover:text-red-500 hover:bg-red-50 rounded transition">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
