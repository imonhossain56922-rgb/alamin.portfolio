import React, { useState } from 'react';
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { ArrowLeft, Lock, LogOut, MailCheck, RefreshCw, ShieldAlert } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { ADMIN_EMAIL, ADMIN_EMAILS } from '../../data/defaultData';

interface AdminLoginProps {
  currentUser: User | null;
  isAuthorizedAdmin: boolean;
  checkingAuth: boolean;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  currentUser,
  isAuthorizedAdmin,
  checkingAuth,
  onBackToSite,
}) => {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMsg(null);
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setError('Invalid email or password. Please verify your credentials.');
      } else if (code === 'auth/operation-not-allowed') {
        setError(
          'Email/Password sign-in is disabled in Firebase Console. Enable Authentication → Sign-in method → Email/Password.'
        );
      } else {
        setError(err instanceof Error ? err.message : 'Unable to sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    if (!currentUser) return;
    setError(null);
    setInfoMsg(null);
    try {
      await sendEmailVerification(currentUser);
      setInfoMsg(
        `Verification email sent to ${currentUser.email}. Confirm the link in your inbox, then click Refresh Status.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send verification email.');
    }
  };

  const handleRefreshSession = async () => {
    if (!currentUser) return;
    await currentUser.reload();
    window.location.reload();
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center max-w-sm w-full">
          <p className="text-sm font-medium text-[#6B7280]">Verifying administrator session...</p>
        </div>
      </div>
    );
  }

  if (currentUser && !isAuthorizedAdmin) {
    const isAdminEmailPendingVerification =
      !currentUser.emailVerified &&
      ADMIN_EMAILS.includes((currentUser.email || '').toLowerCase());

    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-2xl p-8">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4">
            {isAdminEmailPendingVerification ? (
              <MailCheck className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
          </div>
          <h1 className="font-display text-xl font-bold text-[#202124] mb-2">
            {isAdminEmailPendingVerification
              ? 'Email Verification Required'
              : 'Administrator Access Required'}
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
            Signed in as <span className="font-medium text-[#202124]">{currentUser.email}</span>
            {currentUser.emailVerified === false ? ' (email not yet verified)' : ''}.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
              {error}
            </div>
          )}
          {infoMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              {infoMsg}
            </div>
          )}

          {isAdminEmailPendingVerification ? (
            <div className="space-y-4 mb-6">
              <p className="text-xs text-[#6B7280] bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg p-3 leading-relaxed">
                For security, please verify this email once to activate full administrator
                permissions.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleSendVerification}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg cursor-pointer"
                >
                  <MailCheck className="w-3.5 h-3.5" />
                  <span>Send Verification Email</span>
                </button>
                <button
                  type="button"
                  onClick={handleRefreshSession}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#202124] bg-[#F7F8FA] border border-[#E5E7EB] hover:bg-[#E5E7EB]/60 rounded-lg cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Status</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#6B7280] bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg p-3 mb-6">
              This account does not have administrator access to this portfolio.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#202124] bg-white border border-[#E5E7EB] hover:bg-[#F7F8FA] rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portfolio</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md mb-4">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#202124] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Public Portfolio</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center text-[#315E9B]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-[#202124]">Admin Login</h1>
            <p className="text-xs text-[#6B7280]">MD AL AMIN · Portfolio Management</p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-medium text-[#202124] mb-1.5">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ADMIN_EMAIL}
              autoComplete="email"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#315E9B]"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-[#202124] mb-1.5"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#315E9B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
