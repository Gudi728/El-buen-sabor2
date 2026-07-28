const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || ''
  },
  publicFirebase: {
    apiKey: process.env.PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.PUBLIC_FIREBASE_APP_ID || ''
  }
};

module.exports = env;
