import { App, getApp, getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfig from '../firebase-applet-config.json';
import fs from 'fs';
import path from 'path';

let serviceAccount: any = null;

try {
  const saPath = path.resolve(process.cwd(), 'service-account.json');
  if (fs.existsSync(saPath)) {
    const raw = fs.readFileSync(saPath, 'utf8');
    serviceAccount = JSON.parse(raw);
  }
} catch (err) {
  console.warn('Could not load service-account.json:', err);
}

const projectId =
  serviceAccount?.project_id ||
  process.env.FIREBASE_PROJECT_ID ||
  firebaseConfig.projectId ||
  'gen-lang-client-0291935584';

const databaseId =
  (firebaseConfig as any).firestoreDatabaseId ||
  'ai-studio-amos-2f422ba5-7cb0-48ad-bac6-be491064bb5d';

let adminApp: App;

if (getApps().length > 0) {
  adminApp = getApp();
} else if (serviceAccount) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId,
  });
} else {
  adminApp = initializeApp({
    projectId,
  });
}

export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp, databaseId);
export default adminApp;
