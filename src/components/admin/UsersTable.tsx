// src/components/admin/UsersTable.tsx
import { useState, useEffect } from 'react';
import { RefreshCw, Key, Shield, Plus, X } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'manager' | 'viewer';
  isActive: boolean;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'viewer' });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Invite new admin ──
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviting(true);
    try {
      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invitation');
      await fetchUsers(); // refresh list
      setShowInviteModal(false);
      setInviteForm({ name: '', email: '', role: 'viewer' });
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviting(false);
    }
  };

  // ── Role change ──
  const handleRoleChange = async (id: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update role');
      }
      setUsers(users.map(u => u._id === id ? { ...u, role: role as User['role'] } : u));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ── Reset password ──
  const handleResetPassword = async (id: string) => {
    if (!confirm('Reset password for this user? A temporary password will be sent.')) return;
    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to reset password');
      }
      alert('Password reset email sent (check console for temporary password).');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ── Block / Unblock ──
  const handleToggleBlock = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'block' : 'unblock';
    if (!confirm(`${action} this user? They will ${currentStatus ? 'not be able to' : 'be able to'} log in.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }
      setUsers(users.map(u => u._id === id ? { ...u, isActive: !currentStatus } : u));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-[#8e8e93]">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
        ❌ {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e8e4dc] shadow-sm overflow-hidden">
      {/* ── Header with Add Button ── */}
      <div className="px-6 py-4 border-b border-[#e8e4dc] bg-[#faf9f7] flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-[#8a7a6a]">
          {users.length} admin user{users.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1c1c1e] text-white hover:bg-[#2c2c2e] transition text-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Admin
        </button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8e4dc] bg-[#f5f3ef]">
              <th className="text-left py-3 px-4 font-semibold text-[#8a7a6a] text-[10px] uppercase tracking-[0.8px]">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-[#8a7a6a] text-[10px] uppercase tracking-[0.8px]">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-[#8a7a6a] text-[10px] uppercase tracking-[0.8px]">Role</th>
              <th className="text-left py-3 px-4 font-semibold text-[#8a7a6a] text-[10px] uppercase tracking-[0.8px]">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-[#8a7a6a] text-[10px] uppercase tracking-[0.8px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#b0a898]">
                  <p className="text-sm">No admin users found.</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b border-[#f0ece6] hover:bg-[#faf9f7] transition">
                  <td className="py-3 px-4 font-medium text-[#1c1c1e]">{user.name}</td>
                  <td className="py-3 px-4 text-[#6a5a4a]">{user.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={user.role || 'viewer'}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="border border-[#e8e4dc] rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                    >
                      <option value="admin">Admin</option>
                      <option value="developer">Developer</option>
                      <option value="manager">Manager</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      user.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {user.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResetPassword(user._id)}
                        className="p-1.5 text-[#6a5a4a] hover:text-[#1c1c1e] hover:bg-[#f0ece6] rounded-md transition"
                        title="Reset password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleBlock(user._id, user.isActive)}
                        className={`p-1.5 rounded-md transition ${
                          user.isActive
                            ? 'text-[#b0a898] hover:text-red-600 hover:bg-red-50'
                            : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                        }`}
                        title={user.isActive ? 'Block user' : 'Unblock user'}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Invite Modal ── */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-light tracking-wide">Invite New Admin</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 hover:bg-[#f0ece6] rounded-md transition"
              >
                <X className="w-5 h-5 text-[#6a5a4a]" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1c1c1e]">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="mt-1 w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1c1c1e]">Email</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="mt-1 w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1c1c1e]">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="mt-1 w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                >
                  <option value="admin">Admin</option>
                  <option value="developer">Developer</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              {inviteError && (
                <div className="text-red-600 text-sm">{inviteError}</div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 px-4 py-2 rounded-md bg-[#1c1c1e] text-white hover:bg-[#2c2c2e] transition text-sm disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-md border border-[#e8e4dc] hover:bg-[#f5f3ef] transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="px-6 py-3 border-t border-[#e8e4dc] bg-[#faf9f7] flex flex-wrap items-center justify-between gap-3 text-sm text-[#8a7a6a]">
        <span>
          {users.filter(u => u.isActive).length} active · {users.filter(u => !u.isActive).length} blocked
        </span>
      </div>
    </div>
  );
}