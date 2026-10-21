import { AuthProvider, useAuth } from '@/lib/authContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import { Spinner } from '@/components/ui';

function Gate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="w-10 h-10 border-3 border-navy-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
}

export default function App() {
    if (!authSession?.idToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center max-w-sm w-full">
          <h1 className="text-xl font-bold mb-2">Infinity Engineering</h1>
          <p className="text-sm text-slate-600 mb-4">
            Please sign in to access the stock dashboard.
          </p>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold"
          >
            Sign In
          </button>
        </div>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={(session) => {
            setAuthSession(session);
            showToast(`Authenticated as ${session.email}`);
            handleRefreshData();
          }}
        />
      </div>
    );
  }
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
