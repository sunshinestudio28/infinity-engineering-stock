import { useState, type FormEvent } from 'react';
import type { StockEntry, StockEntryInput, TransactionType } from '@/types';
import { addStock } from '@/lib/stockService';
import { checkSerialExists } from '@/lib/stockService';
import { modelBalanceFor } from '@/lib/stockUtils';
import { useAuth } from '@/lib/authContext';
import { Button, Spinner } from './ui';
import PhotoPicker from './PhotoPicker';
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Loader2 } from 'lucide-react';

interface Props {
  allEntries: StockEntry[];
  onDone: () => void;
}

const EMPTY: StockEntryInput = {
  type: 'in',
  date: new Date().toISOString().slice(0, 10),
  modelName: '',
  modelNumber: '',
  serialNumber: '',
  hp: '',
  phase: '',
  quantity: 1,
  party: '',
  invoiceNumber: '',
  remarks: '',
  photoUrl: null,
};

export default function StockForm({ allEntries, onDone }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState<StockEntryInput>(EMPTY);
  const [photo, setPhoto] = useState<File | null>(null);
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const set = <K extends keyof StockEntryInput>(key: K, val: StockEntryInput[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const onSelectPhoto = (file: File | null) => {
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const onSerialBlur = async () => {
    const sn = form.serialNumber.trim();
    if (!sn) {
      setWarning('');
      return;
    }
    try {
      const exists = await checkSerialExists(sn, undefined);
      setWarning(exists ? 'This serial number already exists in your records.' : '');
    } catch {
      setWarning('');
    }
  };

  const balanceForModel = (): number =>
    modelBalanceFor(allEntries, form.modelName.trim(), form.modelNumber.trim());

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const qty = Number(form.quantity);
    if (!form.modelName.trim()) return setError('Model name is required.');
    if (!form.modelNumber.trim()) return setError('Model number is required.');
    if (!Number.isFinite(qty) || qty <= 0) return setError('Quantity must be a positive number.');

    if (form.type === 'out') {
      const bal = balanceForModel();
      if (qty > bal) {
        return setError(
          `Cannot issue ${qty} units. Available balance for this model is ${bal}.`
        );
      }
    }

    setBusy(true);
    try {
      await addStock(
        {
          ...form,
          modelName: form.modelName.trim(),
          modelNumber: form.modelNumber.trim(),
          serialNumber: form.serialNumber.trim(),
          party: form.party.trim(),
          invoiceNumber: form.invoiceNumber.trim(),
          remarks: form.remarks.trim(),
          quantity: qty,
        },
        photo,
        user?.uid ?? null
      );
      setForm(EMPTY);
      setPhoto(null);
      setPhotoPreview(null);
      setWarning('');
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save entry.';
      setError(msg.replace('Firebase:', '').trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex gap-2 bg-navy-50 p-1 rounded-lg w-full sm:w-auto">
        <button
          type="button"
          onClick={() => set('type', 'in')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm transition-colors ${
            form.type === 'in' ? 'bg-emerald-600 text-white shadow' : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <ArrowDownToLine className="w-4 h-4" /> Stock In
        </button>
        <button
          type="button"
          onClick={() => set('type', 'out')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm transition-colors ${
            form.type === 'out' ? 'bg-rose-600 text-white shadow' : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <ArrowUpFromLine className="w-4 h-4" /> Stock Out
        </button>
      </div>

      {form.type === 'out' && form.modelName && form.modelNumber && (
        <div className="p-3 rounded-lg bg-navy-900 text-white text-sm flex items-center justify-between">
          <span>Available balance for this model:</span>
          <span className="font-bold text-lg">{balanceForModel()} units</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Date" required>
          <input type="date" required value={form.date} onChange={(e) => set('date', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Quantity" required>
          <input type="number" min="1" step="1" required value={form.quantity} onChange={(e) => set('quantity', Number(e.target.value))} className={inputCls} />
        </Field>
        <Field label="Model Name" required>
          <input required value={form.modelName} onChange={(e) => set('modelName', e.target.value)} placeholder="e.g. ETN Motor" className={inputCls} />
        </Field>
        <Field label="Model Number" required>
          <input required value={form.modelNumber} onChange={(e) => set('modelNumber', e.target.value)} placeholder="e.g. ETN-100" className={inputCls} />
        </Field>
        <Field label="Serial Number">
          <input
            value={form.serialNumber}
            onChange={(e) => set('serialNumber', e.target.value)}
            onBlur={onSerialBlur}
            placeholder="Unique serial (optional)"
            className={inputCls}
          />
          {warning && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" /> {warning}
            </p>
          )}
        </Field>
        <Field label="HP">
          <input value={form.hp} onChange={(e) => set('hp', e.target.value)} placeholder="e.g. 2" className={inputCls} />
        </Field>
        <Field label="Phase">
          <select value={form.phase} onChange={(e) => set('phase', e.target.value)} className={inputCls}>
            <option value="">Select phase</option>
            <option value="Single">Single</option>
            <option value="Three">Three</option>
          </select>
        </Field>
        <Field label="Party">
          <input value={form.party} onChange={(e) => set('party', e.target.value)} placeholder="Supplier / customer" className={inputCls} />
        </Field>
        <Field label="Invoice Number">
          <input value={form.invoiceNumber} onChange={(e) => set('invoiceNumber', e.target.value)} placeholder="Invoice ref" className={inputCls} />
        </Field>
        <Field label="Remarks" full>
          <input value={form.remarks} onChange={(e) => set('remarks', e.target.value)} placeholder="Optional notes" className={inputCls} />
        </Field>
      </div>

      <PhotoPicker
        preview={photoPreview}
        fileName={photo?.name ?? null}
        onPick={onSelectPhoto}
        onClear={() => onSelectPhoto(null)}
      />

      {error && (
        <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save {form.type === 'in' ? 'Stock In' : 'Stock Out'}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}

const inputCls =
  'field-input w-full px-3 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 placeholder:text-navy-300 text-sm';

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-medium text-navy-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export { Spinner };
