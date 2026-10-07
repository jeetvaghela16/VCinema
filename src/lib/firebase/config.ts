import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

/**
 * VCinema Firebase Configuration
 * Values are injected via Vite environment variables (VITE_FIREBASE_*).
 * See .env.example for required variables.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

/**
 * Checks whether valid Firebase environment variables are configured.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your-api-key-here' &&
  firebaseConfig.apiKey !== 'demo-unconfigured-api-key' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your-project-id' &&
  firebaseConfig.projectId !== 'vcinema-demo'
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
  } else {
    // Fallback initialization to prevent crashes when developing without credentials
    // Logs a warning in console guiding user to .env.local
    console.warn(
      '[VCinema Firebase] Environment variables not configured or using placeholders. ' +
      'Please copy .env.example to .env.local and populate with your Firebase credentials.'
    );
    app = initializeApp({
      apiKey: 'demo-unconfigured-api-key',
      authDomain: 'vcinema-demo.firebaseapp.com',
      projectId: 'vcinema-demo',
      storageBucket: 'vcinema-demo.appspot.com',
      messagingSenderId: '100000000000',
      appId: '1:100000000000:web:demo0000000000000000',
    });
  }
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

// Optional Emulator Integration
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    const authHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
    const firestoreHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost:8080';
    
    // Connect Auth Emulator (http://host)
    connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
    
    // Connect Firestore Emulator
    const [fsHost, fsPort] = firestoreHost.split(':');
    connectFirestoreEmulator(db, fsHost || 'localhost', Number(fsPort) || 8080);
    
    console.info(`[VCinema Firebase] Connected to local Emulators: Auth (${authHost}), Firestore (${firestoreHost})`);
  } catch (err) {
    console.warn('[VCinema Firebase] Could not connect to emulators (may already be connected):', err);
  }
}

export { app, auth, db };
