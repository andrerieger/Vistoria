import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Using '.' instead of process.cwd() avoids potential path issues in some environments.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Prevents "process is not defined" error in browser
      // Injects the API Key defined in Vercel Environment Variables
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});