import React, { useState } from 'react';
import { ShieldCheck, User, Store, Mail, Lock, ArrowRight, CheckCircle2, Globe, Shield, Briefcase, Zap, AlertTriangle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'seller' | 'owner'>('customer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, role);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 pt-32 relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-24 items-center relative z-10">
        
        {/* Value Prop Context */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex flex-col"
        >
           <div className="inline-flex items-center gap-3 px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[5px] mb-12 border border-white/10 shadow-xl shadow-slate-200">
              <Shield size={16} /> Private Network Registry
           </div>
           <h1 className="text-6xl font-bold text-slate-930 leading-[1.1] mb-10 tracking-tight">
             SPA Enterprise <br/> <span className="text-blue-600 italic">Sovereign Portal.</span>
           </h1>
           <p className="text-lg text-slate-500 font-medium leading-relaxed mb-16 max-w-lg">
             Authorized access only for SPA Team members, executives, and valued distributors. 
             Connecting <span className="text-slate-900 font-bold">National Geographic</span> and <span className="text-slate-900 font-bold">Shraddha</span> directly to the horizon.
           </p>

           <div className="grid grid-cols-2 gap-8">
              {[
                { label: 'Network Consensus', val: '99.9%', icon: Globe, color: 'text-blue-600' },
                { label: 'Active Distribution', val: 'Verified', icon: Zap, color: 'text-amber-600' },
              ].map((stat, i) => (
                <div key={i} className="p-10 bg-white rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:border-blue-400/20 transition-all flex flex-col justify-between h-[220px]">
                   <div className={`w-12 h-12 bg-slate-50 ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <stat.icon size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                      <p className="text-2xl font-black text-slate-930 leading-none">{stat.val}</p>
                   </div>
                </div>
              ))}
           </div>
        </motion.div>

        {/* Professional Triple Portal Login */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 lg:p-16 rounded-[64px] border border-slate-200 shadow-2xl shadow-slate-300/40 relative overflow-hidden"
        >
          {/* Identity Context */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h2 className="text-4xl font-bold text-slate-930 tracking-tight mb-2">Portal Sign-in</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-[3px]">Identity Consensus Matrix</p>
               </div>
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm leading-none"><Lock size={20} /></div>
            </div>

            {/* Triple Role Selector Hub */}
            <div className="grid grid-cols-3 p-2 bg-slate-50/80 rounded-3xl mb-12 border border-slate-100 backdrop-blur-sm">
               {[
                 { id: 'customer', label: 'Client', icon: User },
                 { id: 'seller', label: 'Staff', icon: Store },
                 { id: 'owner', label: 'Exec', icon: Briefcase },
               ].map((item) => (
                 <button 
                   type="button"
                   key={item.id}
                   onClick={() => setRole(item.id as any)}
                   className={`flex-1 py-4 px-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${role === item.id ? 'bg-white text-blue-600 shadow-xl shadow-blue-100 border border-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   <item.icon size={20} />
                   <span>{item.label}</span>
                 </button>
               ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Official Consensus Email"
                    required
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-3xl py-6 pl-16 pr-8 text-[14px] font-bold outline-none focus:bg-white focus:border-blue-600 focus:ring-8 focus:ring-blue-50 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Security Protocol Code"
                    required
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-3xl py-6 pl-16 pr-8 text-[14px] font-bold outline-none focus:bg-white focus:border-blue-600 focus:ring-8 focus:ring-blue-50 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 bg-white text-blue-600 focus:ring-blue-600 shadow-sm" />
                    <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-600 transition-colors tracking-widest">Persist Session</span>
                 </label>
                 <a href="#" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-all underline underline-offset-8 decoration-blue-200 hover:decoration-blue-600">Recovery</a>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[4px] hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-4 group mt-4 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/5 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                Initialize Portal <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-500" />
              </button>
            </form>

            <div className="mt-16 text-center border-t border-slate-50 pt-10">
               <div className="flex items-center justify-center gap-2 mb-6">
                 <AlertTriangle size={14} className="text-amber-500" />
                 <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[3px]">Internal SPA ENTERPRISE Network</p>
               </div>
               <div className="flex flex-wrap items-center justify-center gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-blue-400 hover:border-blue-100 transition-all cursor-pointer">NODE-SYNC-{i}</div>)}
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
