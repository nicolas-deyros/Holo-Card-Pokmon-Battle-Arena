import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
    return {
      plugins: [react()],
      root: path.resolve(__dirname, '..'),
      // Enable Rolldown (experimental)
      experimental: {
        rolldown: true,
      } as { rolldown: boolean },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          '@/components': path.resolve(__dirname, '../src/components'),
          '@/hooks': path.resolve(__dirname, '../src/hooks'),
          '@/utils': path.resolve(__dirname, '../src/utils'),
          '@/services': path.resolve(__dirname, '../src/services'),
          '@/types': path.resolve(__dirname, '../src/types'),
          '@/constants': path.resolve(__dirname, '../src/constants'),
        }
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['src/test/setup.ts'],
        css: true,
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
          exclude: [
            'node_modules/',
            'dist/',
            'coverage/',
            '**/*.d.ts',
            '**/*.config.{js,ts}',
            '**/test/**',
            '**/__tests__/**',
          ],
        },
      },
    };
});
