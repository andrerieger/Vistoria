import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'VistoriLar',
          short_name: 'VistoriLar',
          description: 'Plataforma profissional de vistorias imobiliárias com IA.',
          theme_color: '#0f172a', // Cor de fundo do tema escuro (slate-950)
          background_color: '#0f172a',
          display: 'standalone', // Remove a barra de navegação do browser
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'https://photos.google.com/share/AF1QipMNsxWAicsHxBFmrMKqgwRY6ad92_vMpUbJZcwfPIuSIflfz-ajWOJ6zOQ81gLoVg/photo/AF1QipNsvcD_WQjCF6anN4Rc0FILgNmKt_EWoBssKJPV?key=Ym1kaDlaV0RXWk5yX3FoZ0pYRkV0TlBRbTZjS0dn.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://photos.google.com/share/AF1QipMNsxWAicsHxBFmrMKqgwRY6ad92_vMpUbJZcwfPIuSIflfz-ajWOJ6zOQ81gLoVg/photo/AF1QipNsvcD_WQjCF6anN4Rc0FILgNmKt_EWoBssKJPV?key=Ym1kaDlaV0RXWk5yX3FoZ0pYRkV0TlBRbTZjS0dn.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});