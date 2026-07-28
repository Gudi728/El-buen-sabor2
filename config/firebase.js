const admin = require('firebase-admin');
const env = require('./env');

let firebaseReady = false;

function initializeFirebase() {
  if (admin.apps.length) {
    firebaseReady = true;
    return admin;
  }

  const { projectId, clientEmail, privateKey, storageBucket } = env.firebase;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey
    }),
    storageBucket
  });

  firebaseReady = true;
  return admin;
}

function getFirestore() {
  if (!firebaseReady) {
    const app = initializeFirebase();
    if (!app) return null;
  }
  return admin.firestore();
}

function getStorage() {
  if (!firebaseReady) {
    const app = initializeFirebase();
    if (!app) return null;
  }
  return admin.storage().bucket();
}

function getAuth() {
  if (!firebaseReady) {
    const app = initializeFirebase();
    if (!app) return null;
  }
  return admin.auth();
}

module.exports = {
  initializeFirebase,
  getFirestore,
  getStorage,
  getAuth
};
