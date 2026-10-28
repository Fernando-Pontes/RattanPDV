/**
 * Firebase configuration and initialization.
 *
 * Reads credentials from environment variables (VITE_ prefix exposes them
 * to the browser bundle via Vite).  Copy .env.example → .env.local and fill
 * in your Firebase project values.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Returns true when all required Firebase env vars are present.
 * When false the app falls back to localStorage mode automatically.
 */
export const isFirebaseConfigured = (): boolean =>
  Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'undefined'
  );

let app: FirebaseApp | null = null;
let db:  Firestore  | null = null;

if (isFirebaseConfigured()) {
  app = initializeApp(firebaseConfig);
  db  = getFirestore(app);
}

export { db };

