import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  connectStorageEmulator,
  FirebaseStorage,
  getStorage,
} from 'firebase/storage';
import {
  connectFirestoreEmulator,
  Firestore,
  getFirestore,
} from 'firebase/firestore';
import { Analytics, getAnalytics } from 'firebase/analytics';
import { FirebaseOptions } from '@firebase/app-types';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

// Initialize the firebase app
export const app = (): FirebaseApp => {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
};

// Initialize the firebase auth
export const auth = (): Auth => {
  return getAuth(app());
};

// Initalize the firebase storage
export const storage = (): FirebaseStorage => {
  return getStorage(app());
};

// Initialize the firebase database (firestore)
export const db = (): Firestore => {
  return getFirestore(app());
};

// Initialize Google Analytics
export const analytics = (): Analytics => {
  return getAnalytics(app());
};

const EMULATORS_STARTED = 'EMULATORS_STARTED';
function startEmulators() {
  if (!(global as any)[EMULATORS_STARTED]) {
    (global as any)[EMULATORS_STARTED] = true;
    connectFirestoreEmulator(db(), 'localhost', 8080);
    connectAuthEmulator(auth(), 'http://localhost:9099');
    connectStorageEmulator(storage(), 'localhost', 9199);
  }
}

process.env.NODE_ENV === 'test' && startEmulators();
