import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();
    const doc = await sanityClient.patch(params.id!).set(body).commit();
    return new Response(JSON.stringify(doc), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    await sanityClient.delete(params.id!);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
