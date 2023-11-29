const path = require('path');

export default {
  base: '/your/base',
  root: path.resolve(__dirname, 'src'),
  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
      '~ol': path.resolve(__dirname, 'node_modules/ol'),
    },
  },
  server: {
    port: 8080,
    hot: true,
  },
  build: {
    sourcemap: true,
    target: 'ES2015',
  },
};
