
import React, { useState } from 'react';
import { useStore } from '../services/mockStore';
import {
  Shield,
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  Loader2,
  AlertCircle,
  Building2,
  Fingerprint,
  User,
  Sparkles,
} from 'lucide-react';
import { DEMO_PORTALS, PortalKey } from '../constants/loginCredentials';

const PORTAL_STYLES: Record<
  PortalKey,
  {
    icon: React.ElementType;
    header: string;
    glow: string;
    cardActive: string;
    cardIdle: string;
    accent: string;
    button: string;
    ring: string;
    badge: string;
  }
> = {
  traveler: {
    icon: User,
    header: 'from-blue-600 via-blue-700 to-indigo-800',
    glow: 'shadow-blue-500/40',
    cardActive: 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/10',
    cardIdle: 'border-slate-200/80 bg-white/80 hover:border-blue-300 hover:shadow-md',
    accent: 'text-blue-600',
    button: 'from-blue-600 to-indigo-600 shadow-blue-500/35 hover:from-blue-700 hover:to-indigo-700',
    ring: 'focus:ring-blue-500/15 focus:border-blue-500',
    badge: 'bg-blue-500/20 text-blue-100',
  },
  border_officer: {
    icon: Fingerprint,
    header: 'from-emerald-600 via-teal-600 to-cyan-700',
    glow: 'shadow-emerald-500/40',
    cardActive: 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/10',
    cardIdle: 'border-slate-200/80 bg-white/80 hover:border-emerald-300 hover:shadow-md',
    accent: 'text-emerald-600',
    button: 'from-emerald-600 to-teal-600 shadow-emerald-500/35 hover:from-emerald-700 hover:to-teal-700',
    ring: 'focus:ring-emerald-500/15 focus:border-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-100',
  },
  city_admin: {
    icon: Building2,
    header: 'from-indigo-600 via-violet-600 to-purple-700',
    glow: 'shadow-indigo-500/40',
    cardActive: 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-violet-50 ring-2 ring-indigo-400/50 shadow-lg shadow-indigo-500/10',
    cardIdle: 'border-slate-200/80 bg-white/80 hover:border-indigo-300 hover:shadow-md',
    accent: 'text-indigo-600',
    button: 'from-indigo-600 to-violet-600 shadow-indigo-500/35 hover:from-indigo-700 hover:to-violet-700',
    ring: 'focus:ring-indigo-500/15 focus:border-indigo-500',
    badge: 'bg-indigo-500/20 text-indigo-100',
  },
  super_admin: {
    icon: Shield,
    header: 'from-slate-800 via-slate-900 to-black',
    glow: 'shadow-slate-900/50',
    cardActive: 'border-slate-600 bg-gradient-to-br from-slate-100 to-slate-200 ring-2 ring-slate-500/40 shadow-lg shadow-slate-900/15',
    cardIdle: 'border-slate-200/80 bg-white/80 hover:border-slate-400 hover:shadow-md',
    accent: 'text-slate-800',
    button: 'from-slate-800 to-slate-950 shadow-slate-900/40 hover:from-slate-900 hover:to-black',
    ring: 'focus:ring-slate-500/15 focus:border-slate-600',
    badge: 'bg-white/10 text-slate-200',
  },
};

