// src/sanity/schemas/adminUser.ts
import { defineType, defineField } from 'sanity';

export const adminUser = defineType({
  name: 'adminUser',
  type: 'document',
  title: 'Admin User',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Full Name', validation: Rule => Rule.required() }),
    defineField({ name: 'email', type: 'string', title: 'Email', validation: Rule => Rule.required().email() }),
    defineField({ name: 'passwordHash', type: 'string', title: 'Password Hash', hidden: true }),
    defineField({ name: 'role', type: 'string', title: 'Role', options: { list: [{title: 'Admin', value: 'admin'}, {title: 'Developer', value: 'developer'}, {title: 'Manager', value: 'manager'}, {title: 'Viewer', value: 'viewer'}] }, initialValue: 'viewer' }),
    defineField({ name: 'isActive', type: 'boolean', title: 'Active', initialValue: false }),
    defineField({ name: 'inviteToken', type: 'string', title: 'Invite Token', hidden: true }),
    defineField({ name: 'inviteTokenExpiry', type: 'datetime', title: 'Invite Token Expiry', hidden: true }),
    defineField({ name: 'invitedBy', type: 'reference', to: [{ type: 'adminUser' }], title: 'Invited By' }),
    defineField({ name: 'invitedAt', type: 'datetime', title: 'Invited At', initialValue: () => new Date().toISOString() }),
    defineField({ name: 'acceptedAt', type: 'datetime', title: 'Accepted At' }),
    defineField({ name: 'resetToken', type: 'string', title: 'Reset Token', hidden: true }),
    defineField({ name: 'resetTokenExpiry', type: 'datetime', title: 'Reset Token Expiry', hidden: true }),
  ],
  preview: { select: { title: 'name', subtitle: 'email' } },
});