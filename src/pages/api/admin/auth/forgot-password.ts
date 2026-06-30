import type { APIRoute } from 'astro';
import { sanityClient } from '../../../../lib/sanity';
import { generateToken, getTokenExpiry } from '../../../../lib/auth';
import { sendPasswordResetEmail } from '../../../../lib/email';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString().trim();

    if (!email) {
      return redirect('/admin/forgot-password?error=Email is required');
    }

    // Find admin user
    const user = await sanityClient.fetch(
      `*[_type == "adminUser" && email == $email && isActive == true][0]`,
      { email }
    );

    if (!user) {
      // Don't reveal if user exists – generic message for security
      return redirect('/admin/forgot-password?success=1');
    }

    // Generate reset token and expiry (1 hour)
    const token = generateToken();
    const expiry = getTokenExpiry(1); // 1 hour

    await sanityClient
      .patch(user._id)
      .set({
        resetToken: token,
        resetTokenExpiry: expiry,
      })
      .commit();

    // Send email
    const baseUrl = import.meta.env.PUBLIC_BASE_URL || 'http://localhost:4321';
    const resetUrl = `${baseUrl}/admin/reset-password?token=${token}`;

    await sendPasswordResetEmail({
      to: email,
      name: user.name,
      resetUrl,
      venueName: 'Venue Operations', // could fetch from settings
    });

    return redirect('/admin/forgot-password?success=1');
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return redirect('/admin/forgot-password?error=Something went wrong');
  }
};