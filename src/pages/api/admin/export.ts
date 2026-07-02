import type { APIRoute } from 'astro';
import { sanityClient } from '../../../lib/sanity';

function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ].join('\n');
}

export const GET: APIRoute = async ({ url }) => {
  const type = url.searchParams.get('type');

  try {
    let rows: Record<string, any>[] = [];

    switch (type) {
      case 'clients':
        rows = await sanityClient.fetch(
          `*[_type == "client"] | order(name asc) {
            accountNumber, name, email, phone, address, company, createdAt
          }`
        );
        break;

      case 'vendors':
        rows = await sanityClient.fetch(
          `*[_type == "vendor"] | order(name asc) {
            accountNumber, name, contact, email, phone, serviceType, status, createdAt
          }`
        );
        break;

      case 'tenants':
        rows = await sanityClient.fetch(
          `*[_type == "tenant"] | order(name asc) {
            accountNumber, name, email, phone, unit, businessType, leaseStart, leaseEnd, rentAmount, status, createdAt
          }`
        );
        break;

      case 'bookings':
        rows = await sanityClient.fetch(
          `*[_type == "booking"] | order(eventDate desc) {
            accountNumber, clientName, email, phone, eventDate, eventType, bookingType,
            assignedSpace, spaceType, guestCount, totalPrice, amountPaid, paymentStatus, notes, createdAt
          }`
        );
        break;

      case 'staff':
        rows = await sanityClient.fetch(
          `*[_type == "staff"] | order(name asc) {
            accountNumber, name, email, phone, role, department, status, scheduleType,
            workDays, shiftStart, shiftEnd, startDate, notes, createdAt
          }`
        );
        break;

      case 'bills':
        rows = await sanityClient.fetch(
          `*[_type == "booking"] | order(eventDate desc) {
            accountNumber, clientName, email, eventDate, totalPrice, amountPaid, paymentStatus
          }`
        );
        break;

      case 'waitlist':
        rows = await sanityClient.fetch(
          `*[_type == "waitlist"] | order(_createdAt desc) {
            name, email, phone, eventType, date, guests, status, _createdAt
          }`
        );
        break;

      default:
        return new Response(JSON.stringify({ error: 'Unknown entity type' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
    }

    const csv = toCSV(rows);
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}_export.csv"`,
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
