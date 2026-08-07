import { useMemo, useState, useEffect } from 'react';
import type { StockEntry, ModelAggregate } from '@/types';
import { subscribeStock } from '@/lib/stockService';
import { useAuth } from '@/lib/authContext';
import {
  aggregateByModel,
  aggregateByDate,
  filterEntries,
  totalsFor,
} from '@/lib/stockUtils';
import {
  exportEntriesToExcel,
  exportModelSummaryToExcel,
  exportDateSummaryToExcel,
} from '@/lib/excelExport';
import { SummaryCards, ModelSearchSummary, DateSummary } from './Summary';
import StockTable from './StockTable';
import StockForm from './StockForm';
import { Button, Modal, Spinner } from './ui';
import {
  Plus,
  Search,
  Download,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileSpreadsheet,
  CalendarDays,
  AlertTriangle,
} from 'lucide-react';

type FilterType = 'all' | 'in' | 'out';

export default function Dashboard() {
  const { user, logOut } = useAuth();
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [term, setTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<FilterType>('all');
  const [showForm, setShowForm] = useState(false);
  const [showDateSummary, setShowDateSummary] = useState(false);

  useEffect(() => {
    const unsub = subscribeStock(
      (items) => {
        setEntries(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(
    () => filterEntries(entries, term, startDate, endDate, type),
    [entries, term, startDate, endDate, type]
  );

  const allModelAggregates = useMemo(() => aggregateByModel(entries), [entries]);
  const dateAggregates = useMemo(() => aggregateByDate(entries), [entries]);

  const searchModelAggregates: ModelAggregate[] = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return [];
    return allModelAggregates.filter(
      (a) =>
        a.modelName.toLowerCase().includes(t) ||
        a.modelNumber.toLowerCase().includes(t)
    );
  }, [allModelAggregates, term]);

  const filteredTotals = useMemo(() => totalsFor(filtered), [filtered]);

  const hasDateFilter = Boolean(startDate || endDate);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-navy-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg leading-tight truncate">Infinity Engineering Stock</h1>
              <p className="text-navy-300 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={logOut} className="shrink-0">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5 sm:space-y-6">
        {error && (
          <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <SummaryCards entries={entries} />

        {loading ? (
          <Spinner className="py-20" />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4" /> Add Entry
                </Button>
                <Button variant="outline" onClick={() => exportEntriesToExcel(filtered, 'stock_filtered')}>
                  <Download className="w-4 h-4" /> Export Entries
                </Button>
                <Button variant="outline" onClick={() => exportModelSummaryToExcel(allModelAggregates)}>
                  <FileSpreadsheet className="w-4 h-4" /> Model Summary
                </Button>
                <Button variant="outline" onClick={() => setShowDateSummary(true)}>
                  <CalendarDays className="w-4 h-4" /> Date Summary
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-navy-100 bg-white p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search by model name, model number or serial number (e.g. ETN)..."
                  className="field-input w-full pl-9 pr-3 py-2.5 rounded-lg border border-navy-200 text-sm"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="flex gap-2 bg-navy-50 p-1 rounded-lg">
                  {(['all', 'in', 'out'] as FilterType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                        type === t ? 'bg-navy-900 text-white shadow' : 'text-navy-600 hover:text-navy-900'
                      }`}
                    >
                      {t === 'all' ? 'All' : t === 'in' ? 'Stock In' : 'Stock Out'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-navy-600">
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="field-input px-2 py-1.5 rounded-md border border-navy-200 text-sm" />
                  <span className="text-navy-400">to</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="field-input px-2 py-1.5 rounded-md border border-navy-200 text-sm" />
                  {(startDate || endDate) && (
                    <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-xs text-navy-500 hover:text-rose-600 underline">
                      clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {term.trim() && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-xl border border-emerald-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Total In (filtered)</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{filteredTotals.totalIn}</p>
                </div>
                <div className="rounded-xl border border-rose-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Total Out (filtered)</p>
                  <p className="text-2xl font-bold text-rose-700 mt-1">{filteredTotals.totalOut}</p>
                </div>
                <div className="rounded-xl border border-navy-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Balance (filtered)</p>
                  <p className="text-2xl font-bold text-navy-900 mt-1">{filteredTotals.balance}</p>
                </div>
                <div className="rounded-xl border border-navy-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Entries</p>
                  <p className="text-2xl font-bold text-navy-900 mt-1">{filtered.length}</p>
                </div>
              </div>
            )}

            {hasDateFilter && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
                  <p className="text-xs font-semibold uppercase text-navy-500">In (date range)</p>
                  <p className="text-xl font-bold text-emerald-700">{filteredTotals.totalIn}</p>
                </div>
                <div className="rounded-xl border border-rose-100 bg-white p-3 text-center">
                  <p className="text-xs font-semibold uppercase text-navy-500">Out (date range)</p>
                  <p className="text-xl font-bold text-rose-700">{filteredTotals.totalOut}</p>
                </div>
                <div className="rounded-xl border border-navy-100 bg-white p-3 text-center">
                  <p className="text-xs font-semibold uppercase text-navy-500">Balance</p>
                  <p className="text-xl font-bold text-navy-900">{filteredTotals.balance}</p>
                </div>
              </div>
            )}

            <ModelSearchSummary aggregates={searchModelAggregates} term={term} />

            <StockTable entries={filtered} />
          </>
        )}
      </main>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Stock Entry" wide>
        <StockForm allEntries={entries} onDone={() => setShowForm(false)} />
      </Modal>

      <Modal open={showDateSummary} onClose={() => setShowDateSummary(false)} title="Date-wise Stock Summary" wide>
        <div className="flex justify-end mb-3">
          <Button size="sm" variant="outline" onClick={() => exportDateSummaryToExcel(dateAggregates)}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
        <DateSummary dateAggregates={dateAggregates} />
      </Modal>
    </div>
  );
}
