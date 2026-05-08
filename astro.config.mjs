// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // 'static' = static by default, API routes opt out via `export const prerender = false`
  output: 'static',
  adapter: vercel(),
});
