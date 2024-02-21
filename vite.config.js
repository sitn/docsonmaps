import { defineConfig, loadEnv } from 'vite';
import InlineTemplatesPlugin from './buildtools/vite-inline-templates-plugin';
import RestartPlugin from './buildtools/vite-restart-plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    base: env.VITE_BASE_URL,
    root: './src',
    build: {
      sourcemap: true,
      emptyOutDir: true,
      chunkSizeWarningLimit: '1MB',
      target: 'es2020',
      minify: false,
    },
    plugins: [InlineTemplatesPlugin(), RestartPlugin()]
  }
});
