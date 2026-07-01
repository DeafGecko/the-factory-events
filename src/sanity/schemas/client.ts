import { defineType, defineField } from 'sanity';

export const client = defineType({
  name: 'client',
  type: 'document',
  title: 'Client',
  fields: [
    defineField({ name: 'accountNumber', type: 'string', title: 'Account Number', readOnly: true }),
    defineField({ name: 'name', type: 'string', title: 'Full Name' }),
    defineField({ name: 'email', type: 'string', title: 'Email' }),
    defineField({ name: 'phone', type: 'string', title: 'Phone' }),
    defineField({ name: 'address', type: 'text', title: 'Address' }),
    defineField({ name: 'company', type: 'string', title: 'Company' }),
  ],
  preview: { select: { title: 'name', subtitle: 'email' } },
});