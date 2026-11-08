import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely (re-use if already initialized)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Standard Google Auth Provider for user account identity (Email & Profile)
const standardAuthProvider = new GoogleAuthProvider();
standardAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

// Dedicated Provider for Google Calendar incremental permissions
export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events'
];
const calendarAuthProvider = new GoogleAuthProvider();
calendarAuthProvider.setCustomParameters({
  prompt: 'select_account'
});
CALENDAR_SCOPES.forEach(scope => calendarAuthProvider.addScope(scope));

// Flags & In-memory token cache
let isSigningIn = false;
let cachedAccessToken: string | null = null;
const DEMO_USER_KEY = 'rrnews_demo_auth_user_v1';

// Custom event to notify auth changes when demo user logs in/out
const AUTH_STATE_CHANGE_EVENT = 'rrnews_auth_state_changed';

function getStoredDemoUser(): User | null {
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  const checkDemoOrFailure = () => {
    const demo = getStoredDemoUser();
    if (demo) {
      if (onAuthSuccess) onAuthSuccess(demo, 'demo_access_token');
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  };

  const unsubscribeFirebase = onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      try {
        localStorage.removeItem(DEMO_USER_KEY);
      } catch (e) {}
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken || '');
      }
    } else {
      checkDemoOrFailure();
    }
  });

  const handleCustomAuthChange = () => {
    const fbUser = auth.currentUser;
    if (fbUser) {
      if (onAuthSuccess) onAuthSuccess(fbUser, cachedAccessToken || '');
    } else {
      checkDemoOrFailure();
    }
  };

  window.addEventListener(AUTH_STATE_CHANGE_EVENT, handleCustomAuthChange);

  return () => {
    unsubscribeFirebase();
    window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleCustomAuthChange);
  };
};

/**
 * Demo / Instant Profile sign-in for seamless preview testing
 */
export const signInAsDemoUser = (customName?: string): User => {
  const demoUser: any = {
    uid: 'demo_analyst_rajveer_2026',
    displayName: customName || 'Rajveer S. (Verified Analyst)',
    email: 'r.srana.r111@gmail.com',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    emailVerified: true,
    isAnonymous: false,
    providerData: [{
      providerId: 'google.com',
      uid: 'demo_analyst_rajveer_2026',
      displayName: customName || 'Rajveer S. (Verified Analyst)',
      email: 'r.srana.r111@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      phoneNumber: null
    }]
  };

  try {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
  } catch (e) {}

  return demoUser as User;
};

/**
 * Standard Google Sign-In for user authentication & profile sync
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, standardAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }

    try {
      localStorage.removeItem(DEMO_USER_KEY);
    } catch (e) {}

    return { 
      user: result.user, 
      accessToken: cachedAccessToken || '' 
    };
  } catch (error: any) {
    if (
      error.code === 'auth/popup-closed-by-user' || 
      error.code === 'auth/cancelled-popup-request' ||
      error.code === 'auth/user-cancelled'
    ) {
      return null;
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. You can use Instant Profile sign-in below.');
    }
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This preview domain is pending Firebase authorization. Use Instant Profile sign-in below for full features.');
    }
    console.error('Google Sign-In Error:', error);
    throw new Error(error.message || 'Google sign-in failed. Please try Instant Profile below.');
  } finally {
    isSigningIn = false;
  }
};

/**
 * Incremental Authorization for Google Calendar
 */
export const requestCalendarAccess = async (): Promise<string | null> => {
  try {
    const result = await signInWithPopup(auth, calendarAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
      return credential.accessToken;
    }
    return null;
  } catch (error: any) {
    if (
      error.code === 'auth/popup-closed-by-user' || 
      error.code === 'auth/cancelled-popup-request'
    ) {
      return null;
    }
    console.warn('Calendar scope request error:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error('Sign-out error:', e);
  } finally {
    cachedAccessToken = null;
    try {
      localStorage.removeItem(DEMO_USER_KEY);
      window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
    } catch (e) {}
  }
};
