---
applyTo: '**/*.astro'
description: 'Use when editing or creating Astro component files (.astro). Covers Astro 6 component syntax, frontmatter scripts, template expressions, slots, and file-based routing.'
---

# Astro Component Guidelines

## Component Structure

Every `.astro` file has two parts separated by `---`:

```astro
---
// Frontmatter: server-side JavaScript/TypeScript runs at build time
import Layout from '../layouts/Layout.astro';
const title = 'Page Title';
---

<!-- Template: HTML with JSX-like expressions -->
<Layout title={title}>
  <h1>{title}</h1>
</Layout>
```

## Key Patterns

- **Props**: Use `Astro.props` to receive component props. Define with TypeScript interface:
  ```astro
  ---
  interface Props {
    title: string;
    description?: string;
  }
  const { title, description } = Astro.props;
  ---
  ```
- **Dynamic routes**: Use `[param].astro` or `[...slug].astro` in `src/pages/`
- **Slots**: Use `<slot />` for content projection, named slots with `<slot name="header" />`
- **Client directives**: Add interactivity with `client:load`, `client:idle`, `client:visible`
- **Imports**: Import components without file extension paths — use full `.astro` extension

## Astro 6 Specifics

- Content Layer API for typed content collections
- `astro:env` module for validated environment variables
- `output: 'static'` is default; use `output: 'server'` for SSR
- Use `export const prerender = false` in static mode for individual SSR pages
- `Astro.redirect()` for server-side redirects
- `Astro.cookies` for cookie management in SSR

## Don'ts

- Don't use `document` or `window` in frontmatter (server-side only)
- Don't import React/Vue unless the page explicitly needs client-side interactivity
- Don't use `process.env` — use `import.meta.env`
