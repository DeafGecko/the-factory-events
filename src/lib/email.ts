// src/lib/email.ts
import { Resend } from 'resend';

interface InviteEmailParams {
  to: string;
  name: string;
  inviteUrl: string;
  inviterName: string;
  venueName: string;
}

export async function sendInviteEmail({ to, name, inviteUrl, inviterName, venueName }: InviteEmailParams) {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');

  const resend = new Resend(apiKey);
  const fromEmail = import.meta.env.FROM_EMAIL || 'onboarding@resend.dev';

  const { error } = await resend.emails.send({
    from: `${venueName} <${fromEmail}>`,
    to,
    subject: `You've been invited to ${venueName} Admin`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
        <h2 style="font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Admin Invitation</h2>
        <p>Hi ${name},</p>
        <p>${inviterName} has invited you to access the <strong>${venueName}</strong> admin panel.</p>
        <p>Click the button below to set your password and activate your account. This link expires in 48 hours.</p>
        <a href="${inviteUrl}" style="display:inline-block; margin: 24px 0; padding: 12px 24px; background:#333; color:#fff; text-decoration:none; border-radius:6px; font-size:14px;">
          Set Password &amp; Activate Account
        </a>
        <p style="color:#888; font-size:12px;">If you didn't expect this invitation, you can ignore this email.</p>
        <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />
        <p style="color:#aaa; font-size:11px;">${venueName} · Admin Panel</p>
      </div>
    `,
  });

  if (error) throw new Error(`Email send failed: ${error.message}`);
}

interface PasswordResetEmailParams {
  to: string;
  name: string;
  resetUrl: string;
  venueName: string;
}

export async function sendPasswordResetEmail({ to, name, resetUrl, venueName }: PasswordResetEmailParams) {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');

  const resend = new Resend(apiKey);
  const fromEmail = import.meta.env.FROM_EMAIL || 'onboarding@resend.dev';

  const { error } = await resend.emails.send({
    from: `${venueName} <${fromEmail}>`,
    to,
    subject: `Password Reset for ${venueName}`,
    html: `
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
    `,
  });

  if (error) throw new Error(`Email send failed: ${error.message}`);
}
