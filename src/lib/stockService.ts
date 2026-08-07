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
      'Firebase is not configured. Add your Firebase credentials to the .env file (see .env.example) and restart the dev server.'
    );
  }
  return { db, storage };
}

const COLLECTION = 'stock_entries';
const PHOTO_PATH = 'product-photos';

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
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<StockEntry, 'id'>) }));
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

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...entry,
    photoUrl,
    createdAt: Date.now(),
    createdBy: uid,
  });

  return { ...entry, photoUrl, id: docRef.id, createdAt: Date.now(), createdBy: uid };
}

export async function deleteStock(id: string, photoUrl: string | null): Promise<void> {
  const { db, storage } = assertReady();
  if (photoUrl && storage) {
    try {
      await deleteObject(ref(storage, photoUrl));
    } catch {
      // ignore deletion errors
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
