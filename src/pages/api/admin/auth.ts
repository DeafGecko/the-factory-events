// src/pages/api/admin/auth.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, redirect }) => {
      const formData = await request.formData();
      const password = formData.get('password');

      const adminPassword = import.meta.env.ADMIN_PASSWORD || 'admin123';

      if (password === adminPassword) {
// Set cookie and redirect to dashboard
            const headers = new Headers();
            headers.append(
                  'Set-Cookie',
                  'admin_session=authenticated; Path=/admin; HttpOnly; Max-Age=86400'
            );
            headers.append('Location', '/admin/dashboard');
            return new Response(null, { status: 302, headers });
      } else {
            return redirect('/admin/login?error=1');
      }
};