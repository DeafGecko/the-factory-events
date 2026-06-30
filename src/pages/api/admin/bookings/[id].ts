// src/pages/api/admin/bookings/[id].ts
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';

// PUT: Update a booking
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing booking ID' }), { status: 400 });
    }

    const body = await request.json();
    const { clientName, email, phone, eventDate, eventType, bookingType, assignedSpace, spaceType, guestCount, totalPrice, amountPaid, paymentStatus, notes } = body;

    const updateData: Record<string, any> = {};
    if (clientName !== undefined) updateData.clientName = clientName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (eventDate !== undefined) updateData.eventDate = eventDate;
    if (eventType !== undefined) updateData.eventType = eventType;
    if (bookingType !== undefined) updateData.bookingType = bookingType;
    if (assignedSpace !== undefined) updateData.assignedSpace = assignedSpace;
    if (spaceType !== undefined) updateData.spaceType = spaceType;
    if (guestCount !== undefined) updateData.guestCount = guestCount;
    if (totalPrice !== undefined) updateData.totalPrice = totalPrice;
    if (amountPaid !== undefined) updateData.amountPaid = amountPaid;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    await sanityClient.patch(id).set(updateData).commit();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('❌ PUT /api/admin/bookings/[id] error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to update booking' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE: Delete a booking
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing booking ID' }), { status: 400 });
    }

    await sanityClient.delete(id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('❌ DELETE /api/admin/bookings/[id] error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to delete booking' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};