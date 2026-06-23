import { createClient, type SanityClient } from '@sanity/client';

// This runs on the server, so we can use the token safely
export const sanityClient: SanityClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID || 'vvffv1bl',
  dataset: import.meta.env.SANITY_DATASET || 'production',
  apiVersion: '2024-12-30',
  useCdn: false,
  token: import.meta.env.SANITY_API_TOKEN || '',
});
