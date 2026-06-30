// src/components/admin/SettingsForm.tsx
import { useState, useEffect } from 'react';
import { Image, CheckCircle, XCircle } from 'lucide-react';

interface Settings {
  _id?: string;
  venueName: string;
  logo?: {
    asset?: {
      _ref?: string;
      url?: string;
    };
  };
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

export default function SettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        setError('Could not load settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings((prev) => ({ ...prev!, logo: { asset: { url: reader.result as string } } }));
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings((prev) => ({ ...prev!, adminAvatar: reader.result as string }));
    };
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
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-[#6b7280]">Loading settings...</div>;
  }

  if (error && !settings) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (!settings) {
    return <div className="text-center py-12 text-[#6b7280]">No settings found. Create your first settings.</div>;
  }

      return (
            <form onSubmit={handleSubmit} className="bg-white text-[#111827] rounded-xl border border-[#e5e7eb] shadow-sm p-6 space-y-8">
            {success && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" /> Settings saved successfully!
                  </div>
            )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <fieldset>
        <legend className="text-sm font-medium text-[#111827] mb-3">Branding</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="venueName" className="block text-sm font-medium text-[#111827]">
              Venue Name
            </label>
            <input
              type="text"
              id="venueName"
              name="venueName"
              value={settings.venueName || ''}
              onChange={handleChange}
              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827]">Logo</label>
            <div className="mt-1 flex items-center gap-4">
              {settings.logo?.asset?.url && (
                <img
                  src={settings.logo.asset.url}
                  alt="Venue logo"
                  className="h-12 w-auto object-contain border border-[#e5e7eb] rounded-md p-1"
                />
              )}
              <label className="cursor-pointer px-4 py-2 border border-[#e5e7eb] rounded-md hover:bg-[#f3f4f6] transition text-sm">
                <Image className="w-4 h-4 inline mr-1" />
                Upload Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827]">Admin Avatar</label>
            <div className="mt-1 flex items-center gap-4">
              {settings.adminAvatar ? (
                <img
                  src={settings.adminAvatar}
                  alt="Admin avatar"
                  className="w-12 h-12 rounded-full object-cover border border-[#e5e7eb]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-semibold">
                  A
                </div>
              )}
              <label className="cursor-pointer px-4 py-2 border border-[#e5e7eb] rounded-md hover:bg-[#f3f4f6] transition text-sm">
                <Image className="w-4 h-4 inline mr-1" />
                Upload Avatar
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
              {settings.adminAvatar && (
                <button
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev!, adminAvatar: undefined }))}
                  className="text-sm text-red-500 hover:text-red-700 transition"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-[#111827] mb-3">Colors</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'primaryColor', label: 'Primary (buttons & accents)', default: '#374151' },
            { id: 'backgroundColor', label: 'Background', default: '#F5F5F5' },
            { id: 'textColor', label: 'Text', default: '#111827' },
            { id: 'sidebarColor', label: 'Sidebar Background', default: '#222222' },
            { id: 'sidebarTextColor', label: 'Sidebar Text', default: '#ffffff' },
          ].map(({ id, label, default: def }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-[#111827]">
                {label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id={id}
                  name={id}
                  value={settings[id as keyof Settings] as string || def}
                  onChange={handleChange}
                  className="w-10 h-10 border border-[#e5e7eb] rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  name={id}
                  value={settings[id as keyof Settings] as string || ''}
                  onChange={handleChange}
                  className="flex-1 border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-[#111827] mb-3">Theme &amp; Typography</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="themePreference" className="block text-sm font-medium text-[#111827]">
              Default Theme
            </label>
            <select
              id="themePreference"
              name="themePreference"
              value={settings.themePreference || 'light'}
              onChange={handleChange}
              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="high-contrast">High Contrast</option>
            </select>
          </div>
          <div>
            <label htmlFor="fontFamily" className="block text-sm font-medium text-[#111827]">
              Font Family
            </label>
            <input
              type="text"
              id="fontFamily"
              name="fontFamily"
              value={settings.fontFamily || 'Inter, system-ui, sans-serif'}
              onChange={handleChange}
              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-[#111827] mb-3">Fees &amp; Taxes</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="bookingFee" className="block text-sm font-medium text-[#111827]">
              Booking Fee ($)
            </label>
            <input
              type="number"
              id="bookingFee"
              name="bookingFee"
              value={settings.bookingFee || 0}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
            />
          </div>
          <div>
            <label htmlFor="taxRate" className="block text-sm font-medium text-[#111827]">
              Tax Rate (%)
            </label>
            <input
              type="number"
              id="taxRate"
              name="taxRate"
              value={settings.taxRate || 0}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
            />
          </div>
          <div>
            <label htmlFor="depositPercentage" className="block text-sm font-medium text-[#111827]">
              Deposit Percentage (%)
            </label>
            <input
              type="number"
              id="depositPercentage"
              name="depositPercentage"
              value={settings.depositPercentage || 25}
              onChange={handleChange}
              min="0"
              max="100"
              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-[#111827] mb-3">Contact Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-[#111827]">
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={settings.contactEmail || ''}
              onChange={handleChange}
              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-[#111827]">
              Contact Phone
            </label>
            <input
              type="text"
              id="contactPhone"
              name="contactPhone"
              value={settings.contactPhone || ''}
              onChange={handleChange}
              className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="address" className="block text-sm font-medium text-[#111827]">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={settings.address || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 w-full border border-[#e5e7eb] rounded-md px-4 py-2.5 ring-primary"
          />
        </div>
      </fieldset>

      <div className="flex justify-end pt-4 border-t border-[#e5e7eb]">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-md btn-primary transition text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}