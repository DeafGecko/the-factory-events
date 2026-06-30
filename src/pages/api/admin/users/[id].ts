// src/pages/api/admin/users/[id].ts
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });

    const body = await request.json();
    const updateData: any = {};
    if ('role' in body) updateData.role = body.role;
    if ('isActive' in body) updateData.isActive = body.isActive;

    const updated = await sanityClient.patch(id).set(updateData).commit();
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

// DELETE is not used (we use block/unblock via PUT)