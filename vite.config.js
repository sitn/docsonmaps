import { defineConfig } from 'vite';
import InlineTemplatesPlugin from './buildtools/vite-inline-templates-plugin';
import RestartPlugin from './buildtools/vite-restart-plugin';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  return {
    root: './src',
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/index.html'),
          edit: resolve(__dirname, 'src/edit/index.html'),
        },
      },
      emptyOutDir: true,
      chunkSizeWarningLimit: '1MB',
      target: 'es2020',
    },
    plugins: [InlineTemplatesPlugin(), RestartPlugin()]
  }
});
