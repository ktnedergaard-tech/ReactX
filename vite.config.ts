import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: true, // gør det muligt at åbne dev-serveren fra telefonen på samme wifi
  },
  build: {
    target: 'es2020',
  },
});
