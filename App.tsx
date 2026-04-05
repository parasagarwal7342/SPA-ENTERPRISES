import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Products from './components/Products';
import Login from './components/Login';
import SellerDashboard from './components/SellerDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import Checkout from './components/Checkout';
import CatalogExport from './components/CatalogExport';
import AIAdvisor from './components/AIAdvisor';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './AuthContext';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#home');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#home';
      setCurrentPath(hash);
      
      // If the hash matches a component name precisely (like #products/checkout) scroll to top.
      // If it's a section anchor within a page (like #brands on Home), don't force top.
      const isInternalAnchor = hash === '#brands' || hash === '#support';
      if (!isInternalAnchor) {
          window.scrollTo(0, 0);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    switch (currentPath) {
      case '#home':
        return <Home />;
      case '#products':
        return <Products />;
      case '#checkout':
        return <Checkout />;
      case '#catalog':
        return <CatalogExport />;
      case '#login':
      case '#seller-login':
      case '#owner-login':
        return isAuthenticated ? (
          user?.role === 'owner' ? <OwnerDashboard /> : 
          user?.role === 'seller' ? <SellerDashboard /> : <Home />
        ) : <Login />;
      case '#seller':
        return (
          <ProtectedRoute role="seller">
            <SellerDashboard />
          </ProtectedRoute>
        );
      case '#owner':
        return (
          <ProtectedRoute role="owner">
            <OwnerDashboard />
          </ProtectedRoute>
        );
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100">
      {/* Dynamic Navigation for 3 Portals */}
      {currentPath !== '#seller' && currentPath !== '#owner' && <Navbar currentPath={currentPath} />}
      
      <main className="flex-grow">
        {renderContent()}
      </main>

      {/* Persistence Interface */}
      {currentPath !== '#seller' && currentPath !== '#owner' && <AIAdvisor />}
      {currentPath !== '#seller' && currentPath !== '#owner' && currentPath !== '#login' && <Footer />}
    </div>
  );
};

export default App;
