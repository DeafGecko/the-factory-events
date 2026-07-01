import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
    cloudflareModules: true,
    imageService: 'passthrough',
  }),
  integrations: [react()],
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: 'polyfill-message-channel',
        generateBundle(_opts, bundle) {
          // Inject MessageChannel polyfill at the top of the renderers chunk
          for (const [name, chunk] of Object.entries(bundle)) {
            if (chunk.type === 'chunk' && name.includes('@astro-renderers')) {
              chunk.code =
                `if (typeof MessageChannel === 'undefined') { globalThis.MessageChannel = class MessageChannel { constructor() { this.port1 = { onmessage: null, postMessage: (d) => this.port2?.onmessage?.({ data: d }) }; this.port2 = { onmessage: null, postMessage: (d) => this.port1?.onmessage?.({ data: d }) }; } }; }\n` +
                chunk.code;
            }
          }
        },
      },
    ],
  },
});