import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4a03063fbb634d9e9cd282b2b24bf064',
  appName: 'pocket-stock-check',
  webDir: 'dist',
  server: {
    url: 'https://4a03063f-bb63-4d9e-9cd2-82b2b24bf064.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
  },
};

export default config;
