import type { D1Database } from '@cloudflare/workers-types';

// For use inside Astro pages / API routes (Astro v6+)
export async function getDB(): Promise<D1Database | undefined> {
  try {
    // Dynamic import to avoid bundling issues
    const { env } = await import('cloudflare:workers');
    return env.DB;
  } catch {
    // 'cloudflare:workers' is only available when running with the Cloudflare adapter
    return undefined;
  }
}

// For use inside Cloudflare Functions (if you ever use them)
export function getDBFromEnv(env: any): D1Database {
  return env.DB;
}