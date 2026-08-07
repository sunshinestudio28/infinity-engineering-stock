import type { StockEntry, ModelAggregate, DateAggregate } from '@/types';
import { StatCard } from './ui';
import { formatDate } from '@/lib/stockUtils';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Scale,
  CalendarDays,
  Package,
} from 'lucide-react';

export function SummaryCards({ entries }: { entries: StockEntry[] }) {
  let totalIn = 0;
  let totalOut = 0;
  let models = new Set<string>();
  for (const e of entries) {
    const q = Number(e.quantity) || 0;
    if (e.type === 'in') totalIn += q;
    else totalOut += q;
    models.add(`${e.modelName}__${e.modelNumber}`);
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard label="Total Stock In" value={totalIn} tone="green" icon={<ArrowDownToLine className="w-5 h-5" />} />
      <StatCard label="Total Stock Out" value={totalOut} tone="red" icon={<ArrowUpFromLine className="w-5 h-5" />} />
      <StatCard label="Current Balance" value={totalIn - totalOut} tone="navy" icon={<Scale className="w-5 h-5" />} />
      <StatCard label="Unique Models" value={models.size} tone="amber" icon={<Package className="w-5 h-5" />} />
    </div>
  );
}

export function ModelSearchSummary({ aggregates, term }: { aggregates: ModelAggregate[]; term: string }) {
  if (!term.trim()) return null;
  if (aggregates.length === 0) return null;
  return (
    <div className="space-y-3 fade-in">
      <p className="text-sm font-semibold text-navy-700">
        Search results for &ldquo;{term}&rdquo; — {aggregates.length} matching {aggregates.length === 1 ? 'model' : 'models'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {aggregates.map((a, i) => (
          <div key={i} className="bg-white rounded-xl border border-navy-100 overflow-hidden">
            <div className="px-4 py-3 bg-navy-900 text-white">
              <p className="font-bold text-sm truncate">{a.modelName}</p>
              <p className="text-xs text-navy-300">{a.modelNumber}</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3">
              <SummaryField label="Total Stock In" value={a.totalIn} tone="green" />
              <SummaryField label="Total Stock Out" value={a.totalOut} tone="red" />
              <SummaryField label="Current Balance" value={a.balance} tone="navy" />
              <SummaryField label="Last In Date" value={a.lastInDate ? formatDate(a.lastInDate) : '-'} tone="green" />
              <SummaryField label="Last Out Date" value={a.lastOutDate ? formatDate(a.lastOutDate) : '-'} tone="red" full />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryField({
  label,
  value,
  tone,
  full,
}: {
  label: string;
  value: React.ReactNode;
  tone: 'green' | 'red' | 'navy';
  full?: boolean;
}) {
  const tones: Record<string, string> = {
    green: 'text-emerald-700',
    red: 'text-rose-700',
    navy: 'text-navy-900',
  };
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-400">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${tones[tone]}`}>{value}</p>
    </div>
  );
}

export function DateSummary({ dateAggregates }: { dateAggregates: DateAggregate[] }) {
  if (dateAggregates.length === 0) return null;
  return (
    <div className="rounded-xl border border-navy-100 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-navy-100 flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-navy-600" />
        <h3 className="font-semibold text-navy-900 text-sm">Date-wise Summary</h3>
      </div>
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-navy-600 text-xs uppercase sticky top-0">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">Date</th>
              <th className="text-right px-4 py-2 font-semibold">Stock In</th>
              <th className="text-right px-4 py-2 font-semibold">Stock Out</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {dateAggregates.map((d) => (
              <tr key={d.date} className="hover:bg-navy-50/50">
                <td className="px-4 py-2 text-navy-800 font-medium">{formatDate(d.date)}</td>
                <td className="px-4 py-2 text-right text-emerald-700 font-medium">{d.totalIn}</td>
                <td className="px-4 py-2 text-right text-rose-700 font-medium">{d.totalOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
