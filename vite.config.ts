import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  publicDir: false, // مهم: بنعالج الأصوات عن طريق import
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // مايعملش inline للملفات الكبيرة
    rollupOptions: {
      output: {
        manualChunks: {
          babylon: ['@babylonjs/core']
        }
      }
    }
  },
  assetsInclude: ['**/*.mp3'] // عشان Vite يعرف يتعامل مع mp3
});
