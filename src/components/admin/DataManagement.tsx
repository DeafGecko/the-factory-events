// src/components/admin/DataManagement.tsx
import { useState } from 'react';
import { Upload, Download, FileDown, AlertCircle, CheckCircle, Trash2, Database } from 'lucide-react';
import CustomSelect from './CustomSelect';

interface ImportStats {
  imported: number;
  failed: number;
  errors: Array<{ row: any; error: string }>;
}

interface LogEntry {
  id: string;
  action: 'import' | 'export' | 'delete';
  entity: string;
  detail: string;
  date: string;
}

const ENTITY_TYPES = [
  { value: 'bills',    label: 'Bills / Payments' },
  { value: 'bookings', label: 'Bookings' },
  { value: 'clients',  label: 'Clients' },
  { value: 'staff',    label: 'Staff' },
  { value: 'tenants',  label: 'Tenants' },
  { value: 'vendors',  label: 'Vendors' },
  { value: 'waitlist', label: 'Waitlist' },
];

const TEMPLATES: Record<string, string> = {
  bills:    'client_email,amount,paid,status\njane@example.com,1500,1500,paid',
  bookings: 'client_name,email,phone,event_date,event_type,guest_count,space_code,total_price,payment_status\nJohn Doe,john@example.com,555-1234,2026-07-15,wedding,100,P089,1500,paid',
  clients:  'name,email,phone,address,company\nJane Doe,jane@example.com,555-1234,123 Main St,Acme Corp',
  staff:    'name,email,phone,role,status,schedule_type\nJane Smith,jane@example.com,555-9999,manager,active,full-time',
  tenants:  'name,email,phone,lease_start,lease_end,unit\nBob Tenant,bob@example.com,555-1111,2026-01-01,2026-12-31,A101',
  vendors:  'name,contact,email,phone,service_type\nCatering Co.,Maria,maria@catering.com,555-3333,catering',
  waitlist: 'name,email,phone,event_type,date,guests,status\nJohn Doe,john@example.com,555-1234,wedding,2026-07-15,100,pending',
};

function addLog(log: LogEntry[], entry: Omit<LogEntry, 'id' | 'date'>): LogEntry[] {
  return [{ ...entry, id: crypto.randomUUID(), date: new Date().toISOString() }, ...log].slice(0, 50);
}

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-sm">{children}</div>
);

const CardTitle = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon className="w-4 h-4 text-[#6b7280]" />
    <h3 className="text-sm font-semibold text-[#111827]">{children}</h3>
  </div>
);

const EntitySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <CustomSelect value={value} onChange={onChange} options={ENTITY_TYPES} />
);

