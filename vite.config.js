import { defineConfig } from 'vite';
import InlineTemplatesPlugin from './buildtools/vite-inline-templates-plugin';
import RestartPlugin from './buildtools/vite-restart-plugin';

export default defineConfig({
  root: './src',
  base: './',
  build: {
    outDir: '../public',
    sourcemap: true,
    emptyOutDir: true
  },
  plugins: [InlineTemplatesPlugin(), RestartPlugin()]
});
