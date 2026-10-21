
import { AuthProvider, useAuth } from '@/lib/authContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';

function Gate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-gray-600">Loading...</div>
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
