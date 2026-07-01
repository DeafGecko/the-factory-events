import type { APIRoute } from 'astro';
import { createClient } from '@sanity/client';
import { generateAccountNumber } from '../../lib/accountNumber';

// TEMPORARY: Hardcode your Sanity credentials for testing
const sanityClient = createClient({
  projectId: 'maowljqt',
  dataset: 'production',
  apiVersion: '2024-12-30',
  useCdn: false,
  token: 'skQU5fh9qMVHMXBEY4kuxZtrbCl4mTvfYqxBsXByrruUseL7ermec36O7RVOf1m4tmKoGAD50d7WGBn3JMS135tpCDhzJrkuPEOv8worEoPjLPmwK26UEQ0a67EdfQRCqItA5UsKohBZYka0xr25tyX89blfMbM0uIwAiGsavN53lSp0ncFK',
});

export const POST: APIRoute = async ({ request }) => {
  console.log('===== API ROUTE CALLED =====');
  try {
    const formData = await request.json();
    console.log('Received data:', formData);

    const accountNumber = await generateAccountNumber();

    console.log('Creating booking with account:', accountNumber);
    const booking = await sanityClient.create({
      _type: 'booking',
      accountNumber,
      ...formData,
      eventDate: formData.eventDate || undefined,
      guestCount: Number(formData.guestCount),
      totalPrice: Number(formData.guestCount) * 15,
      amountPaid: 0,
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
    });
    console.log('Booking created:', booking._id);

    return new Response(
      JSON.stringify({ success: true, id: booking._id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ ERROR in API route:', error);
    console.error('Error message:', error.message);
    console.error('Error details:', error.response?.body || error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error',
        details: error.response?.body || 'No additional details'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};