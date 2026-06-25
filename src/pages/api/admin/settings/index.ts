// src/pages/api/admin/settings/index.ts
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../lib/sanity';

const SETTINGS_ID = 'siteSettings'; // fixed document ID

// GET: fetch settings (create if missing)
export const GET: APIRoute = async () => {
      try {
            let settings = await sanityClient.fetch(`*[_type == "settings" && _id == $id][0]`, { id: SETTINGS_ID });
      if (!settings) {
      // Create default settings if none exist
            settings = await sanityClient.create({
                  _id: SETTINGS_ID,
                  _type: 'settings',
                  venueName: 'Event Planner',
                  primaryColor: '#A03A3A',
                  secondaryColor: '#B05040',
                  accentColor: '#D4C4A8',
                  backgroundColor: '#F5F3EF',
                  textColor: '#2A1A0E',
                  sidebarColor: '#1A1816',
                  contactEmail: '',
                  contactPhone: '',
                  address: '',
                  bookingFee: 0,
                  taxRate: 0,
                  depositPercentage: 25,
                  fontFamily: 'Inter, system-ui, sans-serif',
            });
      }
    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch settings' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PUT: update settings
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const updated = await sanityClient
      .patch(SETTINGS_ID)
      .set(body)
      .commit();
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to update settings' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};