import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { apiRouter } from './server/api.ts';

function expressApiPlugin(): Plugin {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);

  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && (req.url === '/api' || req.url.startsWith('/api/') || req.url.startsWith('/api?'))) {
          app(req as any, res as any, next);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), expressApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
