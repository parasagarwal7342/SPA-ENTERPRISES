import React from 'react';
import { useAuth, UserRole } from '../AuthContext';
import Login from './Login';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
    children: React.ReactNode;
    role?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Login />;
    }

    // Role-specific protocol validation
    if (role && user?.role !== role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-16 rounded-[64px] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 text-center max-w-[600px] flex flex-col items-center"
                >
                    <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mb-10 shadow-xl shadow-red-100/50">
                        <ShieldAlert size={48} />
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-930 mb-6 tracking-tight">Protocol Violation</h2>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12">
                        Your current profile class (<span className="text-blue-600 font-bold uppercase tracking-widest text-[13px]">{user?.role}</span>) 
                        is not authorized to access the <span className="text-slate-900 font-bold underline underline-offset-8 decoration-red-200 uppercase tracking-widest text-[13px]">{role}</span> command hub.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-5 w-full">
                       <button 
                           onClick={() => window.location.hash = '#home'}
                           className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[4px] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
                       >
                           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Return Hub
                       </button>
                       <button 
                           onClick={() => window.location.hash = '#login'}
                           className="flex-1 py-5 bg-white border border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-[4px] hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                       >
                           <LogIn size={20} /> Re-Initialize
                       </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
