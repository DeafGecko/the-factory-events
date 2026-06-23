import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { bookingType } from './src/sanity/schemas/bookingType';
import { subscriberType } from './src/sanity/schemas/subscriberType';
import { waitlistType } from './src/sanity/schemas/waitlistType';
import { settingsType } from './src/sanity/schemas/settingsType';

export default defineConfig({
  title: 'Event Planner CMS',
  projectId: process.env.SANITY_PROJECT_ID || 'maowljqt',
  dataset: process.env.SANITY_DATASET || 'production',
  plugins: [deskTool()],
  schema: {
    types: [bookingType, subscriberType, waitlistType, settingsType],
  },
});
