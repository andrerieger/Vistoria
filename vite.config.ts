import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Using '.' ensures compatibility across different OS/Environments.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Safely replace process.env.API_KEY with the string value
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Define a fallback for process.env to prevent "process is not defined" crashes
      // in libraries that might check it.
      'process.env': {} 
    },
  };
});