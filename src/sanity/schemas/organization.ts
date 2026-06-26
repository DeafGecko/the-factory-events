// src/sanity/schemas/organization.ts
export const organization = defineType({
      name: 'organization',
      type: 'document',
      title: 'Organization',
      fields: [
            defineField({ name: 'name', type: 'string', title: 'Venue Name' }),
            defineField({ name: 'slug', type: 'slug', title: 'Slug' }),
            defineField({ name: 'logo', type: 'image', title: 'Logo' }),
            defineField({ name: 'primaryColor', type: 'string', title: 'Primary Color' }),
            defineField({ name: 'secondaryColor', type: 'string', title: 'Secondary Color' }),
            defineField({ name: 'accentColor', type: 'string', title: 'Accent Color' }),
            defineField({ name: 'fontFamily', type: 'string', title: 'Font Family' }),
            defineField({ name: 'stripeAccountId', type: 'string', title: 'Stripe Account ID' }),
            defineField({ name: 'domain', type: 'string', title: 'Custom Domain' }),
            // ... other settings
      ],
});