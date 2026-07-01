// src/components/admin/StaffTable.tsx
import { useState } from 'react';
import { Plus, X, Search, Pencil, Trash2, RefreshCw, Phone, Mail } from 'lucide-react';

interface StaffMember {
  _id: string;
  accountNumber?: string;
  name: string;
  role?: string;
  email: string;
  phone?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'on-call';
  scheduleType?: string;
  workDays?: string[];
  shiftStart?: string;
  shiftEnd?: string;
  notes?: string;
  startDate?: string;
}

const ROLES = ['employee', 'volunteer', 'contractor', 'manager'];
const SCHEDULE_TYPES = ['full-time', 'part-time', 'on-call', 'volunteer'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const empty = (): Omit<StaffMember, '_id'> => ({
  name: '', role: 'employee', email: '', phone: '', department: '',
  status: 'active', scheduleType: 'full-time', workDays: [],
  shiftStart: '09:00', shiftEnd: '17:00', notes: '', startDate: '',
});

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="block text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af] mb-0.5">{children}</span>
);
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className={`w-full border border-[#e5e7eb] rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151] ${p.className ?? ''}`} />
);
const Select = ({ children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...p} className="w-full border border-[#e5e7eb] rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151] bg-white">{children}</select>
);

const statusStyle: Record<string, string> = {
  active:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]',
  'on-call': 'bg-amber-50 text-amber-700 border-amber-200',
};

const roleStyle: Record<string, string> = {
  manager:    'bg-purple-50 text-purple-700 border-purple-200',
  employee:   'bg-blue-50 text-blue-700 border-blue-200',
  contractor: 'bg-orange-50 text-orange-700 border-orange-200',
  volunteer:  'bg-teal-50 text-teal-700 border-teal-200',
};

