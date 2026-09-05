import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mpaDev } from './scripts/vite-plugin-mpa-dev.mjs';

// root = app/ ; static source = app/public/ (dev and prod share the same URL semantics).
// base '/' is load-bearing: /en/*.html must resolve /assets/… absolutely.
// appType 'mpa' makes `vite preview` behave like nginx `try_files … =404` (no SPA fallback).
// Build goes to an untrusted stage; scripts/publish-build.mjs promotes only the GENERATED
// allowlist into the repo root after verification. Never point outDir at the repo root.
export default defineConfig({
  root: 'app',
  base: '/',
  appType: 'mpa',
  plugins: [react(), mpaDev()],
  build: {
    outDir: '../build-stage',
    emptyOutDir: true,
    assetsDir: 'assets',
    target: 'es2020',
    manifest: false,
  },
});
