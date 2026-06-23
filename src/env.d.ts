/// <reference types="@astrojs/cloudflare" />

type CloudflareEnv = import('@astrojs/cloudflare').Runtime<import('../wrangler.toml').Env>;

declare module 'cloudflare:workers' {
  export const env: CloudflareEnv;
}
