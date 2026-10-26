import React, { useEffect, useState } from 'react';

// Minimal history-API router: real URLs (/products/ID) that can be shared and indexed.
const listeners = new Set<() => void>();

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (to === window.location.pathname + window.location.search + window.location.hash) return;
  window.history[opts.replace ? 'replaceState' : 'pushState']({}, '', to);
  listeners.forEach((l) => l());
}

window.addEventListener('popstate', () => listeners.forEach((l) => l()));

export function useLocation() {
  const read = () => ({ path: window.location.pathname, search: window.location.search, hash: window.location.hash });
  const [loc, setLoc] = useState(read);
  useEffect(() => {
    const update = () => setLoc(read());
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);
  return loc;
}

export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }> = ({ to, onClick, ...rest }) => (
  <a
    href={to}
    onClick={(e) => {
      onClick?.(e);
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || rest.target === '_blank') return;
      e.preventDefault();
      navigate(to);
    }}
    {...rest}
  />
);

// Old links used #products, #checkout etc. Map them to real paths so bookmarks keep working.
const LEGACY: Record<string, string> = {
  '#home': '/', '#products': '/products', '#checkout': '/cart', '#catalog': '/catalog',
  '#login': '/login', '#seller-login': '/login', '#owner-login': '/login', '#seller': '/staff', '#owner': '/owner',
  '#about': '/#about', '#management': '/#management', '#contact': '/#contact', '#brands': '/#brands', '#support': '/#support',
};

export function redirectLegacyHash() {
  const target = LEGACY[window.location.hash];
  if (target && window.location.pathname === '/' && target !== '/' + window.location.hash) {
    window.history.replaceState({}, '', target);
    listeners.forEach((l) => l());
  }
}

window.addEventListener('hashchange', redirectLegacyHash);

export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} | SPA Enterprise` : 'SPA Enterprise | National Geographic Bags & Shraddha Jewellery, Delhi';
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
