// src/lib/email.ts
// ... existing code ...

interface PasswordResetEmailParams {
  to: string;
  name: string;
  resetUrl: string;
  venueName: string;
}

export async function sendPasswordResetEmail({ to, name, resetUrl, venueName }: PasswordResetEmailParams) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e8e4dc; border-radius: 8px;">
      <h2>Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>You requested a password reset for your ${venueName} admin account.</p>
      <p>Click the link below to set a new password:</p>
      <p><a href="${resetUrl}" style="display: inline-block; background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, you can ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e8e4dc; margin: 20px 0;" />
      <p style="color: #888; font-size: 12px;">${venueName} · Venue Operations</p>
    </div>
  `;

  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: import.meta.env.EMAIL_FROM || 'noreply@venueops.com',
    to,
    subject: `Password Reset for ${venueName}`,
    html,
  });

  if (error) {
    console.error('Password reset email error:', error);
    throw new Error('Failed to send password reset email.');
  }
}