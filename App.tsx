import React, { Suspense, lazy, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import Checkout from './components/Checkout';
import Login from './components/Login';
import TrackOrder from './components/TrackOrder';
import Account from './components/Account';
import BulkQuote from './components/BulkQuote';
import Warranty from './components/Warranty';
import Policies from './components/Policies';
import AIAdvisor from './components/AIAdvisor';
import WhatsAppButton from './components/WhatsAppButton';
import ProtectedRoute from './components/ProtectedRoute';
import { Spinner } from './components/ui';
import { Link, useLocation } from './lib/router';

// Dashboards pull in charting code; load them only for staff.
const StaffDashboard = lazy(() => import('./components/SellerDashboard'));
const OwnerDashboard = lazy(() => import('./components/OwnerDashboard'));
const CatalogExport = lazy(() => import('./components/CatalogExport'));

const NotFound: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-28">
    <h1 className="text-3xl font-bold text-slate-900 mb-3">Page not found</h1>
    <p className="text-slate-500 mb-8">The page you are looking for has moved or no longer exists.</p>
    <Link to="/products" className="btn-primary">Browse products</Link>
  </div>
);

const App: React.FC = () => {
  const { path, hash } = useLocation();

  // Scroll to an in-page section (/#about) when there is one, otherwise to the top on page change.
  const lastPath = useRef(path);
  useEffect(() => {
    const pathChanged = lastPath.current !== path;
    lastPath.current = path;
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 50);
      return () => clearTimeout(t);
    }
    if (pathChanged) window.scrollTo(0, 0);
  }, [path, hash]);

  const productMatch = path.match(/^\/products\/([^/]+)$/);
  const isBackOffice = path.startsWith('/staff') || path.startsWith('/owner') || path === '/catalog';

  let page: React.ReactNode;
  if (path === '/') page = <Home />;
  else if (path === '/products') page = <Products />;
  else if (productMatch) page = <ProductDetail id={decodeURIComponent(productMatch[1])} />;
  else if (path === '/cart' || path === '/checkout') page = <Checkout />;
  else if (path === '/track') page = <TrackOrder />;
  else if (path === '/bulk-order') page = <BulkQuote />;
  else if (path === '/warranty') page = <Warranty />;
  else if (path === '/policies') page = <Policies />;
  else if (path === '/login') page = <Login />;
  else if (path === '/account') page = <ProtectedRoute><Account /></ProtectedRoute>;
  else if (path === '/staff') page = <ProtectedRoute roles={['seller', 'owner']}><StaffDashboard /></ProtectedRoute>;
  else if (path === '/owner') page = <ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>;
  else if (path === '/catalog') page = <CatalogExport />;
  else page = <NotFound />;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100">
      {!isBackOffice && <Navbar />}
      <main className="flex-grow">
        <Suspense fallback={<div className="pt-40 flex justify-center"><Spinner /></div>}>{page}</Suspense>
      </main>
      {!isBackOffice && (
        <>
          <WhatsAppButton />
          <AIAdvisor />
          <Footer />
        </>
      )}
    </div>
  );
};

export default App;
