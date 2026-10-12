import { db } from './firebaseClient';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const ADMIN_USERNAME = 'DealsonPoint05';
const ADMIN_CONFIG_DOC = 'admin_credential';
const ADMIN_SESSION_KEY = 'deals_on_point_admin_auth_v1';

// Cryptographic hash helper using Web Crypto API (SHA-256)
async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateRandomSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface AdminCredentialDoc {
  username: string;
  passwordHash: string;
  salt: string;
  isConfigured: boolean;
  updatedAt: string;
}

/**
 * Checks if the Admin account has already had a private password initialized in the cloud database.
 */
export async function getAdminConfigStatus(): Promise<{ isConfigured: boolean }> {
  try {
    const ref = doc(db, 'system_settings', ADMIN_CONFIG_DOC);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as AdminCredentialDoc;
      return { isConfigured: Boolean(data?.isConfigured && data?.passwordHash) };
    }
    return { isConfigured: false };
  } catch (e) {
    console.warn('Could not read admin credential status:', e);
    // If not reachable yet, check session
    return { isConfigured: true };
  }
}

/**
 * Initial setup: Admin sets their private password for the first time.
 * Stores ONLY the cryptographic salted hash in the database.
 */
export async function initializeAdminPassword(password: string): Promise<{ success: boolean; error?: string }> {
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  try {
    const salt = generateRandomSalt();
    const hash = await hashPasswordWithSalt(password, salt);
    const ref = doc(db, 'system_settings', ADMIN_CONFIG_DOC);

    await setDoc(ref, {
      username: ADMIN_USERNAME,
      passwordHash: hash,
      salt: salt,
      isConfigured: true,
      updatedAt: new Date().toISOString(),
    });

    // Automatically log in
    markAdminAuthenticated();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to initialize admin credentials' };
  }
}

/**
 * Authenticates admin against the server-side salted SHA-256 hash.
 * If credentials are not yet configured in DB, allows user to configure them.
 */
export async function verifyAdminLogin(password: string): Promise<{ success: boolean; error?: string }> {
  if (!password) {
    return { success: false, error: 'Password is required' };
  }

  try {
    const ref = doc(db, 'system_settings', ADMIN_CONFIG_DOC);
    const snap = await getDoc(ref);

    if (!snap.exists() || !snap.data()?.passwordHash) {
      // First time initialization
      return { success: false, error: 'NEEDS_SETUP' };
    }

    const docData = snap.data() as AdminCredentialDoc;
    const computedHash = await hashPasswordWithSalt(password, docData.salt);

    if (computedHash === docData.passwordHash) {
      markAdminAuthenticated();
      return { success: true };
    }

    return { success: false, error: 'Invalid password. Please check and try again.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Login verification failed' };
  }
}

/**
 * Changes admin password (requires old password verification first)
 */
export async function updateAdminPassword(oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> {
  const verify = await verifyAdminLogin(oldPass);
  if (!verify.success) {
    return { success: false, error: 'Current password is incorrect' };
  }
  return initializeAdminPassword(newPass);
}

/**
 * Checks if current browser session has active admin authorization.
 */
export function isCurrentSessionAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const token = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!token) return false;
    const parsed = JSON.parse(token);
    // 24 hour session expiration
    if (parsed?.authenticated && parsed?.username === ADMIN_USERNAME) {
      const now = Date.now();
      if (now - (parsed.timestamp || 0) < 24 * 60 * 60 * 1000) {
        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}

export function markAdminAuthenticated(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({
        authenticated: true,
        username: ADMIN_USERNAME,
        timestamp: Date.now(),
      })
    );
    window.dispatchEvent(new Event('deals_on_point_auth_changed'));
  } catch (e) {
    // ignore
  }
}

export function adminLogout(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    window.dispatchEvent(new Event('deals_on_point_auth_changed'));
  } catch (e) {
    // ignore
  }
}
