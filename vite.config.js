import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    purgeCss(),
    {
      name: 'configure-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/health') {
            res.statusCode = 200;
            res.end('OK');
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});