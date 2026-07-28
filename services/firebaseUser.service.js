const { getFirestore, getAuth } = require('../config/firebase');

async function syncAdminUser(username) {
  const db = getFirestore();
  const auth = getAuth();

  if (!db || !auth) {
    return {
      synced: false,
      uid: null
    };
  }

  const email = `${username}@elbuensabor.local`;
  let userRecord;

  try {
    userRecord = await auth.getUserByEmail(email);
  } catch (error) {
    userRecord = await auth.createUser({
      email,
      password: 'temporal-admin-password-2026',
      displayName: 'Admin El Buen Sabor'
    });
  }

  await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });

  const userDoc = {
    uid: userRecord.uid,
    username,
    email,
    role: 'admin',
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await db.collection('usuarios').doc(userRecord.uid).set(userDoc, { merge: true });

  return {
    synced: true,
    uid: userRecord.uid
  };
}

module.exports = {
  syncAdminUser
};
