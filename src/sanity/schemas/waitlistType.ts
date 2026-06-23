import { defineType, defineField } from 'sanity';

export const waitlistType = defineType({
  name: 'waitlist',
  type: 'document',
  title: 'Waitlist',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Name', validation: (Rule: any) => Rule.required() }),
    defineField({ name: 'email', type: 'string', title: 'Email', validation: (Rule: any) => Rule.required().email() }),
    defineField({ name: 'status', type: 'string', title: 'Status', options: { list: [{title:'Pending',value:'pending'},{title:'Converted',value:'converted'}] } }),
  ],
});
