// Firebase initialization for MemoryMesh.
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

function readFirebaseEnv(name: string): string {
  const value = import.meta.env[name as keyof ImportMetaEnv];
  if (!value || String(value).trim() === "") {
    throw new Error(`Missing Firebase env var: ${name}`);
  }
  return String(value);
}

const firebaseConfig = {
  apiKey: readFirebaseEnv("VITE_FIREBASE_API_KEY"),
  authDomain: readFirebaseEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: readFirebaseEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: readFirebaseEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readFirebaseEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: readFirebaseEnv("VITE_FIREBASE_APP_ID"),
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}