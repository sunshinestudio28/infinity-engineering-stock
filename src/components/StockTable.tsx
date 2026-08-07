import { useState } from 'react';
import type { StockEntry } from '@/types';
import { formatDate } from '@/lib/stockUtils';
import { deleteStock } from '@/lib/stockService';
import { Button, Modal } from './ui';
import { ArrowDownToLine, ArrowUpFromLine, Trash2, ImageOff, Search } from 'lucide-react';

export default function StockTable({ entries }: { entries: StockEntry[] }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<StockEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteStock(toDelete.id, toDelete.photoUrl);
      setToDelete(null);
    } catch {
      // ignore; user can retry
    } finally {
      setDeleting(false);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-navy-100 bg-white p-10 text-center">
        <Search className="w-10 h-10 text-navy-200 mx-auto mb-3" />
        <p className="text-navy-500 font-medium">No stock entries found.</p>
        <p className="text-navy-400 text-sm mt-1">Add a Stock In entry or adjust your search.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-navy-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-navy-900 text-white text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-3 font-semibold">Type</th>
                <th className="text-left px-3 py-3 font-semibold">Date</th>
                <th className="text-left px-3 py-3 font-semibold">Model</th>
                <th className="text-left px-3 py-3 font-semibold">Serial</th>
                <th className="text-left px-3 py-3 font-semibold">HP</th>
                <th className="text-left px-3 py-3 font-semibold">Phase</th>
                <th className="text-right px-3 py-3 font-semibold">Qty</th>
                <th className="text-left px-3 py-3 font-semibold">Party</th>
                <th className="text-left px-3 py-3 font-semibold">Invoice</th>
                <th className="text-left px-3 py-3 font-semibold">Remarks</th>
                <th className="text-center px-3 py-3 font-semibold">Photo</th>
                <th className="text-center px-3 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-navy-50/40">
                  <td className="px-3 py-2.5">
                    {e.type === 'in' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <ArrowDownToLine className="w-3 h-3" /> In
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <ArrowUpFromLine className="w-3 h-3" /> Out
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-navy-700 whitespace-nowrap">{formatDate(e.date)}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-navy-900">{e.modelName}</div>
                    <div className="text-xs text-navy-400">{e.modelNumber}</div>
                  </td>
                  <td className="px-3 py-2.5 text-navy-700 font-mono text-xs">{e.serialNumber || '-'}</td>
                  <td className="px-3 py-2.5 text-navy-700">{e.hp || '-'}</td>
                  <td className="px-3 py-2.5 text-navy-700">{e.phase || '-'}</td>
                  <td className={`px-3 py-2.5 text-right font-bold ${e.type === 'in' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {e.quantity}
                  </td>
                  <td className="px-3 py-2.5 text-navy-700">{e.party || '-'}</td>
                  <td className="px-3 py-2.5 text-navy-700">{e.invoiceNumber || '-'}</td>
                  <td className="px-3 py-2.5 text-navy-500 max-w-[180px] truncate">{e.remarks || '-'}</td>
                  <td className="px-3 py-2.5 text-center">
                    {e.photoUrl ? (
                      <button onClick={() => setPreview(e.photoUrl)} className="inline-block">
                        <img src={e.photoUrl} alt="" className="w-10 h-10 rounded object-cover border border-navy-200 hover:opacity-80" />
                      </button>
                    ) : (
                      <ImageOff className="w-5 h-5 text-navy-200 mx-auto" />
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => setToDelete(e)}
                      className="text-navy-300 hover:text-rose-600 transition-colors p-1"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Product Photo" wide>
        {preview && <img src={preview} alt="Product" className="w-full rounded-lg" />}
      </Modal>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete entry?">
        <p className="text-sm text-navy-600 mb-5">
          This will permanently delete this stock entry and its photo. This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
