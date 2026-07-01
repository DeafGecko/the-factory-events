// src/components/admin/UsersTable.tsx
import { useState, useEffect } from 'react';
import { RefreshCw, Key, Shield, Plus, X } from 'lucide-react';
import CustomSelect from './CustomSelect';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'manager' | 'viewer';
  isActive: boolean;
}

const ROLES = ['admin', 'developer', 'manager', 'viewer'] as const;

const roleBadge: Record<string, string> = {
  admin:     'bg-purple-50 text-purple-700 border-purple-200',
  developer: 'bg-blue-50 text-blue-700 border-blue-200',
  manager:   'bg-amber-50 text-amber-700 border-amber-200',
  viewer:    'bg-gray-100 text-gray-600 border-gray-200',
};

export default function UsersTable() {
  const [users, setUsers]               = useState<User[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [showModal, setShowModal]       = useState(false);
  const [inviteForm, setInviteForm]     = useState({ name: '', email: '', role: 'viewer' });
  const [inviting, setInviting]         = useState(false);
  const [inviteError, setInviteError]   = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to load users');
      setUsers(await res.json());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

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
      await fetchUsers();
      setShowModal(false);
      setInviteForm({ name: '', email: '', role: 'viewer' });
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      setUsers(users.map(u => u._id === id ? { ...u, role: role as User['role'] } : u));
    } catch (err: any) { alert(err.message); }
  };

  const handleResetPassword = async (id: string) => {
    if (!confirm('Reset password for this user? A temporary password will be sent.')) return;
    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      alert('Password reset email sent.');
    } catch (err: any) { alert(err.message); }
  };

  const handleToggleBlock = async (id: string, isActive: boolean) => {
    if (!confirm(`${isActive ? 'Block' : 'Unblock'} this user?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      setUsers(users.map(u => u._id === id ? { ...u, isActive: !isActive } : u));
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return (
    <div className="flex items-center gap-2 py-10 text-sm text-[#6b7280]">
      <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
    </div>
  );

  if (error) return (
    <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
  );

  return (
    <>
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between gap-3">
          <span className="text-xs text-[#6b7280]">
            {users.length} user{users.length !== 1 ? 's' : ''} · {users.filter(u => u.isActive).length} active · {users.filter(u => !u.isActive).length} blocked
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md btn-primary text-xs transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add User
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-[#9ca3af]">No users found.</td>
                </tr>
              ) : users.map((user) => (
                <tr key={user._id} className="hover:bg-[#fafafa] transition">
                  <td className="px-3 py-2 text-sm font-medium text-[#111827]">{user.name}</td>
                  <td className="px-3 py-2 text-xs text-[#6b7280]">{user.email}</td>
                  <td className="px-3 py-2">
                    <CustomSelect
                      value={user.role || 'viewer'}
                      onChange={(v) => handleRoleChange(user._id, v)}
                      options={ROLES.map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.6rem] font-medium border ${user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {user.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleResetPassword(user._id)}
                        title="Reset password"
                        className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleBlock(user._id, user.isActive)}
                        title={user.isActive ? 'Block user' : 'Unblock user'}
                        className={`p-1.5 rounded-md transition ${user.isActive ? 'text-[#9ca3af] hover:text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'}`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-sm p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111827]">Invite New User</h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-[#f3f4f6] transition">
                <X className="w-4 h-4 text-[#6b7280]" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-3">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email',     key: 'email', type: 'email' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-[#374151] mb-1">{label}</label>
                  <input
                    type={type}
                    required
                    value={inviteForm[key as 'name' | 'email']}
                    onChange={(e) => setInviteForm({ ...inviteForm, [key]: e.target.value })}
                    className="w-full border border-[#e5e7eb] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Role</label>
                <CustomSelect
                  value={inviteForm.role}
                  onChange={(v) => setInviteForm({ ...inviteForm, role: v })}
                  options={ROLES.map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
                />
              </div>
              {inviteError && <p className="text-xs text-red-600">{inviteError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={inviting} className="flex-1 px-3 py-1.5 rounded-md btn-primary text-sm disabled:opacity-50 transition">
                  {inviting ? 'Sending…' : 'Send Invite'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 rounded-md border border-[#e5e7eb] text-sm hover:bg-[#f9fafb] transition">
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
