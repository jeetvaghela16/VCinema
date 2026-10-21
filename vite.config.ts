import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const tmdbKey = env.VITE_TMDB_API_KEY || '';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api/tmdb': {
          target: 'https://api.themoviedb.org/3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tmdb/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (tmdbKey) {
                // Securely append API key on server side without leaking into browser client URLs
                const parsed = new URL(proxyReq.path, 'https://api.themoviedb.org');
                parsed.searchParams.set('api_key', tmdbKey);
                parsed.searchParams.set('include_adult', 'false');
                proxyReq.path = parsed.pathname + parsed.search;
              }
            });
          },
        },
      },
    },
  };
});