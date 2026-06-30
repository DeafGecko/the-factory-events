import { defineMiddleware } from 'astro:middleware';

const PUBLIC_PATHS = ['/admin/login', '/api/admin/auth'];

// API routes that mutate data — restricted to admin/manager only
const WRITE_API_PATHS = [
  '/api/admin/users',
  '/api/admin/import',
  '/api/admin/bookings',
  '/api/admin/settings',
];

export const onRequest = defineMiddleware(async ({ request, cookies, redirect }, next) => {
  const url = new URL(request.url);

  if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api/admin')) {
    return next();
  }

  if (PUBLIC_PATHS.some((p) => url.pathname.startsWith(p))) {
    return next();
  }

  const session = cookies.get('admin_session');
  const sessionValue = session?.value ?? '';

  if (!sessionValue.startsWith('authenticated:')) {
    return redirect('/admin/login');
  }

  const role = sessionValue.split(':')[1]; // admin | manager | developer | viewer

  // Write API routes: only admin and manager
  const isWriteApi = request.method !== 'GET' &&
    WRITE_API_PATHS.some((p) => url.pathname.startsWith(p));

  if (isWriteApi && role !== 'admin' && role !== 'manager') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Login management page: admin only
  if (url.pathname.startsWith('/admin/login-management') && role !== 'admin') {
    return redirect('/admin/dashboard');
  }

  const response = await next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
});
