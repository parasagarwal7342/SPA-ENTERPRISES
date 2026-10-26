import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_API = 'https://spa-enterprises-production.up.railway.app';

// Accept "host/api", "https://host" etc.; never fail the build over the format.
function apiOriginFrom(value: string | undefined) {
  const raw = (value || DEFAULT_API).trim();
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).origin;
  } catch {
    console.warn(`[vite] Ignoring invalid VITE_API_URL "${raw}", using ${DEFAULT_API}`);
    return DEFAULT_API;
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiOrigin = apiOriginFrom(env.VITE_API_URL);
  return {
    // The API client reads the same normalised value, so both always agree.
    define: { 'import.meta.env.VITE_API_ORIGIN': JSON.stringify(apiOrigin) },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        // Let the page's Content-Security-Policy talk to whichever API this build points at.
        name: 'csp-api-origin',
        transformIndexHtml: (html) => html.replace('%API_ORIGIN%', mode === 'development' ? `${apiOrigin} http://localhost:5000 ws:` : apiOrigin),
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
