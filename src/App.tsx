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
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
