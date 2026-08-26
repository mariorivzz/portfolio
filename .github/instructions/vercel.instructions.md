---
applyTo: 'vercel.json,astro.config.mjs'
description: 'Use when configuring Vercel deployment, adapters, serverless functions, or environment variables for Vercel hosting.'
---

# Vercel Deployment Guidelines

## Astro + Vercel Setup

Install the Vercel adapter:

```bash
npx astro add vercel
```

This adds `@astrojs/vercel` to `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server', // or 'static' for fully static
  adapter: vercel(),
});
```

## Environment Variables

- Set environment variables in Vercel Dashboard → Settings → Environment Variables
- Use `PUBLIC_` prefix for client-exposed variables
- Never commit `.env` files — use `.env.example` as template

## vercel.json (optional)

```json
{
  "framework": "astro",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

## Serverless Functions

- Astro API routes (`src/pages/api/`) become Vercel Serverless Functions automatically
- Use `export const prerender = false` for SSR pages in static mode
- Edge functions available with `export const config = { runtime: 'edge' }`

## Best Practices

- Use `astro build` for production builds (Vercel does this automatically)
- Enable ISR (Incremental Static Regeneration) for pages that change occasionally
- Use Vercel's built-in analytics and speed insights
- Configure redirects in `vercel.json` or Astro middleware
