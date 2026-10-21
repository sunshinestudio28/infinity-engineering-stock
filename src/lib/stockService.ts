import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { getFirebase } from './firebase';
import type { StockEntry, StockEntryInput } from '@/types';

function assertReady() {
  const { db, storage } = getFirebase();
  if (!db) {
    throw new Error(
      'Firebase is not configured. Check the Firebase configuration in src/lib/firebase.ts.'
    );
  }
  return { db, storage };
}

// Match the existing stock collection name used by the legacy application.
const COLLECTION = 'stockEntries';
const PHOTO_PATH = 'product-photos';

function asString(value: unknown): string {
  return value == null ? '' : String(value);
}

function normalizeStockEntry(id: string, data: Record<string, unknown>): StockEntry {
  const createdAtValue = data.createdAt as { toMillis?: () => number } | number | undefined;
  let createdAt = Date.now();

  if (typeof createdAtValue === 'number' && Number.isFinite(createdAtValue)) {
    createdAt = createdAtValue;
  } else if (createdAtValue && typeof createdAtValue.toMillis === 'function') {
    createdAt = createdAtValue.toMillis();
  }

  const photoValue = data.photoUrl ?? data.photo ?? null;

  return {
    id,
    type: data.type === 'out' ? 'out' : 'in',
    date: asString(data.date),
    modelName: asString(data.modelName),
    modelNumber: asString(data.modelNumber),
    serialNumber: asString(data.serialNumber),
    hp: asString(data.hp ?? data.kw),
    phase: asString(data.phase),
    quantity: Number(data.quantity ?? 0) || 0,
    party: asString(data.party),
    invoiceNumber: asString(data.invoiceNumber),
    remarks: asString(data.remarks),
    photoUrl: typeof photoValue === 'string' ? photoValue : null,
    createdAt,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : null,
  };
}

export function subscribeStock(
  cb: (entries: StockEntry[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const { db } = assertReady();
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const items: StockEntry[] = [];
      snap.forEach((d) => {
        items.push(normalizeStockEntry(d.id, d.data() as Record<string, unknown>));
      });
      cb(items);
    },
    (err) => onError(err as Error)
  );
}

export async function addStock(
  entry: StockEntryInput,
  photo: File | null,
  uid: string | null
): Promise<StockEntry> {
  const { db, storage } = assertReady();
  let photoUrl: string | null = null;

  if (photo && storage) {
    const path = `${PHOTO_PATH}/${Date.now()}_${photo.name}`;
    const r = ref(storage, path);
    await uploadBytes(r, photo);
    photoUrl = await getDownloadURL(r);
  }

  const createdAt = Date.now();
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...entry,
    photoUrl,
    createdAt,
    createdBy: uid,
  });

  return { ...entry, photoUrl, id: docRef.id, createdAt, createdBy: uid };
}

export async function deleteStock(id: string, photoUrl: string | null): Promise<void> {
  const { db, storage } = assertReady();
  if (photoUrl && storage) {
    try {
      await deleteObject(ref(storage, photoUrl));
    } catch {
      // Keep deletion of the stock record possible if the photo is already missing.
    }
  }
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function checkSerialExists(serialNumber: string, excludeId?: string): Promise<boolean> {
  const { db } = assertReady();
  const trimmed = serialNumber.trim();
  if (!trimmed) return false;
  const q = query(collection(db, COLLECTION), where('serialNumber', '==', trimmed));
  const snap = await getDocs(q);
  if (snap.empty) return false;
  if (excludeId) {
    let found = false;
    snap.forEach((d) => {
      if (d.id !== excludeId) found = true;
    });
    return found;
  }
  return true;
}
