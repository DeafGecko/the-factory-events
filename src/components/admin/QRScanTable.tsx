// src/components/admin/QRScanTable.tsx
import { useState, useEffect } from 'react';
import { QrCode, RefreshCw, XCircle } from 'lucide-react';

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
      <div className="px-3 py-2 border-b border-[#e5e7eb] flex items-center justify-between gap-2">
        <span className="text-xs text-[#9ca3af]">{scans.length} scan{scans.length !== 1 ? 's' : ''} recorded</span>
        <button
          onClick={fetchScans}
          className="h-8 flex items-center gap-1 px-3 rounded-md border border-[#e5e7eb] hover:bg-[#f3f4f6] transition text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              {['Scan ID', 'Event / Booking', 'Client', 'Scanned By', 'Date / Time'].map((h) => (
                <th key={h} className="text-left py-2 px-3 text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {scans.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  <QrCode className="w-8 h-8 mx-auto mb-2 text-[#e5e7eb]" />
                  <p className="text-xs">No QR scans recorded yet.</p>
                </td>
              </tr>
            ) : (
              scans.map((scan) => (
                <tr key={scan.id} className="hover:bg-[#fafafa] transition">
                  <td className="py-2 px-3 font-mono text-xs text-gray-900">{scan.id.slice(0, 8)}…</td>
                  <td className="py-2 px-3">
                    {scan.event ? (
                      <a href={`/admin/edit/${scan.event._id}`} className="text-xs text-gray-900 hover:underline">
                        {scan.event.accountNumber}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Unknown</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900">{scan.event?.clientName || '—'}</td>
                  <td className="py-2 px-3 text-xs text-[#6b7280]">{scan.scanned_by || '—'}</td>
                  <td className="py-2 px-3 text-xs text-[#6b7280]">
                    {scan.scanned_at_local || new Date(scan.scanned_at * 1000).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#9ca3af]">
        <span>Most recent first</span>
        <span>Total: {scans.length} recorded</span>
      </div>
    </div>
  );
}
