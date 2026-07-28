const env = require('./config/env');

module.exports = {
  apiKey: env.publicFirebase.apiKey,
  authDomain: env.publicFirebase.authDomain,
  projectId: env.publicFirebase.projectId,
  storageBucket: env.publicFirebase.storageBucket,
  messagingSenderId: env.publicFirebase.messagingSenderId,
  appId: env.publicFirebase.appId
};
