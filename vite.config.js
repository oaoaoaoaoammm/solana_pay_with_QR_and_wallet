import { defineConfig } from 'vite';
import {nodePolyfills} from 'vite-plugin-node-polyfills';

// витя конфиг епта, доки сами ищите, но сервера, порты и все в таком духе указывать можно, разрешаю

export default defineConfig({
  plugins: [
    nodePolyfills()
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  }
});
