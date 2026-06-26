// src/components/admin/SettingsForm.tsx
// Full settings form with all fields

import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';

interface Settings {
      _id: string;
      venueName: string;
      logo?: 
            { asset?: { 
                  _ref: string; 
                  url: string 
            } 
      };
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      backgroundColor: string;
      textColor: string;
      sidebarColor: string;
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
      const [formData, setFormData] = useState<Settings | null>(null);
      const [loading, setLoading] = useState(false);
      const [success, setSuccess] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [logoPreview, setLogoPreview] = useState<string | null>(null);

// ── Fetch settings on mount──
      useEffect(() => {
            const fetchSettings = async () => {
                  try {
                        const res = await fetch('/api/admin/settings');
                        if (!res.ok) throw new Error('Failed to load');
                        const data = await res.json();
                        setFormData(data);
                        setLogoPreview(data.logo?.asset?.url || null);
                  } catch (err) {
                        setError('Could not load settings.');
                  } finally {
                        setLoading(false);
            }
      };
      fetchSettings();
  }, []);

// ── Handle form changes ──
      const handleChange = (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
      const { name, value, type } = e.target;
            setFormData((prev) => {
                  if (!prev) return prev;
                  return {
                        ...prev,
                        [name]: type === 'number' ? parseFloat(value) || 0 : value,
                  };
            });
      };

// ── Logo upload (simplified – just stores the URL for now) ──
// For a full implementation, you'd upload to Sanity's asset API.
// For now, we'll just show a text input for the logo URL.
      const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
                  if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => {
                  const base64String = reader.result as string;
                  setFormData((prev) => ({
                        ...prev!,
                        logo: { asset: { url: base64String } },
                  }));
            };
            reader.readAsDataURL(file);
      };

// ── Submit ──
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
                  body: JSON.stringify(payload),
                  });
            if (!res.ok) {
                  const err = await res.json();
                  throw new Error(err.error || 'Failed to save settings');
                  }
                  setSuccess(true);
                  setTimeout(() => setSuccess(false), 3000);
                  } catch (err: any) {
                  setError(err.message || 'Something went wrong');
                  } finally {
                  setLoading(false);
                  }
            };

            if (loading) {
                  return <div className="text-center py-12 text-[#8e8e93]">Loading settings...</div>;
            }

            if (error && !settings) {
                  return <div className="text-red-600">Error: {error}</div>;
            }

            if (!settings) {
                  return <div className="text-center py-12 text-[#8e8e93]">No settings found. Create your first settings.</div>;
            }

