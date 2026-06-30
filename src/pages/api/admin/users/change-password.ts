// src/pages/api/admin/users/change-password.ts
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';
import { verifyPassword, hashPassword } from '../../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get the current admin session (assume we store admin ID in cookie)
    const adminId = cookies.get('adminId')?.value;
    if (!adminId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'Current password and new password (min 6 chars) required' }), { status: 400 });
    }

    // Fetch the admin user
    const admin = await sanityClient.fetch(`*[_type == "adminUser" && _id == $id][0]`, { id: adminId });
    if (!admin || !admin.isActive) {
      return new Response(JSON.stringify({ error: 'User not found or inactive' }), { status: 404 });
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, admin.passwordHash);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Current password is incorrect' }), { status: 400 });
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    // Update password
    await sanityClient.patch(adminId).set({ passwordHash: newHash }).commit();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('❌ Change password error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to change password' }), { status: 500 });
  }
};