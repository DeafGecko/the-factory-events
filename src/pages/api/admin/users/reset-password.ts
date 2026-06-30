// src/pages/api/admin/users/reset-password.ts
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';
import { hashPassword, generateToken } from '../../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
      try {
            const { userId } = await request.json();
            if (!userId) return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400 });

            const user = await sanityClient.fetch(`*[_type == "adminUser" && _id == $id][0]`, { id: userId });
            if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });

            const tempPassword = generateToken().slice(0, 12); // 12 char random
            const hash = await hashPassword(tempPassword);
            await sanityClient.patch(userId).set({ passwordHash: hash }).commit();

// In production, send email. For now, log to console.
            console.log(`Temporary password for ${user.email}: ${tempPassword}`);
            return new Response(JSON.stringify({ success: true, message: 'Password reset email sent' }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
            });
      } catch (error: any) {
            console.error('Reset password error:', error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }
};