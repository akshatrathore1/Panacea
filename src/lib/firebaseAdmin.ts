import admin from 'firebase-admin';

declare global {
  var __firebaseAdminApp: admin.app.App | undefined;
}

function initFirebase() {
  if (global.__firebaseAdminApp) return global.__firebaseAdminApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY');
  }

  // fix escaped newlines
  privateKey = privateKey.replace(/\\n/g, '\n');

  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  }, `admin-${projectId}`);

  global.__firebaseAdminApp = app;
  return app;
}

export function getFirestore() {
  const app = initFirebase();
  return app.firestore();
}