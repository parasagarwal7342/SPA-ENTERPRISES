import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_API = 'https://spa-enterprises-production.up.railway.app';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiOrigin = new URL(env.VITE_API_URL || DEFAULT_API).origin;
  return {
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
