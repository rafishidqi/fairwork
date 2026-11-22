/**
 * Firebase Admin SDK Initialization for Node.js API
 * Membaca kredensial service account dari environment variable FIREBASE_SERVICE_ACCOUNT (JSON string)
 * Sesuai aturan keamanan: Jangan hardcode atau commit file JSON fisik ke git repository.
 */
import { initializeApp, getApps, getApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';

dotenv.config();

function initFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApp();
  }

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'fairwork-demo.appspot.com';
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    'fairwork-demo';

  // 1. Inisialisasi menggunakan JSON string di FIREBASE_SERVICE_ACCOUNT (Production / Staging)
  if (rawServiceAccount) {
    try {
      const serviceAccount =
        typeof rawServiceAccount === 'string'
          ? JSON.parse(rawServiceAccount)
          : rawServiceAccount;

      // Handle escaped newlines jika private key diformat dalam satu baris env
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      return initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || projectId,
        storageBucket,
      });
    } catch (error) {
      throw new Error(
        `[Firebase Admin] Gagal mem-parsing env FIREBASE_SERVICE_ACCOUNT: ${error.message}`
      );
    }
  }

  // 2. Mode Emulator Lokal (FIRESTORE_EMULATOR_HOST atau FIREBASE_AUTH_EMULATOR_HOST diset)
  const isEmulator =
    Boolean(process.env.FIRESTORE_EMULATOR_HOST) ||
    Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);

  if (isEmulator) {
    console.log('⚡ [Firebase Admin] Berjalan dalam mode Firebase Emulator');
    return initializeApp({
      projectId,
      storageBucket,
    });
  }

  // 3. Fallback ke Google Application Default Credentials (ADC)
  console.log('ℹ️ [Firebase Admin] Menggunakan Application Default Credentials (ADC)');
  return initializeApp({
    credential: applicationDefault(),
    projectId,
    storageBucket,
  });
}

const adminApp = initFirebaseAdmin();
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage };
