// src/components/admin/DashboardCharts.tsx
interface Props {
  monthly: { month: string; revenue: number }[];
  statusCounts: { paid: number; partial: number; unpaid: number };
  revenueSlices: { label: string; value: number }[];
}

const COLORS = ['#374151','#10b981','#f59e0b','#3b82f6','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#6b7280'];

function PieChart({ slices }: { slices: { label: string; value: number }[] }) {
  const total = slices.reduce((s, i) => s + i.value, 0);
  if (total === 0) return <p className="text-xs text-[#9ca3af] text-center py-8">No revenue data</p>;

  const r = 40; const cx = 55; const cy = 55;
  let cumulative = 0;

  const paths = slices.map(({ value }, i) => {
    const pct = value / total;
    const start = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const end = cumulative * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    return { d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${pct > 0.5 ? 1 : 0},1 ${x2},${y2} Z`, color: COLORS[i % COLORS.length] };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 110 110" className="w-24 h-24 shrink-0">
        {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} />)}
        <circle cx={cx} cy={cy} r={22} fill="white" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">${(total/1000).toFixed(1)}k</text>
      </svg>
      <ul className="space-y-1 overflow-y-auto max-h-28 pr-1 flex-1">
        {slices.map(({ label, value }, i) => (
          <li key={label} className="flex items-center gap-1.5 text-[0.6rem]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-[#6b7280] truncate">{label}</span>
            <span className="font-medium text-[#111827] ml-auto pl-2 shrink-0">${value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarChart({ monthly }: { monthly: Props['monthly'] }) {
  const max = Math.max(...monthly.map(m => m.revenue), 1);
  return (
    <div className="flex items-end gap-1 h-28 w-full">
      {monthly.map(({ month, revenue }) => (
        <div key={month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div
            className="w-full rounded-t-sm bg-[#374151] opacity-80 hover:opacity-100 transition"
            style={{ height: `${Math.max((revenue / max) * 100, 2)}%` }}
            title={`$${revenue.toLocaleString()}`}
          />
          <span className="text-[0.55rem] text-[#9ca3af] truncate w-full text-center">{month}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardCharts({ monthly, revenueSlices }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 shadow-sm">
        <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Revenue by Month</p>
        <BarChart monthly={monthly} />
      </div>
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 shadow-sm">
        <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Revenue by Event Type</p>
        <PieChart slices={revenueSlices} />
      </div>
    </div>
  );
}
