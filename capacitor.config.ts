import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bank.checktang',
  appName: 'เช็คตังค์',
  webDir: 'dist'
  server: {
    // ปล่อยให้มันวิ่งมาดึงพอร์ตของคอมพิวเตอร์โดยตรง
    url: 'http://192.168.0.143:8080', 
    cleartext: true
  }
};

export default config;
