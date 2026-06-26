// src/sanity/schemas/settingsType.ts
import { defineType, defineField } from 'sanity';

export const settingsType = defineType({
      name: 'settings',
      type: 'document',
      title: 'Site Settings',
      fields: [
// ── Branding ──
      defineField({ 
            name: 'venueName', 
            type: 'string', 
            title: 'Venue Name' 
      }),
      defineField({ 
            name: 'logo', 
            type: 'image', 
            title: 'Logo' 
      }),
            
// ── Colors ──
      defineField({ 
            name: 'primaryColor', 
            type: 'string', 
            title: 'Primary Color (Hex)', 
            initialValue: '#A03A3A' 
      }),
      defineField({ 
            name: 'secondaryColor', 
            type: 'string', 
            title: 'Secondary Color (Hex)', 
            initialValue: '#B05040' }),
      defineField({ 
            name: 'accentColor', 
            type: 'string', 
            title: 'Accent Color (Hex)', 
            initialValue: '#D4C4A8' 
      }),
      defineField({ 
            name: 'backgroundColor', 
            type: 'string', 
            title: 'Background Color (Hex)', 
            initialValue: '#F5F3EF' 
      }),
      defineField({ 
            name: 'textColor', 
            type: 'string', 
            title: 'Text Color (Hex)', 
            initialValue: '#2A1A0E' 
      }),
      defineField({ 
            name: 'sidebarColor', 
            type: 'string', 
            title: 'Sidebar Color (Hex)', 
            initialValue: '#1A1816' 
      }),

// ── Theme Preference (NEW) ──
      defineField({
            name: 'themePreference',
            type: 'string',
            title: 'Default Theme',
            options: {
                  list: [
                        { title: 'Light', value: 'light' },
                        { title: 'Dark', value: 'dark' },
                        { title: 'High Contrast', value: 'high-contrast' },
                  ],
            },
            initialValue: 'light',
      }),
      
// ── Contact ──
      defineField({ name: 'contactEmail', type: 'string', title: 'Contact Email' 

      }),
      defineField({ 
            name: 'contactPhone', 
            type: 'string', 
            title: 'Contact Phone' 
      }),
      defineField({ 
            name: 'address', 
            type: 'text', 
            title: 'Venue Address' 
      }),
      
// ── Financial ──
      defineField({ 
            name: 'bookingFee', 
            type: 'number', 
            title: 'Booking Fee ($)', 
            initialValue: 0 
      }),
      defineField({ 
            name: 'taxRate', 
            type: 'number', 
            title: 'Tax Rate (%)', 
            initialValue: 0 
      }),
      defineField({ 
            name: 'depositPercentage', 
            type: 'number', 
            title: 'Deposit Percentage (%)', 
            initialValue: 25 
      }),
      
// ── Font ──
      defineField({ 
            name: 'fontFamily', 
            type: 'string', 
            title: 'Font Family', 
            initialValue: 'Inter, system-ui, sans-serif' 
      }),
      ],
      preview: { select: { 
            title: 'venueName' 
      } },
});