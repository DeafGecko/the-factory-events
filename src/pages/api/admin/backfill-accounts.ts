// src/pages/api/admin/backfill-accounts.ts
// Assigns account numbers to any existing records that are missing one.
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../lib/sanity';
import { generateAccountNumber } from '../../../lib/accountNumber';

export const POST: APIRoute = async () => {
  try {
    const types = ['booking', 'tenant', 'client', 'vendor'];
    let patched = 0;

    for (const type of types) {
      const records = await sanityClient.fetch<{ _id: string }[]>(
        `*[_type == $type && !defined(accountNumber)]{ _id }`,
        { type }
      );

      for (const record of records) {
        const accountNumber = await generateAccountNumber();
        await sanityClient.patch(record._id).set({ accountNumber }).commit();
        patched++;
      }
    }

    return new Response(JSON.stringify({ patched }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
