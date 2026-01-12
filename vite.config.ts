import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // We use '.' instead of process.cwd() to avoid TS errors in some environments
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // This is necessary to prevent "process is not defined" in the browser
      // and to satisfy the requirement of using process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});