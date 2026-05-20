import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bank.checktang',
  appName: 'เช็คตังค์',
  webDir: 'dist/client',
  
  // Android-specific configuration
  android: {
    // Allow loading from file:// protocol
    allowMixedContent: true,
    // Optimize WebView performance
    webContentsDebuggingEnabled: false,
  },
  
  // Ensure no remote server URLs are used
  // The app loads entirely from local bundled files
  // server: {} is intentionally omitted to use local assets only
  
  // Plugin configuration
  plugins: {
    // Disable splash screen auto-hide for faster perceived startup
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
  },
};

export default config;
