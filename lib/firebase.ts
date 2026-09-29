import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Global error handler to suppress the known Firebase Auth 11.x assertion error
// "INTERNAL ASSERTION FAILED: Pending promise was never set" which can fire
// in iframe or cross-origin popup environments when message events are processed.
if (typeof window !== 'undefined') {
  const isAssertionError = (err: any) => {
    const msg = err?.message || String(err || '');
    return msg.includes('Pending promise was never set');
  };

  window.addEventListener('error', (event) => {
    if (isAssertionError(event.error) || isAssertionError(event.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (isAssertionError(event.reason)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const databaseId = (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-amos-2f422ba5-7cb0-48ad-bac6-be491064bb5d';
const db = getFirestore(app, databaseId);

export { app, auth, db };

export function onAuthUserChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      cachedGoogleAccessToken = null;
    }
    callback(user);
  });
}

export async function logOutGoogle(): Promise<void> {
  try {
    cachedGoogleAccessToken = null;
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

let cachedGoogleAccessToken: string | null = null;

export function getCachedGoogleAccessToken(): string | null {
  return cachedGoogleAccessToken;
}

export function setCachedGoogleAccessToken(token: string | null): void {
  cachedGoogleAccessToken = token;
}

let activeSignInPromise: Promise<{
  user: User;
  credential: any;
  accessToken: string | null;
}> | null = null;

export async function signInWithGoogle(customScopes?: string[]): Promise<{
  user: User;
  credential: any;
  accessToken: string | null;
}> {
  if (activeSignInPromise) {
    return activeSignInPromise;
  }

  activeSignInPromise = (async () => {
    try {
      const provider = new GoogleAuthProvider();
      const defaultScopes = [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
      ];
      const scopes = customScopes && customScopes.length > 0 ? customScopes : defaultScopes;
      scopes.forEach((scope) => provider.addScope(scope));
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedGoogleAccessToken = credential.accessToken;
      }
      return { user: result.user, credential, accessToken: credential?.accessToken || null };
    } catch (error: any) {
      // Avoid rethrowing if already handled or popup cancelled
      if (error?.message?.includes('Pending promise was never set')) {
        console.warn('Recovered from Firebase Auth popup assertion.');
      }
      throw error;
    } finally {
      setTimeout(() => {
        activeSignInPromise = null;
      }, 400);
    }
  })();

  return activeSignInPromise;
}
