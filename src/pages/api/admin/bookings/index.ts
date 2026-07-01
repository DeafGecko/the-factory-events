// GET /api/admin/bookings – list all bookings for dropdowns
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';

export const GET: APIRoute = async () => {
  const bookings = await sanityClient.fetch(
    `*[_type == "booking"] | order(eventDate desc) { _id, clientName, accountNumber, eventDate, eventType, guestCount }`
  );
  return new Response(JSON.stringify(bookings), {
    headers: { 'Content-Type': 'application/json' },
  });
};
