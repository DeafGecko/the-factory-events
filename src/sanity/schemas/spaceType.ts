// src/sanity/schemas/spaceType.ts
import { defineType, defineField } from 'sanity';

export const spaceType = defineType({
      name: 'space',
      type: 'document',
      title: 'Space',
      fields: [
      defineField({
            name: 'code',
            type: 'string',
            title: 'Space Code',
            description: 'e.g., P089, FM056, L203',
            validation: (Rule) => Rule.required().regex(/^[A-Z]{1,2}\d{3}$/, {
                  name: 'space code',
                  invert: false,
            }),
      }),
      defineField({
            name: 'name',
            type: 'string',
            title: 'Space Name',
            description: 'e.g., Main Ballroom, Booth 12',
      }),
      defineField({
            name: 'type',
            type: 'string',
            title: 'Space Type',
            options: {
            list: [
                  { title: 'Party Room', value: 'party' },
                  { title: 'Farm Market Booth', value: 'market' },
                  { title: 'Lease / Rental', value: 'lease' },
            ],
            },
            validation: (Rule) => Rule.required(),
      }),
      defineField({
            name: 'capacity',
            type: 'number',
            title: 'Capacity (people)',
      }),
      defineField({
            name: 'isAvailable',
            type: 'boolean',
            title: 'Is Available',
            initialValue: true,
            description: 'Uncheck to mark as under maintenance or temporarily unavailable.',
      }),
      defineField({
            name: 'isArchived',
            type: 'boolean',
            title: 'Is Archived',
            initialValue:false,
            description: 'Archived spaces are hidden from normal views but can be restored.',
      }),
      defineField({
            name: 'archivedAt',
            type: 'datetime',
            title: 'Archived At',
            description: 'When the space was archived (soft-deleted).',
            hidden: ({ parent }) => !parent?.isArchived,
      }),
      defineField({
            name: 'notes',
            type: 'text',
            title: 'Notes',
            description: 'Any special notes about this space.',
      }),
      ],
      preview: {
            select: {
                  title: 'code',
                  subtitle: 'name',
            },
      },
      orderings: [
      {
            title: 'Code (A–Z)',
            name: 'codeAsc',
            by: [{ field: 'code', direction: 'asc' }],
      },
      ],
});