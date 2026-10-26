import React, { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Link, navigate, useLocation } from '../lib/router';
import { Spinner } from './ui';
import type { UserRole } from '../types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const { path } = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate(`/login?next=${encodeURIComponent(path)}`, { replace: true });
  }, [loading, user, path]);

  if (loading || !user) return <div className="pt-40 flex justify-center"><Spinner /></div>;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="card p-8 text-center max-w-md">
          <ShieldAlert size={40} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">You don't have access to this page</h1>
          <p className="text-slate-500 text-sm mb-6">You're signed in as {user.email}. Ask the owner if you need access.</p>
          <Link to="/" className="btn-dark">Go to homepage</Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export default ProtectedRoute;
