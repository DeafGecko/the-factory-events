// src/components/admin/ClientsTable.tsx
import { useState } from 'react';
import { Plus, X, Search, Pencil, Trash2, RefreshCw } from 'lucide-react';

interface Client {
  _id: string;
  accountNumber?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
}

const empty = (): Omit<Client, '_id'> => ({ name: '', email: '', phone: '', address: '', company: '' });

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-medium text-[#374151] mb-1">{children}</label>
);
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className="w-full border border-[#e5e7eb] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]" />
);

export default function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clients');
      if (!res.ok) throw new Error('Failed to load');
      setClients(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useState(() => { fetchClients(); });

  const openAdd = () => { setEditing(null); setForm(empty()); setError(null); setShowModal(true); };
  const openEdit = (c: Client) => { setEditing(c); setForm({ name: c.name, email: c.email, phone: c.phone || '', address: c.address || '', company: c.company || '' }); setError(null); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const url = editing ? `/api/admin/clients/${editing._id}` : '/api/admin/clients';
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      await fetchClients();
      setShowModal(false);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/clients/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setClients(prev => prev.filter(c => c._id !== deleteTarget._id));
    } catch (e: any) { setError(e.message); }
    finally { setDeleteTarget(null); }
  };

  const filtered = clients.filter(c =>
    [c.name, c.email, c.company, c.accountNumber].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="flex items-center gap-2 py-10 text-sm text-[#6b7280]"><RefreshCw className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <>
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm flex flex-col max-h-[calc(100vh-13rem)]">
        {/* Header */}
        <div className="px-3 py-2 border-b border-[#e5e7eb] flex items-center gap-2 flex-wrap shrink-0">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
            <input
              type="search"
              placeholder="Search clients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]"
            />
          </div>
          <span className="text-xs text-[#9ca3af]">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</span>
          <button type="button" onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md btn-primary text-xs transition">
            <Plus className="w-3.5 h-3.5" /> Add Client
          </button>
        </div>

        {error && <div className="px-4 py-2 bg-red-50 text-red-700 text-xs border-b border-red-200">{error}</div>}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                {['Account #', 'Name', 'Company', 'Email', 'Phone', 'Actions'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-xs text-[#9ca3af]">No clients found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c._id} className="hover:bg-[#fafafa] transition">
                  <td className="px-3 py-2 font-mono text-xs text-[#6b7280]">{c.accountNumber || <span className="text-amber-400 italic">—</span>}</td>
                  <td className="px-3 py-2 text-sm font-medium text-[#111827]">{c.name}</td>
                  <td className="px-3 py-2 text-sm text-[#6b7280]">{c.company || '—'}</td>
                  <td className="px-3 py-2 text-sm text-[#6b7280]">{c.email}</td>
                  <td className="px-3 py-2 text-sm text-[#6b7280]">{c.phone || '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => openEdit(c)} className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition"><Pencil className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-md text-[#9ca3af] hover:text-red-600 hover:bg-red-50 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl w-full max-w-sm p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-[#111827] mb-1">Delete Client</h3>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111827]">{editing ? 'Edit Client' : 'Add Client'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-[#f3f4f6]"><X className="w-4 h-4 text-[#6b7280]" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Full Name *</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Company</Label><Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
              </div>
              <div><Label>Email *</Label><Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="flex-1 px-3 py-1.5 rounded-md btn-primary text-sm disabled:opacity-50">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Client'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 rounded-md border border-[#e5e7eb] text-sm hover:bg-[#f9fafb]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
