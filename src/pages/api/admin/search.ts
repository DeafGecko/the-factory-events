// GET /api/admin/search?q=... — global search across clients, bookings, vendors, tenants, staff
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../lib/sanity';

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q')?.trim();
  if (!q || q.length < 2) return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });

  const pattern = `*${q}*`;

  const [bookings, clients, vendors, tenants, staff] = await Promise.all([
    sanityClient.fetch(
      `*[_type == "booking" && (clientName match $p || accountNumber match $p)] | order(_createdAt desc)[0..4]
       { _id, clientName, accountNumber, eventDate, eventType }`,
      { p: pattern }
    ),
    sanityClient.fetch(
      `*[_type == "client" && (name match $p || email match $p || accountNumber match $p)][0..4]
       { _id, name, email, accountNumber }`,
      { p: pattern }
    ),
    sanityClient.fetch(
      `*[_type == "vendor" && (name match $p || email match $p || accountNumber match $p)][0..4]
       { _id, name, email, accountNumber }`,
      { p: pattern }
    ),
    sanityClient.fetch(
      `*[_type == "tenant" && (name match $p || email match $p || accountNumber match $p)][0..4]
       { _id, name, email, accountNumber }`,
      { p: pattern }
    ),
    sanityClient.fetch(
      `*[_type == "staff" && (name match $p || email match $p || department match $p)][0..4]
       { _id, name, role, department, email }`,
      { p: pattern }
    ),
  ]);

  const results = [
    ...(bookings || []).map((r: any) => ({ type: 'booking', label: r.clientName, sub: `${r.eventType || 'Booking'} · ${r.eventDate || ''}`, href: `/admin/edit/${r._id}`, acct: r.accountNumber })),
    ...(clients || []).map((r: any)  => ({ type: 'client',  label: r.name,       sub: r.email || '',            href: `/admin/clients`,        acct: r.accountNumber })),
    ...(vendors || []).map((r: any)  => ({ type: 'vendor',  label: r.name,       sub: r.email || '',            href: `/admin/vendors`,        acct: r.accountNumber })),
    ...(tenants || []).map((r: any)  => ({ type: 'tenant',  label: r.name,       sub: r.email || '',            href: `/admin/tenants`,        acct: r.accountNumber })),
    ...(staff   || []).map((r: any)  => ({ type: 'staff',   label: r.name,       sub: `${r.role || ''} ${r.department ? '· ' + r.department : ''}`.trim(), href: `/admin/staff`, acct: '' })),
  ];

  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
};
