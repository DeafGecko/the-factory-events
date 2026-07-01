// src/components/admin/SettingsForm.tsx
import { useState, useEffect } from 'react';
import { Image, CheckCircle, XCircle } from 'lucide-react';

interface Settings {
  _id?: string;
  venueName: string;
  tagline: string;
  logo?: { asset?: { _ref?: string; url?: string } };
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  sidebarColor: string;
  sidebarTextColor: string;
  adminAvatar?: string;
  themePreference: 'light' | 'dark' | 'high-contrast';
  contactEmail: string;
  contactPhone: string;
  address: string;
  bookingFee: number;
  taxRate: number;
  depositPercentage: number;
  fontFamily: string;
}

const Label = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-xs font-medium text-[#374151] mb-1">{children}</label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full border border-[#e5e7eb] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151] ${props.className ?? ''}`} />
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-[#9ca3af] mb-2 mt-5 first:mt-0">{children}</p>
);

export default function SettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setSettings)
      .catch(() => setError('Could not load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setSettings((prev) => prev ? { ...prev, [name]: type === 'checkbox' ? checked : value } : prev);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSettings((prev) => ({ ...prev!, logo: { asset: { url: reader.result as string } } }));
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSettings((prev) => ({ ...prev!, adminAvatar: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to save'); }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-sm text-[#6b7280]">Loading…</div>;
  if (error && !settings) return <div className="text-sm text-red-600">{error}</div>;
  if (!settings) return <div className="text-sm text-[#6b7280] py-10 text-center">No settings found.</div>;

  const colors = [
    { id: 'primaryColor',     label: 'Primary',          def: '#374151' },
    { id: 'backgroundColor',  label: 'Background',       def: '#F5F5F5' },
    { id: 'textColor',        label: 'Text',             def: '#111827' },
    { id: 'sidebarColor',     label: 'Sidebar BG',       def: '#222222' },
    { id: 'sidebarTextColor', label: 'Sidebar Text',     def: '#ffffff' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-1 max-w-3xl">

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-md text-xs mb-3">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" /> Settings saved successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md text-xs mb-3">
          <XCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}

      {/* ── Branding ── */}
      <SectionTitle>Branding</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="venueName">Venue Name</Label>
          <Input id="venueName" name="venueName" value={settings.venueName || ''} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" name="tagline" value={settings.tagline || ''} onChange={handleChange} placeholder="e.g. Operations Platform" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        {/* Logo */}
        <div>
          <Label>Logo</Label>
          <div className="flex items-center gap-2">
            {settings.logo?.asset?.url && (
              <img src={settings.logo.asset.url} alt="Logo" className="h-8 w-auto object-contain border border-[#e5e7eb] rounded p-0.5" />
            )}
            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 border border-[#e5e7eb] rounded-md hover:bg-[#f9fafb] text-xs transition">
              <Image className="w-3.5 h-3.5" /> Upload
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>
        {/* Avatar */}
        <div>
          <Label>Admin Avatar</Label>
          <div className="flex items-center gap-2">
            {settings.adminAvatar ? (
              <img src={settings.adminAvatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-[#e5e7eb]" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold">A</div>
            )}
            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 border border-[#e5e7eb] rounded-md hover:bg-[#f9fafb] text-xs transition">
              <Image className="w-3.5 h-3.5" /> Upload
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
            {settings.adminAvatar && (
              <button type="button" onClick={() => setSettings((p) => ({ ...p!, adminAvatar: undefined }))} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Colors ── */}
      <SectionTitle>Colors</SectionTitle>
      <div className="grid grid-cols-5 gap-2">
        {colors.map(({ id, label, def }) => (
          <div key={id}>
            <Label htmlFor={id}>{label}</Label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                id={id}
                name={id}
                value={settings[id as keyof Settings] as string || def}
                onChange={handleChange}
                className="w-8 h-8 border border-[#e5e7eb] rounded cursor-pointer p-0.5"
              />
              <Input
                name={id}
                value={settings[id as keyof Settings] as string || ''}
                onChange={handleChange}
                className="font-mono text-[0.65rem]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Theme & Font ── */}
      <SectionTitle>Theme &amp; Typography</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="themePreference">Default Theme</Label>
          <select
            id="themePreference"
            name="themePreference"
            value={settings.themePreference || 'light'}
            onChange={handleChange}
            title="Default Theme"
            className="w-full border border-[#e5e7eb] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="high-contrast">High Contrast</option>
          </select>
        </div>
        <div>
          <Label htmlFor="fontFamily">Font Family</Label>
          <Input id="fontFamily" name="fontFamily" value={settings.fontFamily || 'Inter, system-ui, sans-serif'} onChange={handleChange} />
        </div>
      </div>

      {/* ── Fees & Taxes ── */}
      <SectionTitle>Fees &amp; Taxes</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="bookingFee">Booking Fee ($)</Label>
          <Input type="number" id="bookingFee" name="bookingFee" value={settings.bookingFee || 0} onChange={handleChange} min="0" step="0.01" />
        </div>
        <div>
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <Input type="number" id="taxRate" name="taxRate" value={settings.taxRate || 0} onChange={handleChange} min="0" step="0.01" />
        </div>
        <div>
          <Label htmlFor="depositPercentage">Deposit (%)</Label>
          <Input type="number" id="depositPercentage" name="depositPercentage" value={settings.depositPercentage || 25} onChange={handleChange} min="0" max="100" />
        </div>
      </div>

      {/* ── Contact ── */}
      <SectionTitle>Contact</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="contactEmail">Email</Label>
          <Input type="email" id="contactEmail" name="contactEmail" value={settings.contactEmail || ''} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="contactPhone">Phone</Label>
          <Input type="text" id="contactPhone" name="contactPhone" value={settings.contactPhone || ''} onChange={handleChange} />
        </div>
      </div>
      <div className="mt-3">
        <Label htmlFor="address">Address</Label>
        <textarea
          id="address"
          name="address"
          value={settings.address || ''}
          onChange={handleChange}
          rows={2}
          title="Address"
          placeholder="Street, City, State, ZIP"
          className="w-full border border-[#e5e7eb] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#374151]"
        />
      </div>

      {/* ── Save ── */}
      <div className="pt-4 border-t border-[#e5e7eb] flex justify-end mt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-md btn-primary text-sm disabled:opacity-50 transition"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
