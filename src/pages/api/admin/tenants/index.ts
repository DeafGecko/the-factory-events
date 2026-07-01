import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';
import { generateAccountNumber } from '../../../../lib/accountNumber';

export const GET: APIRoute = async () => {
  const tenants = await sanityClient.fetch(
    `*[_type == "tenant"] | order(name asc) { _id, accountNumber, name, email, phone, unit, leaseStart, leaseEnd, rentAmount, status, businessType }`
  );
  return new Response(JSON.stringify(tenants), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const accountNumber = await generateAccountNumber();
    const doc = await sanityClient.create({ _type: 'tenant', accountNumber, ...body });
    return new Response(JSON.stringify(doc), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
