import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';
import { generateAccountNumber } from '../../../../lib/accountNumber';

export const GET: APIRoute = async () => {
  const vendors = await sanityClient.fetch(
    `*[_type == "vendor"] | order(name asc) { _id, accountNumber, name, contact, email, phone, serviceType }`
  );
  return new Response(JSON.stringify(vendors), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const accountNumber = await generateAccountNumber();
    const doc = await sanityClient.create({ _type: 'vendor', accountNumber, ...body });
    return new Response(JSON.stringify(doc), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
