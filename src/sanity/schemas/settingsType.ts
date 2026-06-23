import { defineType, defineField } from 'sanity';

export const settingsType = defineType({
  name: 'settings',
  type: 'document',
  title: 'Settings',
  fields: [
    defineField({ name: 'venueName', type: 'string', title: 'Venue Name' }),
    defineField({ name: 'primaryColor', type: 'string', title: 'Primary Color' }),
    defineField({ name: 'contactEmail', type: 'string', title: 'Contact Email' }),
  ],
});
