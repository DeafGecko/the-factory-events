import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';
import { hashPassword } from '../../../../lib/auth';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const token = formData.get('token')?.toString();
    const newPassword = formData.get('password')?.toString();
    const confirmPassword = formData.get('confirmPassword')?.toString();

    if (!token || !newPassword || !confirmPassword) {
      return redirect('/admin/reset-password?error=All fields are required&token=' + token);
    }
    if (newPassword.length < 6) {
      return redirect('/admin/reset-password?error=Password must be at least 6 characters&token=' + token);
    }
    if (newPassword !== confirmPassword) {
      return redirect('/admin/reset-password?error=Passwords do not match&token=' + token);
    }

    // Find user by token and check expiry
    const user = await sanityClient.fetch(
      `*[_type == "adminUser" && resetToken == $token && isActive == true][0]`,
      { token }
    );

    if (!user) {
      return redirect('/admin/reset-password?error=Invalid or expired token');
    }

    // Check expiry
    if (new Date(user.resetTokenExpiry) < new Date()) {
      return redirect('/admin/reset-password?error=Token has expired');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user and clear token fields
    await sanityClient
      .patch(user._id)
      .set({
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .commit();

    return redirect('/admin/login?reset=success');
  } catch (error: any) {
    console.error('Reset password error:', error);
    return redirect('/admin/reset-password?error=Something went wrong');
  }
};