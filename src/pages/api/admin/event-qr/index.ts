// GET  /api/admin/event-qr          – list all QR codes with RSVP totals
// POST /api/admin/event-qr          – generate a QR code for a booking
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';

function randomToken() {
  return crypto.randomUUID().replace(/-/g, '');
}

export const GET: APIRoute = async ({ locals }) => {
  const DB = (locals as any).runtime?.env?.DB;
  if (!DB) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 500 });

  const rows = await DB.prepare(
    `SELECT q.id, q.booking_id, q.token, q.created_at, q.deadline,
       COUNT(r.id) as rsvp_count,
       COALESCE(SUM(r.party_size), 0) as total_guests
     FROM event_qr_codes q
     LEFT JOIN rsvp_registrations r ON r.qr_token = q.token
     GROUP BY q.id
     ORDER BY q.created_at DESC`
  ).all();

  const qrCodes = [];
  for (const row of rows.results || []) {
    let booking = null;
    try {
      booking = await sanityClient.fetch(
        `*[_type == "booking" && _id == $id][0]{ _id, clientName, accountNumber, eventDate, eventType, guestCount }`,
        { id: row.booking_id }
      );
    } catch (_) {}
    qrCodes.push({ ...row, booking });
  }

  return new Response(JSON.stringify(qrCodes), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const DB = (locals as any).runtime?.env?.DB;
  if (!DB) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 500 });

  const { bookingId, deadline } = await request.json();
  if (!bookingId) return new Response(JSON.stringify({ error: 'bookingId required' }), { status: 400 });

  // deadline is an ISO date string (YYYY-MM-DD); store as unix timestamp (end of that day)
  let deadlineTs: number | null = null;
  if (deadline) {
    const d = new Date(deadline + 'T23:59:59Z');
    if (!isNaN(d.getTime())) deadlineTs = Math.floor(d.getTime() / 1000);
  }

  // One QR per booking — return existing if already created
  const existing = await DB.prepare(
    `SELECT * FROM event_qr_codes WHERE booking_id = ?`
  ).bind(bookingId).first();
  if (existing) return new Response(JSON.stringify(existing), { headers: { 'Content-Type': 'application/json' } });

  const id = crypto.randomUUID();
  const token = randomToken();
  await DB.prepare(
    `INSERT INTO event_qr_codes (id, booking_id, token, created_at, deadline) VALUES (?, ?, ?, unixepoch(), ?)`
  ).bind(id, bookingId, token, deadlineTs).run();

  return new Response(JSON.stringify({ id, booking_id: bookingId, token, deadline: deadlineTs }), {
    status: 201, headers: { 'Content-Type': 'application/json' },
  });
};
