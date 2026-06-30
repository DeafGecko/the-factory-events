// src/pages/api/admin/users/index.ts
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';

export const GET: APIRoute = async () => {
      try {
      const users = await sanityClient.fetch(`
            *[_type == "adminUser"] {
            _id,
            name,
            email,
            role,
            isActive
            }
      `);
            return new Response(JSON.stringify(users), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
            });
      } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }   
};