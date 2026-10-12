import React, { useState } from 'react';
import { 
  Lock, 
  Key, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck,
  ArrowLeft 
} from 'lucide-react';
import { 
  ADMIN_USERNAME, 
  verifyAdminLogin, 
  changeAdminPassword 
} from '../services/adminAuth';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [usernameInput, setUsernameInput] = useState(ADMIN_USERNAME);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password change required flow
  const [requireChangePassword, setRequireChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (usernameInput.trim().toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
      setErrorMsg(`Admin username must be exactly "${ADMIN_USERNAME}".`);
      return;
    }

    if (!passwordInput) {
      setErrorMsg('Please enter your admin password.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyAdminLogin(passwordInput);
      if (res.success) {
        if (res.mustChangePassword) {
          setRequireChangePassword(true);
          setSuccessMsg('Initial password verified. For your security, please create a new private password now.');
        } else {
          setSuccessMsg('Authenticated successfully. Redirecting to admin dashboard...');
          setTimeout(() => {
            onLoginSuccess();
          }, 600);
        }
      } else {
        setErrorMsg(res.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await changeAdminPassword(newPassword);
      if (res.success) {
        setSuccessMsg('Password updated successfully! Redirecting to admin dashboard...');
        setTimeout(() => {
          onLoginSuccess();
        }, 800);
      } else {
        setErrorMsg(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F5F7FA] font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#3B5BDB]/15 via-[#5C59D8]/10 to-[#7657D5]/15 blur-3xl pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Back to Deals On Point */}
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-[14px] text-[#A7AFBF] hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#3B5BDB]" />
          <span>Back to Deals On Point</span>
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#11131A] border border-[#303541] flex items-center justify-center text-[#3B5BDB] shadow-lg shadow-[#3B5BDB]/10">
            <Lock className="w-7 h-7" />
          </div>
        </div>

        <h1 className="text-center text-[26px] sm:text-[30px] font-display font-bold text-[#F5F7FA] tracking-tight">
          Admin Portal
        </h1>
        <p className="mt-1.5 text-center text-[14px] text-[#A7AFBF]">
          {requireChangePassword ? 'Secure Password Update' : 'Deals On Point Management Access'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#11131A] py-8 px-6 sm:px-10 border border-[#303541] rounded-2xl shadow-2xl">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[13px] flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!requireChangePassword ? (
            /* Standard Admin Login Form */
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-[#A7AFBF] mb-1.5">
                  Admin Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-[#181B24] text-[14px] text-[#F5F7FA] pl-10 pr-4 py-2.5 rounded-xl border border-[#303541] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] font-mono"
                    placeholder="Dealsonpoint05"
                    required
                  />
                  <User className="w-4 h-4 text-[#747D8C] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#A7AFBF] mb-1.5">
                  Password
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
                    className="absolute right-3.5 top-3.5 text-[#747D8C] hover:text-[#A7AFBF] cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#3B5BDB] hover:bg-[#7657D5] text-white font-semibold text-[15px] transition-all shadow-md shadow-[#3B5BDB]/25 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Log In to Admin</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* First-Time Password Change Form */
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="p-3.5 rounded-xl bg-[#3B5BDB]/10 border border-[#303541] text-[12.5px] text-[#A7AFBF] leading-relaxed">
                <span className="font-semibold text-white block mb-0.5">Required First-Time Setup</span>
                Please choose your permanent private password. This will update the cryptographic hash in the cloud database.
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#A7AFBF] mb-1.5">
                  New Private Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#181B24] text-[14px] text-[#F5F7FA] pl-10 pr-10 py-2.5 rounded-xl border border-[#303541] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB]"
                    placeholder="Enter new password (min 6 characters)"
                    required
                    autoFocus
                  />
                  <Key className="w-4 h-4 text-[#747D8C] absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#747D8C] hover:text-[#A7AFBF] cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#A7AFBF] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#181B24] text-[14px] text-[#F5F7FA] pl-10 pr-4 py-2.5 rounded-xl border border-[#303541] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB]"
                    placeholder="Confirm new password"
                    required
                  />
                  <Key className="w-4 h-4 text-[#747D8C] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#3B5BDB] hover:bg-[#7657D5] text-white font-semibold text-[15px] transition-all shadow-md shadow-[#3B5BDB]/25 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <span>Saving Password...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save New Password &amp; Continue</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#303541] text-center">
            <span className="text-[11.5px] text-[#747D8C]">
              Zero-Trust Architecture: Passwords hashed with salted SHA-256 before cloud storage.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
