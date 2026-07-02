// GET  /api/rsvp/[token] – fetch event info for the RSVP page
// POST /api/rsvp/[token] – submit a guest RSVP
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../lib/sanity';

export const GET: APIRoute = async ({ params, locals }) => {
  const DB = (locals as any).runtime?.env?.DB;
  if (!DB) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 500 });

  const { token } = params;
  const qr = await DB.prepare(
    `SELECT * FROM event_qr_codes WHERE token = ?`
  ).bind(token).first();

  if (!qr) return new Response(JSON.stringify({ error: 'Invalid link' }), { status: 404 });

  let booking = null;
  try {
    booking = await sanityClient.fetch(
      `*[_type == "booking" && _id == $id][0]{ _id, clientName, accountNumber, eventDate, eventType, startTime, endTime, guestCount }`,
      { id: qr.booking_id }
    );
  } catch (_) {}

  if (!booking) return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });

  const expired = qr.deadline ? Math.floor(Date.now() / 1000) > qr.deadline : false;

  return new Response(JSON.stringify({ token, booking, expired, deadline: qr.deadline ?? null }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const DB = (locals as any).runtime?.env?.DB;
  if (!DB) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 500 });

  const { token } = params;
  const qr = await DB.prepare(
    `SELECT * FROM event_qr_codes WHERE token = ?`
  ).bind(token).first();
  if (!qr) return new Response(JSON.stringify({ error: 'Invalid link' }), { status: 404 });

  if (qr.deadline && Math.floor(Date.now() / 1000) > qr.deadline) {
    return new Response(JSON.stringify({ error: 'RSVP deadline has passed for this event.' }), { status: 410 });
  }

  const { guestName, partySize, notes } = await request.json();
  if (!guestName?.trim()) return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400 });
  if (!partySize || partySize < 1) return new Response(JSON.stringify({ error: 'Party size must be at least 1' }), { status: 400 });

  const id = crypto.randomUUID();
  await DB.prepare(
    `INSERT INTO rsvp_registrations (id, qr_token, booking_id, guest_name, party_size, notes, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, unixepoch())`
  ).bind(id, token, qr.booking_id, guestName.trim(), partySize, notes?.trim() || null).run();

  return new Response(JSON.stringify({ success: true }), { status: 201 });
};
