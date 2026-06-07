// Safe Firebase Configuration Loader for leme-denuncias-v2

const metaEnv = (import.meta as any).env || {};

// Verify if there are environment variables explicitly for the new project 'leme-denuncias-v2'.
// If they are not for 'leme-denuncias-v2', we ignore them to prevent old/incorrect environment variables from overwriting this configuration.
const useEnv = metaEnv.VITE_FIREBASE_PROJECT_ID === 'leme-denuncias-v2';

export const firebaseConfig = {
  apiKey: useEnv && metaEnv.VITE_FIREBASE_API_KEY ? metaEnv.VITE_FIREBASE_API_KEY : "AIzaSyCndjbnREJlnf-BpKBLoczwxLgj92Z4yfM",
  authDomain: useEnv && metaEnv.VITE_FIREBASE_AUTH_DOMAIN ? metaEnv.VITE_FIREBASE_AUTH_DOMAIN : "leme-denuncias-v2.firebaseapp.com",
  projectId: useEnv && metaEnv.VITE_FIREBASE_PROJECT_ID ? metaEnv.VITE_FIREBASE_PROJECT_ID : "leme-denuncias-v2",
  storageBucket: useEnv && metaEnv.VITE_FIREBASE_STORAGE_BUCKET ? metaEnv.VITE_FIREBASE_STORAGE_BUCKET : "leme-denuncias-v2.firebasestorage.app",
  messagingSenderId: useEnv && metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID ? metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID : "546154529177",
  appId: useEnv && metaEnv.VITE_FIREBASE_APP_ID ? metaEnv.VITE_FIREBASE_APP_ID : "1:546154529177:web:1cd9c80a05e7ec5e469308",
  measurementId: useEnv && metaEnv.VITE_FIREBASE_MEASUREMENT_ID ? metaEnv.VITE_FIREBASE_MEASUREMENT_ID : "G-HQ936E2868"
};

console.log('[FirebaseConfig] Loaded Firebase configuration for:', firebaseConfig.projectId);

export default firebaseConfig;