{/* ── Form ── */}
            <form onSubmit={handleSubmit
            return (
                  <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e8e4dc] shadow-sm p-6 space-y-6">
                        {success && (
                              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md text-sm">
                                    ✅ Settings saved successfully!
                              </div>
                        )}
                        {error && (
                              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                                    ❌ {error}
                              </div>
                        )}

{/* ──  ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="venueName" className="block text-sm font-medium text-[#1c1c1e]">
            Venue Name
          </label>
          <input
            type="text"
            id="venueName"
            name="venueName"
            value={settings.venueName || ''}
            onChange={handleChange}
            className="mt-1 w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
          />
        </div>
            <div>
                  <label htmlFor="logoUrl" className="block text-sm font-medium text-[#1c1c1e]">
                        Logo URL (publicly accessible)
                  </label>
                  <input
                        type="text"
                        id="logoUrl"
                        name="logoUrl"
                        value={formData.logo?.asset?.url || ''}
                        onChange={handleLogoUrlChange}
                        placeholder="https://example.com/logo.png"
                        className="mt-1 w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                  />
                  {logoPreview && (
                  <div className="mt-2">
                        <img src={logoPreview} alt="Logo preview" className="max-h-16 object-contain border rounded border-[#e8e4dc] p-1" />
                  </div>
                  )}
            </div>
      </div>
      </section>

{/* ── Colors ── */}
      <section>
            <h3 className="text-sm font-semibold text-[#1c1c1e] mb-3">Colors</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-[#1c1c1e]">
                        Primary
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                        <input
                              type="color"
                              id="primaryColor"
                              name="primaryColor"
                              value={formData.primaryColor || '#A03A3A'}
                              onChange={handleColorChange}
                              className="w-12 h-12 border border-[#e8e4dc] rounded-md cursor-pointer p-1"
                        />
                        <input
                              type="text"
                              name="primaryColor"
                              value={formData.primaryColor || ''}
                              onChange={handleChange}
                              className="flex-1 border border-[#e8e4dc] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                        />
                  </div>
            </div>
            <div>
                  <label htmlFor="secondaryColor" className="block text-sm font-medium text-[#1c1c1e]">
                        Secondary
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                        <input
                              type="color"
                              id="secondaryColor"
                              name="secondaryColor"
                              value={formData.secondaryColor || '#B05040'}
                              onChange={handleColorChange}
                              className="w-12 h-12 border border-[#e8e4dc] rounded-md cursor-pointer p-1"
                        />
                        <input
                              type="text"
                              name="secondaryColor"
                              value={formData.secondaryColor || ''}
                              onChange={handleChange}
                              className="flex-1 border border-[#e8e4dc] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                        />
                  </div>
            </div>
            <div>
                  <label htmlFor="accentColor" className="block text-sm font-medium text-[#1c1c1e]">
                        Accent
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                        <input
                              type="color"
                              id="accentColor"
                              name="accentColor"
                              value={formData.accentColor || '#D4C4A8'}
                              onChange={handleColorChange}
                              className="w-12 h-12 border border-[#e8e4dc] rounded-md cursor-pointer p-1"
                        />
                        <input
                              type="text"
                              name="accentColor"
                              value={formData.accentColor || ''}
                              onChange={handleChange}
                              className="flex-1 border border-[#e8e4dc] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                        />
                  </div>
            </div>
            <div>
                  <label htmlFor="backgroundColor" className="block text-sm font-medium text-[#1c1c1e]">
                        Background
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                        <input
                              type="color"
                              id="backgroundColor"
                              name="backgroundColor"
                              value={formData.backgroundColor || '#F5F3EF'}
                              onChange={handleColorChange}
                              className="w-12 h-12 border border-[#e8e4dc] rounded-md cursor-pointer p-1"
                        />
                        <input
                              type="text"
                              name="backgroundColor"
                              value={formData.backgroundColor || ''}
                              onChange={handleChange}
                              className="flex-1 border border-[#e8e4dc] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                        />
                  </div>
            </div>
            <div>
                  <label htmlFor="textColor" className="block text-sm font-medium text-[#1c1c1e]">
                        Text
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                        <input
                              type="color"
                              id="textColor"
                              name="textColor"
                              value={formData.textColor || '#2A1A0E'}
                              onChange={handleColorChange}
                              className="w-12 h-12 border border-[#e8e4dc] rounded-md cursor-pointer p-1"
                        />
                        <input
                              type="text"
                              name="textColor"
                              value={formData.textColor || ''}
                              onChange={handleChange}
                              className="flex-1 border border-[#e8e4dc] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                        />
                  </div>
            </div>
            <div>
                  <label htmlFor="sidebarColor" className="block text-sm font-medium text-[#1c1c1e]">
                        Sidebar
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                        <input
                              type="color"
                              id="sidebarColor"
                              name="sidebarColor"
                              value={formData.sidebarColor || '#1A1816'}
                              onChange={handleColorChange}
                              className="w-12 h-12 border border-[#e8e4dc] rounded-md cursor-pointer p-1"
                        />
                        <input
                              type="text"
                              name="sidebarColor"
                              value={formData.sidebarColor || ''}
                              onChange={handleChange}
                              className="flex-1 border border-[#e8e4dc] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                        />
                  </div>
            </div>
      </div>
      </section>

{/* ── Financial ── */}
      <section>
            <h3 className="text-sm font-semibold text-[#1c1c1e] mb-3">Financial</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                        <label htmlFor="bookingFee" className="block text-sm font-medium text-[#1c1c1e]">
                              Booking Fee ($)
                        </label>
                        <input
                              type="number"
                              id="bookingFee"
                              name="bookingFee"
                              value={formData.bookingFee || 0}
                              onChange={handleChange}
                              min="0"
                              step="0.01"
                              className="mt-1 w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                        />
                  </div>
                  <div>
                        <label htmlFor="taxRate" className="block text-sm font-medium text-[#1c1c1e]">
                              Tax Rate (%)
                        </label>
                        <input
                              type="number"
                              id="taxRate"
                              name="taxRate"
                              value={formData.taxRate || 0}
                              onChange={handleChange}
                              min="0"
                              step="0.1"
                              className="mt-1 w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                        />
                  </div>
                  <div>
                        <label htmlFor="depositPercentage" className="block text-sm font-medium text-[#1c1c1e]">
                              Deposit (%)
                        </label>
                        <input
                              type="number"
                              id="depositPercentage"
                              name="depositPercentage"
                              value={formData.depositPercentage || 25}
                              onChange={handleChange}
                              min="0"
                              max="100"
                              step="1"
                              className="mt-1 w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                        />
                  </div>
            </div>
      </section>

{/* ── Contact ── */}
      <section>
            <h3 className="text-sm font-semibold text-[#1c1c1e] mb-3">Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                        <label htmlFor="contactEmail" className="block text-sm font-medium text-[#1c1c1e]">
                              Contact Email
                        </label>
                        <input
                              type="email"
                              id="contactEmail"
                              name="contactEmail"
                              value={formData.contactEmail || ''}
                              onChange={handleChange}
                              className="mt-1 w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                        />
                  </div>
                  <div>
                        <label htmlFor="contactPhone" className="block text-sm font-medium text-[#1c1c1e]">
                              Contact Phone
                        </label>
                        <input
                              type="tel"
                              id="contactPhone"
                              name="contactPhone"
                              value={formData.contactPhone || ''}
                              onChange={handleChange}
                              className="mt-1 w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                        />
                  </div>
            </div>

{/* Venue Address */}
            <div className="mt-4">
                  <label htmlFor="address" className="block text-sm font-medium text-[#1c1c1e]">
                        Venue Address
                  </label>
                  <textarea
                        id="address"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        rows={2}
                        className="mt-1 w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                  />
            </div>
      </section>

{/* ── Font ── */}
      <section>
            <h3 className="text-sm font-semibold text-[#1c1c1e] mb-3">Typography</h3>
            <div>
                  <label htmlFor="fontFamily" className="block text-sm font-medium text-[#1c1c1e]">
                        Font Family (CSS stack)
                  </label>
                  <input
                        type="text"
                        id="fontFamily"
                        name="fontFamily"
                        value={formData.fontFamily || 'Inter, system-ui, sans-serif'}
                        onChange={handleChange}
                        className="mt-1 w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
                  />
                  <p className="text-xs text-[#8e8e93] mt-1">
                        Example: <span className="font-mono">'Inter', system-ui, sans-serif</span>
                  </p>
            </div>
      </section>
      </div>

{/* Footer Buttons */}
      <div className="px-6 py-4 border-t border-[#e8e4dc] bg-[#faf9f7] flex flex-wrap items-center justify-between gap-3">
            <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-md border border-[#e8e4dc] hover:bg-gray-50 transition text-sm"
            >
                  Reset
            </button>
            <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#1c1c1e] text-white hover:bg-[#2c2c2e] transition text-sm disabled:opacity-50"
            >
            <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Settings'}
            </button>
      </div>
      </form>
      );
}