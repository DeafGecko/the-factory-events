// src/pages/api/admin/users/invite.ts
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';
import { generateToken, getTokenExpiry } from '../../../../lib/auth';
import { sendInviteEmail } from '../../../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, role = 'viewer' } = body;

    if (!name || !email) {
      return new Response(JSON.stringify({ error: 'Name and email are required' }), { status: 400 });
    }

    // Check if user already exists
    const existing = await sanityClient.fetch(
      `*[_type == "adminUser" && email == $email][0]`,
      { email }
    );
    if (existing) {
      return new Response(JSON.stringify({ error: 'User with this email already exists' }), { status: 409 });
    }

    const token = generateToken();
    const expiry = getTokenExpiry();

    const newUser = await sanityClient.create({
      _type: 'adminUser',
      name,
      email,
      role,
      isActive: false,
      inviteToken: token,
      inviteTokenExpiry: expiry,
      invitedAt: new Date().toISOString(),
    });

    // Build invite URL (replace with your actual domain)
    const baseUrl = import.meta.env.PUBLIC_BASE_URL || 'http://localhost:4321';
    const inviteUrl = `${baseUrl}/admin/set-password?token=${token}`;

    // Send email (requires Resend configured)
    await sendInviteEmail({
      to: email,
      name,
      inviteUrl,
      inviterName: 'Admin', // Replace with actual inviter name later
      venueName: 'Venue Operations',
    });

    return new Response(JSON.stringify({ success: true, userId: newUser._id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('❌ Invite error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send invitation' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};