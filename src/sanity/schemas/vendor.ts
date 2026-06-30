import { defineType, defineField } from 'sanity';

export const vendor = defineType({
  name: 'vendor',
  type: 'document',
  title: 'Vendor',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Name' }),
    defineField({ name: 'contact', type: 'string', title: 'Contact Person' }),
    defineField({ name: 'email', type: 'string', title: 'Email' }),
    defineField({ name: 'phone', type: 'string', title: 'Phone' }),
    defineField({ name: 'serviceType', type: 'string', title: 'Service Type' }),
  ],
  preview: { select: { title: 'name', subtitle: 'serviceType' } },
});