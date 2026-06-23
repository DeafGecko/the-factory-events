import { defineType, defineField } from 'sanity';

export const subscriberType = defineType({
  name: 'subscriber',
  type: 'document',
  title: 'Subscriber',
  fields: [
    defineField({ name: 'email', type: 'string', title: 'Email', validation: (Rule: any) => Rule.required().email() }),
    defineField({ name: 'name', type: 'string', title: 'Name' }),
    defineField({ name: 'active', type: 'boolean', title: 'Active', initialValue: true }),
  ],
});
