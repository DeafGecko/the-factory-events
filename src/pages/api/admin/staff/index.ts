import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';
import { generateAccountNumber } from '../../../../lib/accountNumber';

export const GET: APIRoute = async () => {
  const staff = await sanityClient.fetch(
    `*[_type == "staff"] | order(name asc) {
      _id, accountNumber, name, role, email, phone, department,
      status, scheduleType, workDays, shiftStart, shiftEnd, notes, startDate, createdAt
    }`
  );
  return new Response(JSON.stringify(staff), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const accountNumber = await generateAccountNumber();
    const doc = await sanityClient.create({
      _type: 'staff',
      accountNumber,
      ...body,
      createdAt: new Date().toISOString(),
    });
    return new Response(JSON.stringify(doc), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
