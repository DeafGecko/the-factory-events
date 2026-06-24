// src/pages/api/admin/spaces/index.ts
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';

// GET: List all spaces
export const GET: APIRoute = async ({ url }) => {
  try {
    const includeArchived = url.searchParams.get('includeArchived') === 'true';
  // Determine the filter based on includeArchived
    const filter = includeArchived
      ? `*[_type == "space"]`
      : `*[_type == "space" && isArchived != true]`;
  // Fetch spaces based on the filter
    const spaces = await sanityClient.fetch(`
      ${filter} | order(code asc) {
        _id,
        code,
        name,
        type,
        capacity,
        isAvailable,
        isArchived,
        archivedAt,
        notes,
        _createdAt,
        _updatedAt
      }
    `);
  // Return the fetched spaces
    return new Response(JSON.stringify(spaces), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  // If an error occurs, return a 500 response
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch spaces' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Create a new space
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { code, name, type, capacity, isAvailable, notes } = body;
    // Validate required fields
    if (!code || !type) {
      return new Response(
        JSON.stringify({ error: 'Code and type are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if code already exists
    const existing = await sanityClient.fetch(
      `*[_type == "space" && code == $code][0]`,
      { code }
    );
    // If the space already exists, return a 409 response
    if (existing) {
      return new Response(
        JSON.stringify({ error: `Space "${code}" already exists` }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Create the new space
    const newSpace = await sanityClient.create({
      _type: 'space',
      code,
      name: name || '',
      type,
      capacity: capacity || 0,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      notes: notes || '',
    });
    // Return the newly created space
    return new Response(JSON.stringify(newSpace), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
    // If an error occurs, return a 500 response
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create space' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};