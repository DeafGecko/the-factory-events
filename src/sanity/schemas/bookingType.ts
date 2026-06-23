import { defineType, defineField } from 'sanity';

export const bookingType = defineType({
  name: 'booking',
  type: 'document',
  title: 'Booking',
  fields: [
    defineField({ name: 'accountNumber', type: 'string', title: 'Account Number' }),
    defineField({ name: 'clientName', type: 'string', title: 'Client Name', validation: (Rule: any) => Rule.required() }),
    defineField({ name: 'email', type: 'string', title: 'Email', validation: (Rule: any) => Rule.required().email() }),
    defineField({ name: 'phone', type: 'string', title: 'Phone' }),
    defineField({ name: 'eventType', type: 'string', title: 'Event Type', options: { list: [{title:'Wedding',value:'wedding'},{title:'Corporate',value:'corporate'},{title:'Birthday',value:'birthday'},{title:'Conference',value:'conference'},{title:'Other',value:'other'}] } }),
    defineField({ name: 'eventDate', type: 'date', title: 'Event Date', validation: (Rule: any) => Rule.required() }),
    defineField({ name: 'startTime', type: 'string', title: 'Start Time' }),
    defineField({ name: 'endTime', type: 'string', title: 'End Time' }),
    defineField({ name: 'guestCount', type: 'number', title: 'Guests' }),
    defineField({ name: 'notes', type: 'text', title: 'Additional Notes' }),
    defineField({ name: 'totalPrice', type: 'number', title: 'Total Price' }),
    defineField({ name: 'amountPaid', type: 'number', title: 'Amount Paid' }),
    defineField({ name: 'paymentStatus', type: 'string', title: 'Payment Status', options: { list: [{title:'Unpaid',value:'unpaid'},{title:'Paid',value:'paid'}] } }),
    defineField({ name: 'createdAt', type: 'datetime', title: 'Created At' }),
  ],
  preview: { select: { title: 'clientName' } },
});
