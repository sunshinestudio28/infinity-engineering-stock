import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Public web configuration for the NEW Firebase project.
// Secure the data with Firebase Authentication and Firestore/Storage rules.
const firebaseConfig = {
  apiKey: 'AIzaSyDkfyrRCYkQyjBH6bE8U83tTeYWUVK2Okg',
  authDomain: 'infinity-engineering-stock-new.firebaseapp.com',
  projectId: 'infinity-engineering-stock-new',
  storageBucket: 'infinity-engineering-stock-new.firebasestorage.app',
  messagingSenderId: '586642778865',
  appId: '1:586642778865:web:44f13f14eed6df07a3d750',
  measurementId: 'G-SD8HH2S1NK',
};

function hasValidConfig(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let initialized = false;

export function initFirebase(): void {
  if (initialized || !hasValidConfig()) return;

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Could not set Firebase auth persistence:', error);
  });
  db = getFirestore(app);
  storage = getStorage(app);
  initialized = true;
}

export function getFirebase() {
  initFirebase();
  return { app, auth, db, storage };
}

export function isFirebaseConfigured(): boolean {
  return hasValidConfig();
}

export { app, auth, db, storage };
