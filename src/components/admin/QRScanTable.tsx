// src/components/admin/QRScanTable.tsx
import { useState, useEffect } from 'react';
import { Search, QrCode, RefreshCw, XCircle } from 'lucide-react';

interface Scan {
  id: string;
  sanity_event_id: string;
  scanned_by: string;
  scanned_at: number;
  scanned_at_local: string;
  event: {
    _id: string;
    clientName: string;
    accountNumber: string;
    eventDate: string;
  } | null;
}

export default function QRScanTable() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/qr-scans');
      if (!res.ok) throw new Error('Failed to load scans');
      const data = await res.json();
      setScans(data.scans || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScans(); }, []);

  const filteredScans = scans.filter((scan) => {
    const q = search.toLowerCase();
    return (
      scan.event?.clientName?.toLowerCase().includes(q) ||
      scan.event?.accountNumber?.toLowerCase().includes(q) ||
      scan.id?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading scans...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm flex items-center gap-2">
        <XCircle className="w-4 h-4 shrink-0" /> {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-[#e5e7eb] bg-[#f9fafb] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by client, account, or scan ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#e5e7eb] rounded-lg bg-white text-sm text-gray-900 placeholder:text-gray-400 ring-primary transition"
          />
        </div>
        <button
          onClick={fetchScans}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e5e7eb] hover:bg-[#f3f4f6] transition text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f3f4f6]">
              {['Scan ID', 'Event / Booking', 'Client', 'Scanned By', 'Date / Time'].map((h) => (
                <th key={h} className="text-left py-3 px-4 font-semibold text-[#6b7280] text-[10px] uppercase tracking-[0.8px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredScans.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  <QrCode className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-sm">No QR scans recorded yet.</p>
                </td>
              </tr>
            ) : (
              filteredScans.map((scan) => (
                <tr key={scan.id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition">
                  <td className="py-3 px-4 font-mono text-xs text-gray-900">{scan.id.slice(0, 8)}…</td>
                  <td className="py-3 px-4">
                    {scan.event ? (
                      <a href={`/admin/edit/${scan.event._id}`} className="text-gray-900 hover:underline">
                        {scan.event.accountNumber}
                      </a>
                    ) : (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-900">{scan.event?.clientName || '—'}</td>
                  <td className="py-3 px-4 text-[#6b7280]">{scan.scanned_by || '—'}</td>
                  <td className="py-3 px-4 text-[#6b7280]">
                    {scan.scanned_at_local || new Date(scan.scanned_at * 1000).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#e5e7eb] bg-[#f9fafb] flex items-center justify-between text-sm text-[#6b7280]">
        <span>{filteredScans.length} scan{filteredScans.length !== 1 ? 's' : ''} shown</span>
        <span>Total: {scans.length} recorded</span>
      </div>
    </div>
  );
}
