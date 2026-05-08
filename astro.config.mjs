// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // 'static' is the default; API routes opt-out via `export const prerender = false`
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  vite: {
    ssr: {
      // Bundle OTel CJS packages so Vite's interop can resolve named exports
      noExternal: [/^@opentelemetry\/.*/],
    },
  },
});
