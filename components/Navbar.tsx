import React, { useEffect, useState } from 'react';
import { Menu, X, ShoppingBag, User, Search, LayoutDashboard, LogOut, Package, Truck, Briefcase } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { Link, navigate, useLocation } from '../lib/router';

const navItems = [
  { label: 'Shop', to: '/products' },
  { label: 'Bulk & Corporate', to: '/bulk-order' },
  { label: 'Track Order', to: '/track' },
  { label: 'About', to: '/#about' },
  { label: 'Contact', to: '/#contact' },
];

const Navbar: React.FC = () => {
  const { user, logout, isStaff } = useAuth();
  const { count, lastAdded } = useCart();
  const { path, search } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (path === '/products') setQuery(new URLSearchParams(search).get('q') ?? '');
  }, [path, search]);

  useEffect(() => {
    if (!lastAdded) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 600);
    return () => clearTimeout(t);
  }, [lastAdded]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : '/products');
    setIsOpen(false);
  };

  const dashboardLink = user?.role === 'owner' ? '/owner' : user?.role === 'seller' ? '/staff' : null;

  const CartButton = (
    <Link to="/cart" aria-label={`Cart, ${count} items`} className={`relative p-2.5 rounded-xl hover:bg-slate-100 transition ${bump ? 'scale-110' : ''}`}>
      <ShoppingBag size={22} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-bold border-2 border-white">
          {count}
        </span>
      )}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 lg:h-20 flex items-center gap-4 lg:gap-8">
        <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
          <img src="/logo.png" className="w-9 h-9 rounded-lg object-contain border border-slate-100" alt="" />
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-slate-900">SPA <span className="text-blue-600">ENTERPRISE</span></span>
            <span className="text-[10px] text-slate-500 font-medium hidden sm:block mt-0.5">Authorised Distributor · Delhi</span>
          </span>
        </Link>

        <form onSubmit={submitSearch} className="hidden lg:flex flex-grow max-w-md relative" role="search">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bags, suitcases, jewellery…"
            aria-label="Search products"
            className="input pl-10 py-2.5 bg-slate-50"
          />
        </form>

        <div className="hidden md:flex items-center gap-6 ml-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm font-medium transition hover:text-blue-600 ${path === item.to ? 'text-blue-600' : 'text-slate-600'}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto md:ml-0">
          {user ? (
            <div className="hidden md:flex items-center gap-1">
              {dashboardLink && (
                <Link to={dashboardLink} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  {user.role === 'owner' ? <Briefcase size={18} /> : <LayoutDashboard size={18} />} Dashboard
                </Link>
              )}
              <Link to="/account" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100" title={user.email}>
                <User size={18} /> {user.name.split(' ')[0]}
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50" aria-label="Sign out" title="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100">
              <User size={18} /> Sign in
            </Link>
          )}
          {CartButton}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2.5 rounded-xl hover:bg-slate-100" aria-label="Menu" aria-expanded={isOpen}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pb-6 pt-4 space-y-4 shadow-xl">
          <form onSubmit={submitSearch} className="relative" role="search">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" aria-label="Search products" className="input pl-10" />
          </form>
          <div className="grid gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setIsOpen(false)} className="px-3 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-4 grid gap-1">
            {user ? (
              <>
                {dashboardLink && (
                  <Link to={dashboardLink} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-50">
                    <LayoutDashboard size={18} /> {isStaff && user.role === 'owner' ? 'Owner dashboard' : 'Staff dashboard'}
                  </Link>
                )}
                <Link to="/account" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-50">
                  <Package size={18} /> My orders
                </Link>
                <button onClick={() => { logout(); setIsOpen(false); navigate('/'); }} className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 text-left">
                  <LogOut size={18} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="btn-dark w-full">Sign in / Create account</Link>
                <Link to="/track" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-50">
                  <Truck size={18} /> Track an order
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
