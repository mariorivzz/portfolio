// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://portfolio-mariorivas.vercel.app',
  // 'static' = static by default, API routes opt out via `export const prerender = false`
  output: 'static',
  integrations: [sitemap()],
  adapter: vercel(),
});