export const PortalLogin: React.FC<{ onSwitchToVerify: () => void }> = ({ onSwitchToVerify }) => {
  const { loginUser, setCurrentRole, logoutUser } = useStore();
  const [portal, setPortal] = useState<PortalKey>('traveler');
  const [email, setEmail] = useState(DEMO_PORTALS.traveler.email);
  const [password, setPassword] = useState(DEMO_PORTALS.traveler.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activePortal = DEMO_PORTALS[portal];
  const styles = PORTAL_STYLES[portal];
  const PortalIcon = styles.icon;

  const selectPortal = (key: PortalKey) => {
    setPortal(key);
    setEmail(DEMO_PORTALS[key].email);
    setPassword(DEMO_PORTALS[key].password);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await loginUser(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Login failed');
      return;
    }

    if (result.user?.role !== activePortal.role) {
      logoutUser();
      setError(`Invalid credentials for ${activePortal.label} portal.`);
      return;
    }

    setCurrentRole(activePortal.role);
  };

  return (
    <div className="min-h-screen login-vivid-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[480px] relative z-10 pbms-animate-in">
        {/* Logo strip */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur px-5 py-2.5 rounded-2xl shadow-lg border border-white/80">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Puntland.svg"
              alt="Puntland"
              className="h-9 w-auto"
            />
            <div className="text-left">
              <p className="font-bold text-slate-900 text-sm leading-tight">Puntland BMS</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Border Control System</p>
            </div>
          </div>
        </div>

        <div className="pbms-glass rounded-3xl shadow-2xl shadow-slate-300/30 border border-white/60 overflow-hidden">
          {/* Dynamic header */}
          <div className={`bg-gradient-to-br ${styles.header} px-8 py-10 text-white relative overflow-hidden transition-all duration-500`}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.08]" />
            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl ${styles.badge}`} />
            <div className="relative z-10 text-center">
              <div className={`inline-flex p-3 rounded-2xl bg-white/15 backdrop-blur border border-white/20 mb-4 ${styles.glow}`}>
                <PortalIcon size={28} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">{activePortal.label} Portal</h1>
              <p className="text-white/75 text-sm mt-1.5 font-medium">{activePortal.subtitle}</p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className={styles.accent} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Access Level</p>
            </div>

            {/* Portal cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-7">
              {(Object.keys(DEMO_PORTALS) as PortalKey[]).map(key => {
                const p = DEMO_PORTALS[key];
                const Icon = PORTAL_STYLES[key].icon;
                const isActive = portal === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectPortal(key)}
                    className={`flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border transition-all duration-300 ${
                      isActive ? PORTAL_STYLES[key].cardActive : PORTAL_STYLES[key].cardIdle
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        isActive ? 'bg-white shadow-sm' : 'bg-slate-100'
                      } ${PORTAL_STYLES[key].accent}`}
                    >
                      <Icon size={22} strokeWidth={2} />
                    </div>
                    <span
                      className={`text-[10px] font-bold leading-tight text-center ${
                        isActive ? 'text-slate-800' : 'text-slate-500'
                      }`}
                    >
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm flex items-center gap-3 mb-5 border border-red-100">
                <AlertCircle size={18} className="shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="email"
                    className={`pbms-input pl-10 focus:ring-4 ${styles.ring}`}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="password"
                    className={`pbms-input pl-10 focus:ring-4 ${styles.ring}`}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className={`w-full mt-2 py-3.5 rounded-xl text-white font-bold text-sm bg-gradient-to-r shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 ${styles.button}`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : portal === 'super_admin' ? (
                  <>
                    <Fingerprint size={18} /> Sign In to Command Center
                  </>
                ) : (
                  <>
                    Sign In to Portal <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <button
                onClick={onSwitchToVerify}
                className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors inline-flex items-center gap-1.5"
              >
                <KeyRound size={14} /> Verify Account
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-5">
          Secure government portal · Demo credentials pre-filled per role
        </p>
      </div>
    </div>
  );
};

export const LoginPage = PortalLogin;

export const VerificationPage: React.FC<{ onVerified: () => void }> = ({ onVerified }) => {
  const { verifyUser, resendVerification } = useStore();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await verifyUser(email, code);
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => onVerified(), 1500);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="min-h-screen login-vivid-bg flex items-center justify-center p-4">
      <div className="pbms-glass rounded-3xl shadow-2xl w-full max-w-md border border-white/60 overflow-hidden pbms-animate-in">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-8 text-white text-center">
          <div className="inline-flex p-3 rounded-2xl bg-white/15 border border-white/20 mb-3">
            <KeyRound size={28} />
          </div>
          <h2 className="text-xl font-bold">Verify Account</h2>
          <p className="text-blue-100 text-sm mt-1">Enter the 6-digit code from your email</p>
        </div>
        <div className="p-8">
          {message && (
            <div
              className={`p-4 rounded-xl text-sm flex items-center gap-3 mb-6 border ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              <AlertCircle size={18} /> {message.text}
            </div>
          )}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                required
                type="email"
                className="pbms-input focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500"
                placeholder="user@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Verification Code
              </label>
              <input
                required
                className="pbms-input text-center font-mono text-xl tracking-[0.3em] focus:ring-4 focus:ring-blue-500/15"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value)}
              />
            </div>
            <button type="submit" className="pbms-btn-primary w-full mt-2">
              Verify Code
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => email && resendVerification(email)}
              className="text-sm text-slate-400 hover:text-slate-700 font-medium"
            >
              Resend Verification Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
