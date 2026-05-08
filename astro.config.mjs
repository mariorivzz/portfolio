// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // 'static' = static by default, API routes opt out via `export const prerender = false`
  output: 'static',
  adapter: cloudflare(),
});
