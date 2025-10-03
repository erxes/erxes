import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import * as path from 'path';

export default defineConfig({
  base: '/pl:payment/widget/',
  server: {
    port: 5173,
    hmr: true
  },
  plugins: [react()],
  root: __dirname, // This is /app/backend/plugins/payment_api/src/widget
  build: {
    outDir: '../public/widget', // This goes to /app/backend/plugins/payment_api/src/public/widget
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});