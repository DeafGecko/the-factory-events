import { defineType, defineField } from 'sanity';

export const tenant = defineType({
  name: 'tenant',
  type: 'document',
  title: 'Tenant',
  fields: [
    defineField({ name: 'accountNumber', type: 'string', title: 'Account Number', readOnly: true }),
    defineField({ name: 'name', type: 'string', title: 'Name' }),
    defineField({ name: 'email', type: 'string', title: 'Email' }),
    defineField({ name: 'phone', type: 'string', title: 'Phone' }),
    defineField({ name: 'businessType', type: 'string', title: 'Business Type' }),
    defineField({ name: 'unit', type: 'string', title: 'Unit / Space' }),
    defineField({ name: 'leaseStart', type: 'date', title: 'Lease Start' }),
    defineField({ name: 'leaseEnd', type: 'date', title: 'Lease End' }),
    defineField({ name: 'rentAmount', type: 'number', title: 'Monthly Rent ($)' }),
    defineField({ name: 'status', type: 'string', title: 'Status', options: { list: ['active', 'pending', 'expired'] } }),
  ],
  preview: { select: { title: 'name', subtitle: 'unit' } },
});