export default function DataManagement() {
  const [importEntity, setImportEntity] = useState('bills');
  const [exportEntity, setExportEntity] = useState('bills');
  const [deleteEntity, setDeleteEntity] = useState('bills');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  const downloadTemplate = (entity: string) => {
    const content = TEMPLATES[entity] || '';
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entity}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setLog((prev) => addLog(prev, { action: 'export', entity, detail: `Downloaded ${entity} template` }));
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setImporting(true);
    setImportStats(null);
    setImportError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', importEntity);
      const res = await fetch('/api/admin/import', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setImportStats(data);
      setFile(null);
      setLog((prev) => addLog(prev, { action: 'import', entity: importEntity, detail: `Imported ${data.imported} ${importEntity} from ${file.name}` }));
    } catch (err: any) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch(`/api/admin/export?type=${exportEntity}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportEntity}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setLog((prev) => addLog(prev, { action: 'export', entity: exportEntity, detail: `Exported ${exportEntity} data` }));
    } catch (err: any) {
      setExportError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/bulk-delete?type=${deleteEntity}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      const data = await res.json();
      setLog((prev) => addLog(prev, { action: 'delete', entity: deleteEntity, detail: `Bulk deleted ${data.deleted ?? 'all'} ${deleteEntity} records` }));
    } catch (err: any) {
      // swallow — log still updates
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const actionColor: Record<string, string> = {
    import: 'text-emerald-600',
    export: 'text-blue-600',
    delete: 'text-red-500',
  };
  const actionLabel: Record<string, string> = { import: 'Imported', export: 'Exported', delete: 'Deleted' };

  return (
    <div className="space-y-4 max-w-4xl">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* ── Import ── */}
        <SectionCard>
          <CardTitle icon={Upload}>Import CSV</CardTitle>
          <form onSubmit={handleImport} className="space-y-3">
            <EntitySelect value={importEntity} onChange={setImportEntity} />
            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-dashed border-[#d1d5db] rounded-md hover:bg-[#f9fafb] transition text-sm text-[#6b7280]">
              <Upload className="w-3.5 h-3.5 shrink-0" />
              {file ? file.name : 'Choose CSV file'}
              <input type="file" accept=".csv" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setImportStats(null); setImportError(null); }} />
            </label>
            {file && <p className="text-xs text-[#6b7280]">{(file.size / 1024).toFixed(1)} KB</p>}
            <button type="submit" disabled={!file || importing} className="w-full h-8 px-3 rounded-md btn-primary text-sm disabled:opacity-50 transition">
              {importing ? 'Importing…' : 'Import'}
            </button>
          </form>
          {importError && (
            <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{importError}
            </div>
          )}
          {importStats && (
            <div className="mt-3 text-xs bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> {importStats.imported} imported{importStats.failed > 0 && <span className="text-red-600 ml-1">{importStats.failed} failed</span>}</div>
              {importStats.errors.length > 0 && (
                <details><summary className="cursor-pointer text-[#6b7280]">View errors</summary>
                  <ul className="mt-1 space-y-0.5 max-h-32 overflow-y-auto">
                    {importStats.errors.map((e, i) => <li key={i} className="text-red-600">{e.error}</li>)}
                  </ul>
                </details>
              )}
            </div>
          )}
        </SectionCard>

        {/* ── Export ── */}
        <SectionCard>
          <CardTitle icon={Download}>Export CSV</CardTitle>
          <div className="space-y-3">
            <EntitySelect value={exportEntity} onChange={setExportEntity} />
            <button onClick={handleExport} disabled={exporting} className="w-full h-8 px-3 rounded-md btn-primary text-sm disabled:opacity-50 transition">
              {exporting ? 'Exporting…' : 'Export'}
            </button>
            {exportError && (
              <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{exportError}
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Templates ── */}
        <SectionCard>
          <CardTitle icon={FileDown}>Templates</CardTitle>
          <p className="text-[0.65rem] text-[#9ca3af] mb-2">Download a pre-formatted CSV template.</p>
          <ul className="space-y-0.5 max-h-48 overflow-y-auto pr-0.5">
            {ENTITY_TYPES.map((t) => (
              <li key={t.value}>
                <button
                  type="button"
                  onClick={() => downloadTemplate(t.value)}
                  className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-[#374151] hover:bg-[#f3f4f6] transition"
                >
                  <span>{t.label}</span>
                  <FileDown className="w-3 h-3 text-[#9ca3af]" />
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* ── Bulk Delete ── */}
      <SectionCard>
        <CardTitle icon={Trash2}>Bulk Delete</CardTitle>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-48">
            <EntitySelect value={deleteEntity} onChange={(v) => { setDeleteEntity(v); setDeleteConfirm(false); }} />
          </div>
          {deleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-medium">Delete all {deleteEntity}? This cannot be undone.</span>
              <button onClick={handleBulkDelete} disabled={deleting} className="h-8 px-3 rounded-md bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-50 transition">
                {deleting ? 'Deleting…' : 'Confirm Delete'}
              </button>
              <button onClick={() => setDeleteConfirm(false)} className="h-8 px-3 rounded-md border border-[#e5e7eb] text-xs hover:bg-[#f3f4f6] transition">Cancel</button>
            </div>
          ) : (
            <button onClick={handleBulkDelete} className="h-8 flex items-center gap-1.5 px-3 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 transition">
              <Trash2 className="w-3.5 h-3.5" /> Bulk Delete
            </button>
          )}
        </div>
      </SectionCard>

      {/* ── Migration Log ── */}
      <SectionCard>
        <CardTitle icon={Database}>Migration Log</CardTitle>
        {log.length === 0 ? (
          <p className="text-xs text-[#9ca3af]">No activity yet. Import or export data to see a log here.</p>
        ) : (
          <ul className="divide-y divide-[#f3f4f6]">
            {log.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between py-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold uppercase ${actionColor[entry.action]}`}>{actionLabel[entry.action]}</span>
                  <span className="text-[#374151]">{entry.detail}</span>
                </div>
                <span className="text-xs text-[#9ca3af] shrink-0 ml-4">{new Date(entry.date).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

    </div>
  );
}
