// src/pages/api/admin/spaces/[id].ts
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../lib/sanity';

// PUT: Update a space or Restore a space
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing space ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();

    // ---- RESTORE action ----
    if (body.action === 'restore') {
      const updated = await sanityClient.patch(id)
        .set({
          isArchived: false,
          archivedAt: null,
        })
        .commit();
      return new Response(JSON.stringify(updated), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ---- Normal update ----
    const { code, name, type, capacity, isAvailable, notes } = body;
    const updateData: Record<string, any> = {};
    if (code !== undefined) updateData.code = code;
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await sanityClient.patch(id).set(updateData).commit();

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to update space' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE: Archive (soft-delete) a space
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing space ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();
    const archived = await sanityClient.patch(id)
      .set({
        isArchived: true,
        archivedAt: now,
      })
      .commit();

    return new Response(JSON.stringify(archived), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to archive space' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};