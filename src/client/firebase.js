/**
 * Firebase Client SDK Initialization for Next.js (Web Frontend)
 * Membaca konfigurasi dari environment variable NEXT_PUBLIC_FIREBASE_*
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Pola Singleton untuk mencegah inisialisasi ganda saat Next.js Fast Refresh (HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Hubungkan ke emulator lokal jika flag NEXT_PUBLIC_USE_FIREBASE_EMULATOR diaktifkan
if (
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' &&
  typeof window !== 'undefined'
) {
  const isEmulatorConnected = globalThis.__FIREBASE_EMULATORS_CONNECTED__;
  if (!isEmulatorConnected) {
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
      connectStorageEmulator(storage, '127.0.0.1', 9199);
      globalThis.__FIREBASE_EMULATORS_CONNECTED__ = true;
      console.log('⚡ [Firebase Client] Berhasil terhubung ke Firebase Local Emulators');
    } catch (err) {
      console.warn('⚠️ [Firebase Client] Gagal menghubungkan ke emulator:', err.message);
    }
  }
}

export { app, auth, db, storage };
