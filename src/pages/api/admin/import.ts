// src/pages/api/admin/import.ts
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../lib/sanity';
import Papa from 'papaparse';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string;

    if (!file || !entityType) {
      return new Response(
        JSON.stringify({ error: 'File and entity type are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const text = await file.text();
    const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });

    // Only abort on fatal parse errors (non-field errors)
    const fatalErrors = result.errors.filter((e: Papa.ParseError) => e.type !== 'FieldMismatch');
    if (fatalErrors.length) {
      return new Response(
        JSON.stringify({ error: 'CSV parsing error: ' + fatalErrors[0].message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rows = result.data;
    let imported = 0;
    let failed = 0;
    const errors: any[] = [];

    // ── Process based on entity type ──
    for (const row of rows) {
      try {
        switch (entityType) {
          case 'clients':
            await sanityClient.create({
              _type: 'client',
              name: row.name,
              email: row.email,
              phone: row.phone,
              address: row.address,
              company: row.company,
            });
            imported++;
            break;

          case 'tenants':
            await sanityClient.create({
              _type: 'tenant',
              name: row.name,
              email: row.email,
              phone: row.phone,
              leaseStart: row.lease_start,
              leaseEnd: row.lease_end,
              unit: row.unit,
            });
            imported++;
            break;

          case 'vendors':
            await sanityClient.create({
              _type: 'vendor',
              name: row.name,
              contact: row.contact,
              email: row.email,
              phone: row.phone,
              serviceType: row.service_type,
            });
            imported++;
            break;

          case 'bookings':
            // For bookings, we need to find or create a client reference
            let clientRef = null;
            if (row.email) {
              const existing = await sanityClient.fetch(
                `*[_type == "client" && email == $email][0]`,
                { email: row.email }
              );
              if (existing) {
                clientRef = { _ref: existing._id, _type: 'reference' };
              }
            }

            await sanityClient.create({
              _type: 'booking',
              clientName: row.client_name,
              email: row.email,
              phone: row.phone || '',
              eventDate: row.event_date,
              eventType: row.event_type || 'other',
              guestCount: parseInt(row.guest_count) || 50,
              assignedSpace: row.space_code || '',
              totalPrice: parseFloat(row.total_price) || 0,
              amountPaid: parseFloat(row.total_price) || 0,
              paymentStatus: row.payment_status || 'unpaid',
              // reference to client if exists
              client: clientRef,
            });
            imported++;
            break;

          case 'waitlist':
            await sanityClient.create({
              _type: 'waitlist',
              name: row.name,
              email: row.email,
              phone: row.phone || '',
              eventType: row.event_type || '',
              date: row.date || '',
              guests: parseInt(row.guests) || 0,
              status: row.status || 'pending',
            });
            imported++;
            break;

          case 'spaces':
            await sanityClient.create({
              _type: 'space',
              code: row.code,
              name: row.name || '',
              type: row.type || 'party',
              capacity: parseInt(row.capacity) || 0,
              isAvailable: row.is_available?.toLowerCase() === 'true',
            });
            imported++;
            break;

          case 'bills': {
            const booking = await sanityClient.fetch(
              `*[_type == "booking" && email == $email][0]`,
              { email: row.client_email }
            );
            if (booking) {
              const paidAmount = parseFloat(row.paid) || 0;
              const total = parseFloat(row.amount) || 0;
              const status = row.status || (paidAmount >= total ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid');
              await sanityClient
                .patch(booking._id)
                .set({ amountPaid: paidAmount, paymentStatus: status, totalPrice: total })
                .commit();
              imported++;
            } else {
              failed++;
              errors.push({ row, error: 'No booking found for email: ' + row.client_email });
            }
            break;
          }

          default:
            throw new Error(`Unknown entity type: ${entityType}`);
        }
      } catch (err: any) {
        failed++;
        errors.push({ row, error: err.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        imported,
        failed,
        errors: errors.slice(0, 10),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ Import error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Import failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};