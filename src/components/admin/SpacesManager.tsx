// src/components/admin/SpacesManager.tsx
// Full CRUD for floor plan spaces – add, edit, delete

import { useState, useEffect } from 'react';
import { Plus, Pencil, X, Check, Archive, PartyPopper, FileText, ShoppingCart, Package, CheckCircle, XCircle, LayoutGrid, RotateCcw } from 'lucide-react';

interface Space {
  _id: string;
  code: string;
  name: string;
  type: 'party' | 'market' | 'lease';
  capacity: number;
  isAvailable: boolean;
  isArchived: boolean;
  archivedAt?: string;
  notes?: string;
  _createdAt: string;
}

export default function SpacesManager() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);

  const [formData, setFormData] = useState({
    code: '', name: '', type: 'party' as 'party' | 'market' | 'lease',
    capacity: 0, isAvailable: true, notes: '',
  });

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/spaces${includeArchived ? '?includeArchived=true' : ''}`);
      if (!res.ok) throw new Error('Failed to fetch');
      setSpaces(await res.json());
      setError(null);
    } catch { setError('Could not load spaces.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSpaces(); }, [includeArchived]);

  const resetForm = () => {
    setFormData({ code: '', name: '', type: 'party', capacity: 0, isAvailable: true, notes: '' });
    setEditingId(null); setIsAdding(false);
  };

  const startEdit = (space: Space) => {
    setEditingId(space._id);
    setFormData({ code: space.code, name: space.name || '', type: space.type, capacity: space.capacity || 0, isAvailable: space.isAvailable, notes: space.notes || '' });
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) { alert('Space code is required.'); return; }
    try {
      const url = editingId ? `/api/admin/spaces/${editingId}` : '/api/admin/spaces';
      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to save'); }
      await fetchSpaces(); resetForm();
    } catch (err: any) { alert(err.message); }
  };

  const handleArchive = async (id: string, code: string) => {
    if (!confirm(`Archive space "${code}"? It can be restored later.`)) return;
    try {
      const res = await fetch(`/api/admin/spaces/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to archive');
      await fetchSpaces();
    } catch (err: any) { alert(err.message); }
  };

  const handleRestore = async (id: string) => {
    if (!confirm('Restore this archived space?')) return;
    try {
      const res = await fetch(`/api/admin/spaces/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'restore' }) });
      if (!res.ok) throw new Error('Failed to restore');
      await fetchSpaces();
    } catch (err: any) { alert(err.message); }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'party':  return <span className="flex items-center gap-1"><PartyPopper className="w-3 h-3" /> Party</span>;
      case 'market': return <span className="flex items-center gap-1"><ShoppingCart className="w-3 h-3" /> Market</span>;
      case 'lease':  return <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Lease</span>;
      default: return type;
    }
  };

  if (loading) return <div className="text-center py-10 text-sm text-[#6b7280]">Loading spaces…</div>;

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">

      {/* Toolbar */}
      <div className="px-3 py-2 border-b border-[#e5e7eb] flex items-center gap-2 flex-wrap">
        <label className="flex items-center gap-1.5 text-xs text-[#6b7280] mr-auto">
          <input type="checkbox" checked={includeArchived} onChange={e => setIncludeArchived(e.target.checked)}
            className="accent-[var(--admin-primary)] rounded" />
          Show Archived
        </label>
        <span className="text-xs text-[#9ca3af]">
          {spaces.filter(s => s.isAvailable && !s.isArchived).length} available · {spaces.length} total
        </span>
        <button type="button" onClick={() => { resetForm(); setIsAdding(true); }}
          className="h-8 flex items-center gap-1 px-4 rounded-md btn-primary text-xs transition">
          <Plus className="w-3.5 h-3.5" /> Add Space
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-xs border-b border-red-200 flex items-center gap-2">
          <XCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}

      {/* Inline Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="px-3 py-3 bg-[#f9fafb] border-b border-[#e5e7eb]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <input type="text" placeholder="Code (e.g. P089)" value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="h-8 border border-[#e5e7eb] rounded-md px-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]" />
            <input type="text" placeholder="Name (e.g. Main Ballroom)" value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="h-8 border border-[#e5e7eb] rounded-md px-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]" />
            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              className="h-8 border border-[#e5e7eb] rounded-md px-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151] bg-white">
              <option value="party">🎉 Party Room</option>
              <option value="market">🛒 Farm Market Booth</option>
              <option value="lease">📝 Lease / Rental</option>
            </select>
            <input type="number" placeholder="Capacity" value={formData.capacity || ''}
              onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              className="h-8 border border-[#e5e7eb] rounded-md px-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]" />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <input type="text" placeholder="Notes" value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="flex-1 h-8 border border-[#e5e7eb] rounded-md px-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]" />
            <label className="flex items-center gap-1.5 text-xs text-[#6b7280]">
              <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="accent-[var(--admin-primary)]" />
              Available
            </label>
            <button type="button" onClick={handleSave}
              className="h-8 flex items-center gap-1 px-3 rounded-md btn-primary text-xs transition">
              <Check className="w-3.5 h-3.5" /> {editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm}
              className="h-8 flex items-center gap-1 px-3 rounded-md border border-[#e5e7eb] text-xs hover:bg-[#f3f4f6] transition">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              {['Code', 'Name', 'Type', 'Capacity', 'Status', ...(includeArchived ? ['Archived'] : []), 'Actions'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {spaces.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#9ca3af]">
                  <LayoutGrid className="w-8 h-8 mx-auto mb-2 text-[#e5e7eb]" />
                  <p className="text-xs">No spaces yet. Add your first space above.</p>
                </td>
              </tr>
            ) : spaces.map(space => (
              <tr key={space._id} className={`hover:bg-[#fafafa] transition ${space.isArchived ? 'opacity-60' : ''}`}>
                <td className="px-3 py-2 font-mono text-xs text-[#111827] font-medium">{space.code}</td>
                <td className="px-3 py-2 text-sm text-[#374151]">{space.name || '—'}</td>
                <td className="px-3 py-2 text-xs text-[#6b7280]">{getTypeLabel(space.type)}</td>
                <td className="px-3 py-2 text-xs text-[#6b7280]">{space.capacity || '—'}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-medium border ${
                    space.isArchived ? 'bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]'
                    : space.isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {space.isArchived ? <><Package className="w-3 h-3" /> Archived</>
                      : space.isAvailable ? <><CheckCircle className="w-3 h-3" /> Available</>
                      : <><XCircle className="w-3 h-3" /> Unavailable</>}
                  </span>
                </td>
                {includeArchived && (
                  <td className="px-3 py-2 text-xs text-[#9ca3af]">
                    {space.archivedAt ? new Date(space.archivedAt).toLocaleDateString() : '—'}
                  </td>
                )}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    {space.isArchived ? (
                      <button type="button" title="Restore" onClick={() => handleRestore(space._id)}
                        className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <>
                        <button type="button" title="Edit" onClick={() => startEdit(space)}
                          className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" title="Archive" onClick={() => handleArchive(space._id, space.code)}
                          className="p-1.5 rounded-md text-[#9ca3af] hover:text-amber-600 hover:bg-amber-50 transition">
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#9ca3af]">
        <span>{spaces.length} space{spaces.length !== 1 ? 's' : ''} total{includeArchived ? ` · ${spaces.filter(s => s.isArchived).length} archived` : ''}</span>
        <span>{spaces.filter(s => s.isAvailable && !s.isArchived).length} available</span>
      </div>
    </div>
  );
}
