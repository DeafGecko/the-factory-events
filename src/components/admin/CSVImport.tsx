// src/components/admin/CSVImport.tsx
import { useState } from 'react';
import { Upload, FileDown, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportStats {
  imported: number;
  failed: number;
  errors: Array<{ row: any; error: string }>;
}

export default function CSVImport() {
  const [entityType, setEntityType] = useState('clients');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const entityTypes = [
    { value: 'bills',     label: 'Bills / Payments' },
    { value: 'bookings',  label: 'Bookings' },
    { value: 'clients',   label: 'Clients' },
    { value: 'spaces',    label: 'Spaces' },
    { value: 'tenants',   label: 'Tenants' },
    { value: 'vendors',   label: 'Vendors' },
    { value: 'waitlist',  label: 'Waitlist' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStats(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setStats(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templates: Record<string, string> = {
      bills: 'client_email,amount,paid,status\njane@example.com,1500,1500,paid\njohn@example.com,2000,1000,partial\nalice@example.com,750,0,unpaid',
      bookings: 'client_name,email,phone,event_date,event_type,guest_count,space_code,total_price,payment_status\nJohn Doe,john@example.com,555-1234,2026-07-15,wedding,100,P089,1500,paid',
      clients: 'name,email,phone,address,company\nJane Doe,jane@example.com,555-1234,123 Main St,Acme Corp',
      spaces: 'code,name,type,capacity,is_available\nP001,Main Ballroom,party,120,true',
      tenants: 'name,email,phone,lease_start,lease_end,unit\nBob Tenant,bob@example.com,555-1111,2026-01-01,2026-12-31,A101',
      vendors: 'name,contact,email,phone,service_type\nCatering Co.,Maria,maria@catering.com,555-3333,catering',
      waitlist: 'name,email,phone,event_type,date,guests,status\nJohn Doe,john@example.com,555-1234,wedding,2026-07-15,100,pending',
    };

    const content = templates[entityType] || '';
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-[#e8e4dc] shadow-sm p-6 max-w-2xl">
      <h3 className="text-lg font-light tracking-wide mb-2">Import Data</h3>
      <p className="text-sm text-[#8e8e93] mb-6">
        Upload a CSV file to import your existing data into Venue Operations.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1c1c1e] mb-1">
            Entity Type
          </label>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="w-full border border-[#e8e4dc] rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1c1e]"
          >
            {entityTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 border border-[#e8e4dc] rounded-md hover:bg-[#f5f3ef] transition text-sm"
          >
            <FileDown className="w-4 h-4" />
            Download Template
          </button>
          <span className="text-sm text-[#8e8e93]">or</span>
          <label className="cursor-pointer px-4 py-2 border border-[#e8e4dc] rounded-md hover:bg-[#f5f3ef] transition text-sm">
            <Upload className="w-4 h-4 inline mr-1" />
            Choose CSV File
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {file && (
          <div className="text-sm text-[#6a5a4a]">
            📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="px-6 py-2.5 rounded-md bg-[#1c1c1e] text-white hover:bg-[#2c2c2e] transition text-sm disabled:opacity-50"
        >
          {loading ? 'Importing...' : 'Import Data'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {stats && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-sm">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle className="w-4 h-4" />
            Import complete!
          </div>
          <div className="mt-1 text-emerald-700">
            ✅ {stats.imported} imported
            {stats.failed > 0 && (
              <span className="ml-2 text-red-600">❌ {stats.failed} failed</span>
            )}
          </div>
          {stats.errors.length > 0 && (
            <details className="mt-2 text-xs text-[#8e8e93]">
              <summary className="cursor-pointer">View errors</summary>
              <ul className="mt-1 space-y-1 max-h-40 overflow-y-auto">
                {stats.errors.map((e, i) => (
                  <li key={i} className="border-b border-emerald-100 pb-1">
                    <span className="font-mono text-[10px]">{JSON.stringify(e.row)}</span>
                    <span className="text-red-600"> → {e.error}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}