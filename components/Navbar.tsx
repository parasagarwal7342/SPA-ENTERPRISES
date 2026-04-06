import React, { useState } from 'react';
import { Menu, X, ShoppingBag, User, Store, Search, LayoutDashboard, LogOut, ChevronDown, Briefcase, Zap } from 'lucide-react';
import { useProducts } from '../ProductContext';
import { useAuth } from '../AuthContext';

interface NavbarProps {
  currentPath: string;
}

const Navbar: React.FC<NavbarProps> = ({ currentPath }) => {
  const { cartItems } = useProducts();
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Products', href: '#products' },
    { label: 'Brands', href: '#brands' },
    { label: 'Support', href: '#support' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between gap-10">
        
        {/* Brand Core Identity */}
        <div 
          className="flex-shrink-0 flex items-center gap-3 group cursor-pointer" 
          onClick={() => {
            if (window.location.hash === '#home' || !window.location.hash) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.location.hash = '#home';
            }
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-100 overflow-hidden bg-white border border-slate-100">
            <img src="/logo.png" className="w-full h-full object-contain" alt="SPA Logo" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
              SPA <span className="text-blue-600">ENTERPRISE</span>
            </span>
            <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase opacity-80">Official Distributor Hub</span>
          </div>
        </div>

        {/* Dynamic Search Interface */}
        <div className="hidden lg:flex flex-grow max-w-2xl relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Query Registry, Asset IDs, and Brands..."
            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-sm text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-8 focus:ring-blue-50 transition-all duration-200 shadow-sm"
          />
        </div>

        {/* Global Desktop Protocol */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-8 border-r border-slate-100 pr-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-[12px] font-black uppercase tracking-widest transition-all duration-200 hover:text-blue-600 relative group ${
                  currentPath === item.href ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                {item.label}
                {currentPath === item.href && (
                   <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blue-600 rounded-full animate-in fade-in duration-500"></span>
                )}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {/* Context-Aware Portal Toggles */}
            {isAuthenticated ? (
               user?.role === 'owner' ? (
                 <a href="#owner" className="flex items-center gap-3 text-slate-930 hover:text-blue-600 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition-all shadow-xl shadow-slate-200">
                       <Briefcase size={20} />
                    </div>
                    <div className="text-left hidden xl:block">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Executive Hub</p>
                        <p className="text-[13px] font-black leading-none">Owner Dashboard</p>
                    </div>
                 </a>
               ) : user?.role === 'seller' ? (
                 <a href="#seller" className="flex items-center gap-3 text-slate-930 hover:text-blue-600 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-all shadow-xl shadow-blue-100">
                       <Store size={20} />
                    </div>
                    <div className="text-left hidden xl:block">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Management Hub</p>
                        <p className="text-[13px] font-black leading-none">Staff Portal</p>
                    </div>
                 </a>
               ) : null
            ) : (
                <a href="#seller-login" className="flex items-center gap-3 text-slate-900 hover:text-blue-600 transition-all group">
                    <Zap size={20} className="text-blue-600" />
                    <div className="text-left hidden lg:block">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Distribution</p>
                        <p className="text-[13px] font-black leading-none">Internal Team access</p>
                    </div>
                </a>
            )}

            {/* Combined Profile Hub */}
            <div className="flex items-center gap-4">
               {isAuthenticated ? (
                   <div className="flex items-center gap-4 pl-4 border-l border-slate-100 group relative">
                      <div className="text-right hidden xl:block">
                         <p className="text-[12px] font-bold text-slate-900 leading-none">{user?.name}</p>
                         <button onClick={logout} className="text-[9px] text-red-500 font-black uppercase tracking-widest hover:text-red-600 transition-colors mt-1.5 flex items-center gap-1 justify-end">
                            <LogOut size={10} /> Sign Out Node
                         </button>
                      </div>
                      <img src={user?.avatar} alt="Profile" className="w-10 h-10 rounded-xl border border-slate-200 group-hover:border-blue-300 transition-all hover:scale-105" />
                   </div>
               ) : (
                   <a href="#login" className="bg-slate-900 text-white px-7 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[3px] flex items-center gap-3 hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all">
                      <User size={18} /> Initialize Login
                   </a>
               )}

               {/* Asset Collection State */}
               <div 
                 onClick={() => window.location.hash = '#checkout'}
                 className="relative text-slate-900 cursor-pointer group p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100"
               >
                 <ShoppingBag size={22} className="group-hover:text-blue-600 transition-colors" />
                 <span className="absolute top-1 right-1 bg-blue-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-xl">
                   {cartItems.length}
                 </span>
               </div>
            </div>
          </div>
        </div>

        {/* Mobile Control Nodes */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-900 p-2 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Interface */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-4 right-4 bg-white border border-slate-200 rounded-[32px] shadow-2xl animate-in fade-in slide-in-from-top duration-500 z-[100] mt-4 overflow-hidden">
          <div className="px-8 py-10 space-y-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-8 py-5 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${
                  currentPath === item.href
                    ? 'bg-blue-50 text-blue-600 shadow-inner'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-8 border-t border-slate-50 space-y-4">
               {isAuthenticated && (
                  <div className="px-8 mb-6 flex items-center gap-4">
                     <img src={user?.avatar} className="w-12 h-12 rounded-2xl border border-slate-100" />
                     <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-930 leading-none">{user?.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{user?.role}</p>
                     </div>
                  </div>
               )}
              <a
                href={isAuthenticated ? (user?.role === 'owner' ? '#owner' : user?.role === 'seller' ? '#seller' : '#home') : '#login'}
                onClick={() => setIsOpen(false)}
                className="w-full bg-slate-930 text-white py-5 rounded-[24px] text-center font-black text-xs uppercase tracking-[4px] block shadow-xl shadow-slate-200"
              >
                {isAuthenticated ? 'Enter Management' : 'Initialize Portal'}
              </a>
              {isAuthenticated && (
                <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full py-5 border border-red-100 text-red-500 rounded-[24px] text-center font-black text-xs uppercase tracking-[4px] block hover:bg-red-50 transition-all"
                >
                    Sign Out Terminal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
