import type { StockEntry, ModelAggregate, DateAggregate } from '@/types';

export function aggregateByModel(entries: StockEntry[]): ModelAggregate[] {
  const map = new Map<string, ModelAggregate>();
  for (const e of entries) {
    const key = `${e.modelName}__${e.modelNumber}`;
    const qty = Number(e.quantity) || 0;
    const existing = map.get(key);
    if (existing) {
      if (e.type === 'in') {
        existing.totalIn += qty;
        if (!existing.lastInDate || e.date > existing.lastInDate) existing.lastInDate = e.date;
      } else {
        existing.totalOut += qty;
        if (!existing.lastOutDate || e.date > existing.lastOutDate) existing.lastOutDate = e.date;
      }
    } else {
      map.set(key, {
        modelName: e.modelName,
        modelNumber: e.modelNumber,
        totalIn: e.type === 'in' ? qty : 0,
        totalOut: e.type === 'out' ? qty : 0,
        balance: 0,
        lastInDate: e.type === 'in' ? e.date : null,
        lastOutDate: e.type === 'out' ? e.date : null,
      });
    }
  }
  const result = Array.from(map.values());
  for (const r of result) r.balance = r.totalIn - r.totalOut;
  return result.sort((a, b) => a.modelName.localeCompare(b.modelName));
}

export function aggregateByDate(entries: StockEntry[]): DateAggregate[] {
  const map = new Map<string, DateAggregate>();
  for (const e of entries) {
    const existing = map.get(e.date);
    const qty = Number(e.quantity) || 0;
    if (existing) {
      if (e.type === 'in') existing.totalIn += qty;
      else existing.totalOut += qty;
    } else {
      map.set(e.date, {
        date: e.date,
        totalIn: e.type === 'in' ? qty : 0,
        totalOut: e.type === 'out' ? qty : 0,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
}

export function modelBalanceFor(entries: StockEntry[], modelName: string, modelNumber: string): number {
  let bal = 0;
  for (const e of entries) {
    if (e.modelName === modelName && e.modelNumber === modelNumber) {
      bal += e.type === 'in' ? Number(e.quantity) || 0 : -(Number(e.quantity) || 0);
    }
  }
  return bal;
}

export function filterEntries(
  entries: StockEntry[],
  term: string,
  startDate?: string,
  endDate?: string,
  type?: 'in' | 'out' | 'all'
): StockEntry[] {
  const t = term.trim().toLowerCase();
  return entries.filter((e) => {
    if (type && type !== 'all' && e.type !== type) return false;
    if (startDate && e.date < startDate) return false;
    if (endDate && e.date > endDate) return false;
    if (!t) return true;
    return (
      e.modelName.toLowerCase().includes(t) ||
      e.modelNumber.toLowerCase().includes(t) ||
      e.serialNumber.toLowerCase().includes(t)
    );
  });
}

export function totalsFor(entries: StockEntry[]): { totalIn: number; totalOut: number; balance: number } {
  let totalIn = 0;
  let totalOut = 0;
  for (const e of entries) {
    const qty = Number(e.quantity) || 0;
    if (e.type === 'in') totalIn += qty;
    else totalOut += qty;
  }
  return { totalIn, totalOut, balance: totalIn - totalOut };
}

export function formatDate(iso: string): string {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
