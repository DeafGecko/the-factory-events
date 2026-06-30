import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { bookingType } from './src/sanity/schemas/bookingType';
import { subscriberType } from './src/sanity/schemas/subscriberType';
import { waitlistType } from './src/sanity/schemas/waitlistType';
import { settingsType } from './src/sanity/schemas/settingsType';
import { spaceType } from './src/sanity/schemas/spaceType';
import { adminUser } from './src/sanity/schemas/adminUser'; 

export default defineConfig({
  title: 'Event Planner CMS',
  projectId: process.env.SANITY_PROJECT_ID || 'vvffv1bl',
  dataset: process.env.SANITY_DATASET || 'production',
  plugins: [deskTool()],
  schema: {
    types: [
      bookingType,
      subscriberType,
      waitlistType,
      settingsType,
      spaceType, 
      adminUser,  // ← ADD THIS
    ],
  },
});