// src/components/admin/TenantsTable.tsx
import { useState } from 'react';
import { Plus, X, Search, Pencil, Trash2, RefreshCw } from 'lucide-react';

interface Tenant {
  _id: string;
  accountNumber?: string;
  name: string;
  email: string;
  phone?: string;
  unit?: string;
  leaseStart?: string;
  leaseEnd?: string;
  rentAmount?: number;
  status?: 'active' | 'expired' | 'pending';
  businessType?: string;
}

const empty = (): Omit<Tenant, '_id'> => ({ name: '', email: '', phone: '', unit: '', leaseStart: '', leaseEnd: '', rentAmount: 0, status: 'active', businessType: '' });

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-medium text-[#374151] mb-1">{children}</label>
);
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className="w-full border border-[#e5e7eb] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]" />
);

const statusStyle: Record<string, string> = {
  active:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
};

const leaseStatus = (tenant: Tenant): 'active' | 'expired' | 'pending' => {
  if (tenant.status) return tenant.status;
  if (!tenant.leaseEnd) return 'active';
  return new Date(tenant.leaseEnd) < new Date() ? 'expired' : 'active';
};

export default function TenantsTable() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tenants');
      if (!res.ok) throw new Error('Failed to load');
      setTenants(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useState(() => { fetchTenants(); });

  const openAdd = () => { setEditing(null); setForm(empty()); setError(null); setShowModal(true); };
  const openEdit = (t: Tenant) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email, phone: t.phone || '', unit: t.unit || '', leaseStart: t.leaseStart || '', leaseEnd: t.leaseEnd || '', rentAmount: t.rentAmount || 0, status: t.status || 'active', businessType: t.businessType || '' });
    setError(null); setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const url = editing ? `/api/admin/tenants/${editing._id}` : '/api/admin/tenants';
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      await fetchTenants();
      setShowModal(false);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/tenants/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setTenants(prev => prev.filter(t => t._id !== deleteTarget._id));
    } catch (e: any) { setError(e.message); }
    finally { setDeleteTarget(null); }
  };

  const filtered = tenants.filter(t =>
    [t.name, t.email, t.unit, t.businessType, t.accountNumber].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="flex items-center gap-2 py-10 text-sm text-[#6b7280]"><RefreshCw className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <>
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b border-[#e5e7eb] flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
            <input type="search" placeholder="Search tenants…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]" />
          </div>
          <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
            <span className="text-emerald-600">{tenants.filter(t => leaseStatus(t) === 'active').length} active</span>
            <span>·</span>
            <span className="text-red-500">{tenants.filter(t => leaseStatus(t) === 'expired').length} expired</span>
            <span>·</span>
            <span className="text-amber-500">{tenants.filter(t => leaseStatus(t) === 'pending').length} pending</span>
          </div>
          <button type="button" onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md btn-primary text-xs transition">
            <Plus className="w-3.5 h-3.5" /> Add Tenant
          </button>
        </div>

        {error && <div className="px-4 py-2 bg-red-50 text-red-700 text-xs border-b border-red-200">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                {['Account #', 'Name', 'Business Type', 'Unit', 'Lease Period', 'Rent / mo', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-xs text-[#9ca3af]">No tenants found.</td></tr>
              ) : filtered.map(t => {
                const status = leaseStatus(t);
                return (
                  <tr key={t._id} className="hover:bg-[#fafafa] transition">
                    <td className="px-3 py-2 font-mono text-xs text-[#6b7280]">{t.accountNumber || <span className="text-amber-400 italic">—</span>}</td>
                    <td className="px-3 py-2">
                      <p className="text-sm font-medium text-[#111827]">{t.name}</p>
                      <p className="text-xs text-[#9ca3af]">{t.email}</p>
                    </td>
                    <td className="px-3 py-2 text-sm text-[#6b7280]">{t.businessType || '—'}</td>
                    <td className="px-3 py-2 text-sm font-medium text-[#374151]">{t.unit || '—'}</td>
                    <td className="px-3 py-2 text-xs text-[#6b7280]">
                      {t.leaseStart ? new Date(t.leaseStart).toLocaleDateString() : '—'}
                      {t.leaseStart && t.leaseEnd ? ' → ' : ''}
                      {t.leaseEnd ? new Date(t.leaseEnd).toLocaleDateString() : ''}
                    </td>
                    <td className="px-3 py-2 text-sm text-[#111827]">{t.rentAmount ? `$${t.rentAmount.toLocaleString()}` : '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-medium border ${statusStyle[status]}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button type="button" title="Edit tenant" onClick={() => openEdit(t)} className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition"><Pencil className="w-3.5 h-3.5" /></button>
                        <button type="button" title="Delete tenant" onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-md text-[#9ca3af] hover:text-red-600 hover:bg-red-50 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl w-full max-w-sm p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-[#111827] mb-1">Delete Tenant</h3>
            <p className="text-xs text-[#6b7280] mb-4">
              Are you sure you want to delete <strong className="text-[#111827]">{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={handleDelete}
                className="flex-1 h-8 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition">
                Delete
              </button>
              <button type="button" onClick={() => setDeleteTarget(null)}
                className="flex-1 h-8 rounded-md border border-[#e5e7eb] text-sm text-[#6b7280] hover:bg-[#f3f4f6] transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111827]">{editing ? 'Edit Tenant' : 'Add Tenant'}</h3>
              <button type="button" title="Close" onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-[#f3f4f6]"><X className="w-4 h-4 text-[#6b7280]" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Full Name *</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Business Type</Label><Input placeholder="e.g. Restaurant, Shop" value={form.businessType} onChange={e => setForm({ ...form, businessType: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email *</Label><Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Phone</Label><Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Unit / Space</Label><Input placeholder="e.g. A101, Suite 3" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
                <div><Label>Monthly Rent ($)</Label><Input type="number" min="0" step="0.01" value={form.rentAmount || ''} onChange={e => setForm({ ...form, rentAmount: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Lease Start</Label><Input type="date" value={form.leaseStart} onChange={e => setForm({ ...form, leaseStart: e.target.value })} /></div>
                <div><Label>Lease End</Label><Input type="date" value={form.leaseEnd} onChange={e => setForm({ ...form, leaseEnd: e.target.value })} /></div>
              </div>
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Tenant['status'] })} title="Status"
                  className="w-full border border-[#e5e7eb] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="flex-1 px-3 py-1.5 rounded-md btn-primary text-sm disabled:opacity-50">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Tenant'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 rounded-md border border-[#e5e7eb] text-sm hover:bg-[#f9fafb]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
