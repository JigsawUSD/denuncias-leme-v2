import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from './firebaseConfig';

// Ensure Firebase is initialized only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Sheets and Google Drive scopes
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const clearSessionToken = () => {
  cachedAccessToken = null;
  localStorage.removeItem('sheets_google_access_token');
  localStorage.removeItem('sheets_google_access_token_time');
};

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Restore cached token if valid (less than 50 mins old)
  const storedToken = localStorage.getItem('sheets_google_access_token');
  const storedTimeStr = localStorage.getItem('sheets_google_access_token_time');
  const storedTime = storedTimeStr ? parseInt(storedTimeStr, 10) : 0;
  
  if (storedToken && Date.now() - storedTime < 50 * 60 * 1000) {
    cachedAccessToken = storedToken;
  } else {
    clearSessionToken();
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        clearSessionToken();
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      clearSessionToken();
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    localStorage.setItem('sheets_google_access_token', cachedAccessToken);
    localStorage.setItem('sheets_google_access_token_time', Date.now().toString());
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;

  const storedToken = localStorage.getItem('sheets_google_access_token');
  const storedTimeStr = localStorage.getItem('sheets_google_access_token_time');
  const storedTime = storedTimeStr ? parseInt(storedTimeStr, 10) : 0;
  
  if (storedToken && Date.now() - storedTime < 50 * 60 * 1000) {
    cachedAccessToken = storedToken;
    return cachedAccessToken;
  }
  return null;
};

export const logout = async () => {
  await auth.signOut();
  clearSessionToken();
};
