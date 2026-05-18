import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bank.checktang',
  appName: 'เช็คตังค์',
  webDir: 'dist/client',
  server: {
    url: 'https://checktang.zaanet40230.workers.dev',
    cleartext: true
  }
};

export default config;
