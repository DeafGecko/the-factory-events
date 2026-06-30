import { defineType, defineField } from 'sanity';

export const tenant = defineType({
  name: 'tenant',
  type: 'document',
  title: 'Tenant',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Name' }),
    defineField({ name: 'email', type: 'string', title: 'Email' }),
    defineField({ name: 'phone', type: 'string', title: 'Phone' }),
    defineField({ name: 'leaseStart', type: 'date', title: 'Lease Start' }),
    defineField({ name: 'leaseEnd', type: 'date', title: 'Lease End' }),
    defineField({ name: 'unit', type: 'string', title: 'Unit' }),
  ],
  preview: { select: { title: 'name', subtitle: 'unit' } },
});