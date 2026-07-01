// src/sanity/schemas/staff.ts
export default {
  name: 'staff',
  title: 'Staff',
  type: 'document',
  fields: [
    { name: 'accountNumber', title: 'Account #', type: 'string', readOnly: true },
    { name: 'name',          title: 'Full Name',  type: 'string' },
    { name: 'role',          title: 'Role',       type: 'string', options: { list: ['employee', 'volunteer', 'contractor', 'manager'] } },
    { name: 'email',         title: 'Email',      type: 'string' },
    { name: 'phone',         title: 'Phone',      type: 'string' },
    { name: 'department',    title: 'Department', type: 'string' },
    { name: 'status',        title: 'Status',     type: 'string', options: { list: ['active', 'inactive', 'on-call'] }, initialValue: 'active' },
    { name: 'scheduleType',  title: 'Schedule',   type: 'string', options: { list: ['full-time', 'part-time', 'on-call', 'volunteer'] } },
    { name: 'workDays',      title: 'Work Days',  type: 'array', of: [{ type: 'string' }], options: { list: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] } },
    { name: 'shiftStart',    title: 'Shift Start', type: 'string' },
    { name: 'shiftEnd',      title: 'Shift End',   type: 'string' },
    { name: 'notes',         title: 'Notes',       type: 'text' },
    { name: 'startDate',     title: 'Start Date',  type: 'date' },
    { name: 'createdAt',     title: 'Created At',  type: 'datetime' },
  ],
};
