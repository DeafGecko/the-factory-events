// src/components/admin/SpaceManager.tsx
// Full CRUD for spaces – add, edit, delete

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Archive } from 'lucide-react';

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

// SpaceManager component
export default function SpaceManager() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);

  // ── Form state ──
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'party' as 'party' | 'market' | 'lease',
    capacity: 0,
    isAvailable: true,
    notes: '',
  });

  // ── Fetch spaces ──
  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/spaces${includeArchived ? '?includeArchived=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSpaces(data);
      setError(null);
    } catch (err) {
      setError('Could not load spaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [includeArchived]);

  // ── Reset form ──
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'party',
      capacity: 0,
      isAvailable: true,
      notes: '',
    });
    setEditingId(null);
    setIsAdding(false);
  };

  // ── Start editing ──
  const startEdit = (space: Space) => {
    setEditingId(space._id);
    setFormData({
      code: space.code,
      name: space.name || '',
      type: space.type,
      capacity: space.capacity || 0,
      isAvailable: space.isAvailable,
      notes: space.notes || '',
    });
    setIsAdding(false);
  };

  // ── Cancel edit/add ──
  const cancelEdit = () => resetForm();

  // ── Save (create or update) ──
  const handleSave = async () => {
    if (!formData.code.trim()) {
      alert('Space code is required.');
      return;
    }

    try {
      let res;
      if (editingId) {
        // Update
        res = await fetch(`/api/admin/spaces/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // Create
        res = await fetch('/api/admin/spaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      await fetchSpaces();
      resetForm();
    } catch (err: any) {
      alert(err.message);
    }
  };
  
  // ── Archive ──
  const handleArchive = async (id: string, code: string) => {
    if (!confirm(`Archive space "${code}"? It will be hidden but can be restored later.`)) return;
    try {
      const res = await fetch(`/api/admin/spaces/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to archive');
      await fetchSpaces();
    } catch (err: any) {
      alert(err.message);
    }
  };  

  // ── Restore ──
  const handleRestore = async (id: string) => {
    if (!confirm(`Restore this archived space?`)) return;
    try {
      const res = await fetch(`/api/admin/spaces/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      });
      if (!res.ok) throw new Error('Failed to restore');
      await fetchSpaces();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ── Delete ── 
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'party': return '🎉 Party';
      case 'market': return '🛒 Market';
      case 'lease': return '📝 Lease';
      default: return type;
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-[#8e8e93]">Loading spaces...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-[#e8e4dc] shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-[#e8e4dc] bg-[#faf9f7] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#8a7a6a]">
          {spaces.length} spaces{spaces.length !== 1 ? ' total' : ''} total
          </span>
          <label className="flex items-center gap-1.5 text-sm text-[#8a7a6a]">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="accent-[#1c1c1e]"
            />
            Show Archived
          </label>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1c1c1e] text-white hover:bg-[#2c2c2e] transition text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Space
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-3 bg-red-50 text-red-600 text-sm border-b border-red-200">
          ❌ {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="px-6 py-4 bg-[#f5f3ef] border-b border-[#e8e4dc]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Code (e.g., P089)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="border border-[#e8e4dc] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
            />
            <input
              type="text"
              placeholder="Name (e.g., Main Ballroom)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border border-[#e8e4dc] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="border border-[#e8e4dc] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
            >
              <option value="party">🎉 Party Room</option>
              <option value="market">🛒 Farm Market Booth</option>
              <option value="lease">📝 Lease / Rental</option>
            </select>
            <input
              type="number"
              placeholder="Capacity"
              value={formData.capacity || ''}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              className="border border-[#e8e4dc] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <input
              type="text"
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border border-[#e8e4dc] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="accent-[#1c1c1e]"
              />
              Available
            </label>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1c1c1e] text-white hover:bg-[#2c2c2e] transition text-sm"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e8e4dc] hover:bg-gray-50 transition text-sm"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8e4dc] bg-[#f5f3ef]">
              <th className="text-left py-3 px-4 font-semibold text-[#8a7a6a] text-[10px] uppercase tracking-[0.8px]">Code</th>
              <th className="text-left py-3 px-4 font-semibold text-[#8a7a6a] text-[10px] uppercase tracking-[0.8px]">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-[#8a7a6a] text-[10px] uppercase tracking-[0.8px]">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-[#8a7a6a] text-[10px] uppercase tracking-[0.8px]">Capacity</th>
              <th className="text-left py-3 px-4 font-semibold text-[#8a7a6a] text-[10px] uppercase tracking-[0.8px]">Status</th>
              {includeArchived && (
                <th className="text-left py-3 px-4 font-semibold text-[#8a7a6a] text-[10px] uppercase tracking-[0.8px]">Archived At</th>
              )}
              <th className="text-left py-3 px-4 font-semibold text-[#8a7a6a] text-[10px] uppercase tracking-[0.8px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {spaces.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#b0a898]">
                  <div className="text-4xl mb-3">🏗️</div>
                  <p className="text-sm">No spaces yet. Add your first space above.</p>
                </td>
              </tr>
            ) : (
              spaces.map((space) => (
                <tr key={space._id} className={`border-b border-[#f0ece6] hover:bg-[#faf9f7] transition ${space.isArchived ? 'opacity-60' : ''}`}>
                  <td className="py-3 px-4 font-mono text-xs text-[#1c1c1e]">{space.code}</td>
                  <td className="py-3 px-4 text-[#1c1c1e]">{space.name || '—'}</td>
                  <td className="py-3 px-4 text-[#6a5a4a]">{getTypeLabel(space.type)}</td>
                  <td className="py-3 px-4 text-[#6a5a4a]">{space.capacity || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      space.isArchived
                        ? 'bg-gray-100 text-gray-500 border-gray-300'
                        : space.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {space.isArchived ? '📦 Archived' : (space.isAvailable ? '✅ Available' : '❌ Unavailable')}
                    </span>
                  </td>
                  {includeArchived && (
                    <td className="py-3 px-4 text-xs text-[#8a7a6a]">
                      {space.archivedAt ? new Date(space.archivedAt).toLocaleDateString() : '—'}
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {space.isArchived ? (
                        <button
                          onClick={() => handleRestore(space._id)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition"
                          title="Restore this space"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(space)}
                            className="p-1.5 text-[#6a5a4a] hover:text-[#1c1c1e] hover:bg-[#f0ece6] rounded-md transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchive(space._id, space.code)}
                            className="p-1.5 text-[#b0a898] hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                            title="Archive (soft-delete)"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#e8e4dc] bg-[#faf9f7] flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-[#8a7a6a]">
          {spaces.length} space{spaces.length !== 1 ? 's' : ''} total
          {includeArchived && ` (${spaces.filter((s) => s.isArchived).length} archived)`}
        </span>
        <span className="text-sm text-[#8a7a6a]">
          {spaces.filter((s) => s.isAvailable).length} available
        </span>
      </div>
    </div>
  );
}