// GET /api/admin/event-qr/[token]/rsvps – list all RSVPs for a QR token
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const DB = (locals as any).runtime?.env?.DB;
  if (!DB) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 500 });

  const { token } = params;
  const rows = await DB.prepare(
    `SELECT id, guest_name, party_size, notes, submitted_at
     FROM rsvp_registrations WHERE qr_token = ?
     ORDER BY submitted_at ASC`
  ).bind(token).all();

  return new Response(JSON.stringify(rows.results || []), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const DB = (locals as any).runtime?.env?.DB;
  if (!DB) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 500 });

  const { id } = await request.json();
  await DB.prepare(`DELETE FROM rsvp_registrations WHERE id = ?`).bind(id).run();
  return new Response(JSON.stringify({ success: true }));
};
