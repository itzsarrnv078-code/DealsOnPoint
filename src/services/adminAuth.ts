import { db } from './firebaseClient';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const ADMIN_USERNAME = 'Dealsonpoint05';
const ADMIN_CONFIG_DOC = 'admin_credential';
const ADMIN_SESSION_KEY = 'deals_on_point_admin_auth_v1';

// Initial pre-configured salted hash for Arjunroop1$
// Salt: 'd9a4b2c1e8f7a6b5'
// Resulting SHA-256: 'da8bd54b3a34655f28954058511faf64bd0605452f17295ac7ef7a4958f4f6e0'
const DEFAULT_INITIAL_SALT = 'd9a4b2c1e8f7a6b5';
const DEFAULT_INITIAL_HASH = 'da8bd54b3a34655f28954058511faf64bd0605452f17295ac7ef7a4958f4f6e0';

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
  mustChangePassword?: boolean;
  updatedAt: string;
}

/**
 * Ensures the admin credentials exist in Firestore.
 * If not present, provisions the initial salted hash for `Arjunroop1$` with `mustChangePassword: true`.
 */
export async function ensureAdminCredentialSeeded(): Promise<AdminCredentialDoc> {
  try {
    const ref = doc(db, 'system_settings', ADMIN_CONFIG_DOC);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.passwordHash) {
      return snap.data() as AdminCredentialDoc;
    }

    const initialDoc: AdminCredentialDoc = {
      username: ADMIN_USERNAME,
      passwordHash: DEFAULT_INITIAL_HASH,
      salt: DEFAULT_INITIAL_SALT,
      isConfigured: true,
      mustChangePassword: true,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(ref, initialDoc, { merge: true });
    return initialDoc;
  } catch (err) {
    console.warn('Could not seed admin credentials to Firestore:', err);
    return {
      username: ADMIN_USERNAME,
      passwordHash: DEFAULT_INITIAL_HASH,
      salt: DEFAULT_INITIAL_SALT,
      isConfigured: true,
      mustChangePassword: true,
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Checks if the Admin account has been configured.
 */
export async function getAdminConfigStatus(): Promise<{ isConfigured: boolean; mustChangePassword: boolean }> {
  try {
    const cred = await ensureAdminCredentialSeeded();
    return { 
      isConfigured: true, 
      mustChangePassword: Boolean(cred.mustChangePassword) 
    };
  } catch (e) {
    return { isConfigured: true, mustChangePassword: false };
  }
}

/**
 * Authenticates admin against the server-side salted SHA-256 hash.
 */
export async function verifyAdminLogin(password: string): Promise<{ success: boolean; mustChangePassword?: boolean; error?: string }> {
  if (!password) {
    return { success: false, error: 'Password is required' };
  }

  try {
    const credDoc = await ensureAdminCredentialSeeded();
    const computedHash = await hashPasswordWithSalt(password, credDoc.salt);

    // Case-insensitive username check helper
    if (computedHash === credDoc.passwordHash) {
      markAdminAuthenticated();
      return { 
        success: true, 
        mustChangePassword: Boolean(credDoc.mustChangePassword) 
      };
    }

    return { success: false, error: 'Invalid password. Please check and try again.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Login verification failed' };
  }
}

/**
 * Sets new password and clears the `mustChangePassword` flag.
 */
export async function changeAdminPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  try {
    const salt = generateRandomSalt();
    const hash = await hashPasswordWithSalt(newPassword, salt);
    const ref = doc(db, 'system_settings', ADMIN_CONFIG_DOC);

    const updatedDoc: AdminCredentialDoc = {
      username: ADMIN_USERNAME,
      passwordHash: hash,
      salt: salt,
      isConfigured: true,
      mustChangePassword: false,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(ref, updatedDoc, { merge: true });
    markAdminAuthenticated();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update admin password' };
  }
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
    if (parsed?.authenticated && parsed?.username?.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
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
