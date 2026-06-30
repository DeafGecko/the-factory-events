// src/pages/api/admin/qr-scans.ts
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../lib/sanity';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const DB = (locals as any).runtime?.env?.DB;

    if (!DB) {
      return new Response(
        JSON.stringify({ error: 'D1 database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const scans = await DB.prepare(
      `SELECT
        id,
        sanity_event_id,
        scanned_by,
        scanned_at,
        datetime(scanned_at, 'unixepoch', 'localtime') as scanned_at_local
      FROM qr_scans
      ORDER BY scanned_at DESC
      LIMIT 500`
    ).all();

    const enrichedScans = [];
    for (const scan of scans.results || []) {
      let eventDetails = null;
      if (scan.sanity_event_id) {
        try {
          eventDetails = await sanityClient.fetch(
            `*[_type == "booking" && _id == $id][0]{ _id, clientName, accountNumber, eventDate }`,
            { id: scan.sanity_event_id }
          );
        } catch (_) {}
      }
      enrichedScans.push({ ...scan, event: eventDetails });
    }

    return new Response(
      JSON.stringify({ success: true, total: enrichedScans.length, scans: enrichedScans }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ QR Scan API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch QR scans' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
