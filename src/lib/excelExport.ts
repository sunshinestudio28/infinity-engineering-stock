import * as XLSX from 'xlsx';
import type { StockEntry, ModelAggregate, DateAggregate } from '@/types';
import { formatDate } from './stockUtils';

export function exportEntriesToExcel(entries: StockEntry[], fileName = 'stock_entries') {
  const rows = entries.map((e) => ({
    Type: e.type === 'in' ? 'Stock In' : 'Stock Out',
    Date: formatDate(e.date),
    'Model Name': e.modelName,
    'Model Number': e.modelNumber,
    'Serial Number': e.serialNumber,
    HP: e.hp,
    Phase: e.phase,
    Quantity: e.quantity,
    Party: e.party,
    'Invoice Number': e.invoiceNumber,
    Remarks: e.remarks,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Entries');
  XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportModelSummaryToExcel(aggregates: ModelAggregate[]) {
  const rows = aggregates.map((a) => ({
    'Model Name': a.modelName,
    'Model Number': a.modelNumber,
    'Total In': a.totalIn,
    'Total Out': a.totalOut,
    'Current Balance': a.balance,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Model Summary');
  XLSX.writeFile(wb, `model_summary_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportDateSummaryToExcel(aggregates: DateAggregate[]) {
  const rows = aggregates.map((a) => ({
    Date: formatDate(a.date),
    'Total In': a.totalIn,
    'Total Out': a.totalOut,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Date Summary');
  XLSX.writeFile(wb, `date_summary_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
