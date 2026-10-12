import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Key, 
  User, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  LogIn, 
  LogOut,
  Settings
} from 'lucide-react';
import { 
  ADMIN_USERNAME, 
  verifyAdminLogin, 
  initializeAdminPassword, 
  getAdminConfigStatus,
  adminLogout 
} from '../services/adminAuth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLoginSuccess: () => void;
  onLogoutSuccess: () => void;
  onOpenProductManager: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLoginSuccess,
  onLogoutSuccess,
  onOpenProductManager,
}) => {
  const [usernameInput, setUsernameInput] = useState(ADMIN_USERNAME);
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPasswordInput('');
      setConfirmPasswordInput('');
      setErrorMsg('');
      setSuccessMsg('');
      return;
    }

    // Check if the cloud database already has a password initialized
    getAdminConfigStatus().then((status) => {
      setIsFirstTimeSetup(!status.isConfigured);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (usernameInput.trim() !== ADMIN_USERNAME) {
      setErrorMsg(`Admin username must be exactly "${ADMIN_USERNAME}".`);
      return;
    }

    if (!passwordInput) {
      setErrorMsg('Please enter your admin password.');
      return;
    }

    setLoading(true);
    try {
      if (isFirstTimeSetup) {
        if (passwordInput.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        if (passwordInput !== confirmPasswordInput) {
          setErrorMsg('Passwords do not match. Please re-enter.');
          setLoading(false);
          return;
        }

        const res = await initializeAdminPassword(passwordInput);
        if (res.success) {
          setSuccessMsg('Admin password securely saved! You are now logged in.');
          setTimeout(() => {
            onLoginSuccess();
            onClose();
          }, 1200);
        } else {
          setErrorMsg(res.error || 'Failed to save admin password.');
        }
      } else {
        const res = await verifyAdminLogin(passwordInput);
        if (res.success) {
          setSuccessMsg('Authenticated successfully. Welcome, Admin!');
          setTimeout(() => {
            onLoginSuccess();
            onClose();
          }, 1000);
        } else if (res.error === 'NEEDS_SETUP') {
          setIsFirstTimeSetup(true);
          setErrorMsg('No password configured yet. Please set your private admin password below.');
        } else {
          setErrorMsg(res.error || 'Invalid credentials.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    onLogoutSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div 
        className="relative w-full max-w-md bg-[#11131A] border border-[#303541] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#303541] bg-[#181B24]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B5BDB]/20 border border-[#3B5BDB]/40 flex items-center justify-center text-[#3B5BDB]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[17px] font-display font-semibold text-[#F5F7FA]">
                {isAdmin ? 'Admin Dashboard' : isFirstTimeSetup ? 'Initialize Admin Access' : 'Private Admin Login'}
              </h2>
              <p className="text-[12px] text-[#A7AFBF]">Deals On Point Security Gate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A7AFBF] hover:text-white rounded-lg hover:bg-[#303541]/50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isAdmin ? (
            /* Logged-In State */
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#181B24] border border-[#303541] flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold text-[#F5F7FA]">Currently Logged In as Admin</h4>
                  <p className="text-[12.5px] text-[#A7AFBF] mt-0.5">
                    Username: <span className="text-[#3B5BDB] font-mono font-medium">{ADMIN_USERNAME}</span>
                  </p>
                  <p className="text-[12px] text-[#747D8C] mt-1">
                    You have full administrative privileges to add, edit, and delete products live.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenProductManager();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#3B5BDB] hover:bg-[#7657D5] text-white font-semibold text-[14.5px] transition-all shadow-md shadow-[#3B5BDB]/25 cursor-pointer active:scale-[0.98]"
                >
                  <Settings className="w-4 h-4" />
                  <span>Open Product Management Form</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium text-[14px] transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Admin</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login / Setup Form */
            <form onSubmit={handleLogin} className="space-y-4">
              {isFirstTimeSetup && (
                <div className="p-3.5 rounded-xl bg-[#3B5BDB]/10 border border-[#3B5BDB]/30 text-[13px] text-[#A7AFBF] leading-relaxed">
                  <span className="font-semibold text-white block mb-0.5">One-Time Admin Setup</span>
                  Set your private password now. It will be securely hashed with salted SHA-256 and stored in your cloud database.
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[13px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Username Field */}
              <div>
                <label className="block text-[12.5px] font-medium text-[#A7AFBF] mb-1.5">
                  Admin Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-[#181B24] text-[14px] text-[#F5F7FA] pl-10 pr-4 py-2.5 rounded-xl border border-[#303541] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] font-mono"
                    placeholder="DealsonPoint05"
                    required
                  />
                  <User className="w-4 h-4 text-[#747D8C] absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-[#747D8C] mt-1">Username is locked to DealsonPoint05</p>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[12.5px] font-medium text-[#A7AFBF] mb-1.5">
                  {isFirstTimeSetup ? 'Choose Private Admin Password' : 'Admin Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-[#181B24] text-[14px] text-[#F5F7FA] pl-10 pr-10 py-2.5 rounded-xl border border-[#303541] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB]"
                    placeholder="••••••••••••"
                    required
                    autoFocus
                  />
                  <Key className="w-4 h-4 text-[#747D8C] absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#747D8C] hover:text-[#A7AFBF] cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (only on first-time setup) */}
              {isFirstTimeSetup && (
                <div>
                  <label className="block text-[12.5px] font-medium text-[#A7AFBF] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full bg-[#181B24] text-[14px] text-[#F5F7FA] pl-10 pr-4 py-2.5 rounded-xl border border-[#303541] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB]"
                      placeholder="••••••••••••"
                      required
                    />
                    <Key className="w-4 h-4 text-[#747D8C] absolute left-3.5 top-3.5" />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#3B5BDB] hover:bg-[#7657D5] text-white font-semibold text-[14.5px] transition-all shadow-md shadow-[#3B5BDB]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{isFirstTimeSetup ? 'Save Password & Access Admin' : 'Log In to Admin'}</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-[#747D8C]">
                  Zero-trust security: Passwords are encrypted with salted SHA-256 before verification.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
