// src/pages/api/admin/auth.ts
import type { APIRoute } from 'astro';
import { sanityClient } from '../../../lib/sanity';
import { verifyPassword } from '../../../lib/auth';

function sessionCookie(role: string) {
  return `admin_session=authenticated:${role}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return redirect('/admin/login?error=1');
  }

  // ── Super-admin fallback (env-based, full access) ──
  const superAdminEmail = (import.meta.env.SUPER_ADMIN_EMAIL || 'admin@venue.com').toLowerCase();
  const superAdminPassword = import.meta.env.ADMIN_PASSWORD;
  if (superAdminPassword && email === superAdminEmail && password === superAdminPassword) {
    return new Response(null, {
      status: 302,
      headers: {
        'Set-Cookie': sessionCookie('admin'),
        'Location': '/admin/dashboard',
      },
    });
  }

  // ── Sanity adminUser lookup ──
  try {
    const user = await sanityClient.fetch(
      `*[_type == "adminUser" && email == $email && isActive == true][0]{ _id, passwordHash, role }`,
      { email }
    );

    if (!user || !user.passwordHash) {
      return redirect('/admin/login?error=1');
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return redirect('/admin/login?error=1');
    }

    return new Response(null, {
      status: 302,
      headers: {
        'Set-Cookie': sessionCookie(user.role || 'viewer'),
        'Location': '/admin/dashboard',
      },
    });
  } catch {
    return redirect('/admin/login?error=1');
  }
};
