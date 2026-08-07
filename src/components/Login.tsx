import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/authContext';
import { isFirebaseConfigured } from '@/lib/firebase';
import { Boxes, Lock, Mail, AlertTriangle, Loader2 } from 'lucide-react';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const configured = isFirebaseConfigured();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      setError(msg.replace('Firebase:', '').trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-navy-100 overflow-hidden">
        <div className="bg-navy-900 px-8 py-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 mb-3">
            <Boxes className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Infinity Engineering Stock</h1>
          <p className="text-navy-200 text-sm mt-1">Private inventory management</p>
        </div>

        <div className="px-8 py-7">
          {!configured && (
            <div className="mb-5 flex gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                Firebase is not configured yet. Copy <code className="font-mono bg-amber-100 px-1 rounded">.env.example</code> to <code className="font-mono bg-amber-100 px-1 rounded">.env</code> and add your Firebase credentials.
              </span>
            </div>
          )}

          <div className="flex bg-navy-50 rounded-lg p-1 mb-5">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                mode === 'signin' ? 'bg-navy-900 text-white shadow' : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                mode === 'signup' ? 'bg-navy-900 text-white shadow' : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@infinityeng.com"
                  className="field-input w-full pl-9 pr-3 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 placeholder:text-navy-300 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="field-input w-full pl-9 pr-3 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 placeholder:text-navy-300 text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="flex gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:bg-navy-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-navy-400 mt-5">
            Access is private. Only invited users can manage stock.
          </p>
        </div>
      </div>
    </div>
  );
}