export default function StaffTable() {
  const [staff, setStaff]             = useState<StaffMember[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterRole, setFilterRole]   = useState('all');
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState<StaffMember | null>(null);
  const [form, setForm]               = useState(empty());
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      if (!res.ok) throw new Error('Failed to load');
      setStaff(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useState(() => { fetchStaff(); });

  const openAdd = () => { setEditing(null); setForm(empty()); setError(null); setShowModal(true); };
  const openEdit = (s: StaffMember) => {
    setEditing(s);
    setForm({
      name: s.name, role: s.role || 'employee', email: s.email, phone: s.phone || '',
      department: s.department || '', status: s.status || 'active',
      scheduleType: s.scheduleType || 'full-time', workDays: s.workDays || [],
      shiftStart: s.shiftStart || '09:00', shiftEnd: s.shiftEnd || '17:00',
      notes: s.notes || '', startDate: s.startDate || '',
    });
    setError(null); setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const url = editing ? `/api/admin/staff/${editing._id}` : '/api/admin/staff';
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      await fetchStaff();
      setShowModal(false);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/staff/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setStaff(prev => prev.filter(s => s._id !== deleteTarget._id));
    } catch (e: any) { setError(e.message); }
    finally { setDeleteTarget(null); }
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      workDays: prev.workDays?.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...(prev.workDays || []), day],
    }));
  };

  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = [s.name, s.email, s.department, s.phone, s.accountNumber].some(v => v?.toLowerCase().includes(q));
    const matchRole = filterRole === 'all' || s.role === filterRole;
    return matchSearch && matchRole;
  });

  const counts = {
    active:   staff.filter(s => s.status === 'active').length,
    'on-call': staff.filter(s => s.status === 'on-call').length,
    inactive: staff.filter(s => s.status === 'inactive').length,
  };

  if (loading) return <div className="flex items-center gap-2 py-10 text-sm text-[#6b7280]"><RefreshCw className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <>
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-3 py-2 border-b border-[#e5e7eb] flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-36">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
            <input type="search" placeholder="Search name, email, department…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]" />
          </div>

          {/* Role filter pills */}
          <div className="flex items-center gap-1">
            {['all', ...ROLES].map(r => (
              <button key={r} type="button" onClick={() => setFilterRole(r)}
                className={`h-8 px-3 rounded-md text-xs font-medium transition capitalize ${filterRole === r ? 'btn-primary' : 'border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6]'}`}>
                {r === 'all' ? `All (${staff.length})` : r}
              </button>
            ))}
          </div>

          <button type="button" onClick={openAdd}
            className="h-8 flex items-center gap-1 px-4 rounded-md btn-primary text-xs transition">
            <Plus className="w-3.5 h-3.5" /> Add Staff
          </button>
        </div>

        {/* Status summary */}
        <div className="px-4 py-1.5 border-b border-[#f3f4f6] flex items-center gap-4 text-xs">
          <span className="text-emerald-600 font-medium">{counts.active} active</span>
          <span className="text-amber-600 font-medium">{counts['on-call']} on-call</span>
          <span className="text-[#9ca3af]">{counts.inactive} inactive</span>
        </div>

        {error && <div className="px-4 py-2 bg-red-50 text-red-700 text-xs border-b border-red-200">{error}</div>}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                {['Account #', 'Name', 'Role', 'Department', 'Contact', 'Schedule', 'Shift', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`text-left px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af]
                    ${h === 'Department' ? 'hidden lg:table-cell' : ''}
                    ${h === 'Shift' ? 'hidden md:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-xs text-[#9ca3af]">No staff found. Add your first staff member.</td></tr>
              ) : filtered.map(s => (
                <tr key={s._id} className="hover:bg-[#fafafa] transition">
                  <td className="px-3 py-2 font-mono text-xs text-[#6b7280]">{s.accountNumber || <span className="text-amber-400 italic">—</span>}</td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-[#111827] leading-tight">{s.name}</p>
                    {s.startDate && <p className="text-[0.6rem] text-[#9ca3af]">Since {new Date(s.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.6rem] font-medium border capitalize ${roleStyle[s.role || ''] ?? 'bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]'}`}>
                      {s.role || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-[#6b7280] hidden lg:table-cell">{s.department || '—'}</td>
                  <td className="px-3 py-2">
                    <div className="space-y-0.5">
                      {s.email && <a href={`mailto:${s.email}`} className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#374151]"><Mail className="w-3 h-3" />{s.email}</a>}
                      {s.phone && <a href={`tel:${s.phone}`} className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#374151]"><Phone className="w-3 h-3" />{s.phone}</a>}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-xs text-[#374151] capitalize">{s.scheduleType || '—'}</p>
                    {s.workDays && s.workDays.length > 0 && (
                      <p className="text-[0.6rem] text-[#9ca3af]">{s.workDays.join(', ')}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-[#6b7280] hidden md:table-cell">
                    {s.scheduleType === 'on-call' ? <span className="text-amber-600 font-medium">On-Call</span>
                      : (s.shiftStart && s.shiftEnd) ? `${s.shiftStart} – ${s.shiftEnd}` : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.6rem] font-medium border capitalize ${statusStyle[s.status || 'inactive']}`}>
                      {s.status || 'inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button type="button" title="Edit" onClick={() => openEdit(s)}
                        className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" title="Delete" onClick={() => setDeleteTarget(s)}
                        className="p-1.5 rounded-md text-[#9ca3af] hover:text-red-600 hover:bg-red-50 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#e5e7eb] text-xs text-[#9ca3af]">
          Showing <strong className="text-[#374151]">{filtered.length}</strong> of <strong className="text-[#374151]">{staff.length}</strong> staff members
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl w-full max-w-sm p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-[#111827] mb-1">Delete Staff Member</h3>
            <p className="text-xs text-[#6b7280] mb-4">
              Are you sure you want to remove <strong className="text-[#111827]">{deleteTarget.name}</strong> from staff? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={handleDelete}
                className="flex-1 h-8 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition">Delete</button>
              <button type="button" onClick={() => setDeleteTarget(null)}
                className="flex-1 h-8 rounded-md border border-[#e5e7eb] text-sm text-[#6b7280] hover:bg-[#f3f4f6] transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb]">
              <h3 className="text-sm font-semibold text-[#111827]">{editing ? 'Edit Staff Member' : 'Add Staff Member'}</h3>
              <button type="button" title="Close" onClick={() => setShowModal(false)}
                className="p-1 rounded-md hover:bg-[#f3f4f6] transition"><X className="w-4 h-4 text-[#6b7280]" /></button>
            </div>

            <form onSubmit={handleSave} className="px-4 py-3 space-y-3">

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Full Name *</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" /></div>
                <div>
                  <Label>Role</Label>
                  <Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email *</Label><Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" /></div>
                <div><Label>Phone</Label><Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(555) 000-0000" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Department</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. Events, Facilities" /></div>
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              </div>

              {/* Status & Schedule */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as StaffMember['status'] })}>
                    <option value="active">Active</option>
                    <option value="on-call">On-Call</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>
                <div>
                  <Label>Schedule Type</Label>
                  <Select value={form.scheduleType} onChange={e => setForm({ ...form, scheduleType: e.target.value })}>
                    {SCHEDULE_TYPES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </Select>
                </div>
              </div>

              {/* Work Days */}
              <div>
                <Label>Work Days</Label>
                <div className="flex gap-1 flex-wrap mt-0.5">
                  {DAYS.map(d => (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${form.workDays?.includes(d) ? 'btn-primary' : 'border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6]'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shift Hours */}
              {form.scheduleType !== 'on-call' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Shift Start</Label><Input type="time" value={form.shiftStart} onChange={e => setForm({ ...form, shiftStart: e.target.value })} /></div>
                  <div><Label>Shift End</Label><Input type="time" value={form.shiftEnd} onChange={e => setForm({ ...form, shiftEnd: e.target.value })} /></div>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label>Notes</Label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                  placeholder="Any notes about this staff member…"
                  className="w-full border border-[#e5e7eb] rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151] resize-none" />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex gap-2 pt-1 border-t border-[#e5e7eb]">
                <button type="submit" disabled={saving}
                  className="flex-1 h-8 rounded-md btn-primary text-sm disabled:opacity-50 transition">
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Staff Member'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 h-8 rounded-md border border-[#e5e7eb] text-sm text-[#6b7280] hover:bg-[#f3f4f6] transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
