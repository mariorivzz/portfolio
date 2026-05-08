---
name: seo-performance
description: "Use when: adding SEO meta tags, improving Core Web Vitals, optimizing images, configuring sitemap, or improving Lighthouse scores in any Astro app."
argument-hint: "Describe what to optimize (e.g., 'add SEO to psicologo-mariorivas', 'improve LCP', 'configure sitemap')"
---

# Skill: SEO y Rendimiento para Astro

## Paquetes necesarios
```bash
# Desde la raíz del monorepo, instalar en la app objetivo
pnpm --filter @astro-webs/<nombre> add @astrojs/sitemap
```
`@astrojs/sitemap` ya está en la plantilla base.

---

## 1. Meta tags en Layout.astro

```astro
---
interface Props {
  title: string;
  description?: string;
  image?: string;        // URL absoluta para OG
  type?: 'website' | 'article';
  noindex?: boolean;
}
const {
  title,
  description = 'Descripción por defecto del negocio',
  image = '/og-default.png',
  type = 'website',
  noindex = false,
} = Astro.props;

const siteUrl = import.meta.env.SITE || 'https://tudominio.com';
const canonicalUrl = new URL(Astro.url.pathname, siteUrl);
---

<head>
  <!-- Básico -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} | NombreNegocio</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  {noindex && <meta name="robots" content="noindex, nofollow" />}

  <!-- Open Graph -->
  <meta property="og:title" content={`${title} | NombreNegocio`} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:type" content={type} />
  <meta property="og:image" content={new URL(image, siteUrl)} />
  <meta property="og:locale" content="es_ES" />
  <meta property="og:site_name" content="NombreNegocio" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`${title} | NombreNegocio`} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={new URL(image, siteUrl)} />

  <!-- Schema.org LocalBusiness (adaptar por tipo) -->
  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "NombreNegocio",
    "description": description,
    "url": siteUrl,
    "telephone": "+34600000000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle Ejemplo 45",
      "addressLocality": "Madrid",
      "postalCode": "28001",
      "addressCountry": "ES"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "09:00",
      "closes": "20:00"
    }
  })} />
</head>
```

## 2. Configurar astro.config.mjs para SEO

```js
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tudominio.com',  // OBLIGATORIO para sitemap y canonicals
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // Excluir páginas de admin
      filter: (page) => !page.includes('/admin'),
    }),
  ],
  adapter: vercel(),
});
```

---

## 3. Optimización de imágenes (Core Web Vitals)

### Imagen de hero (LCP crítico)

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<!-- Image component de Astro: lazy por defecto, pero hero necesita eager -->
<Image
  src={heroImage}
  alt="Descripción específica de la imagen"
  width={1200}
  height={630}
  format="webp"
  quality={85}
  loading="eager"      <!-- Para LCP: cargar de inmediato -->
  fetchpriority="high" <!-- Para LCP: prioridad máxima -->
/>
```

### Imágenes de contenido (below the fold)

```astro
<Image
  src={imagenServicio}
  alt="Descripción del servicio"
  width={600}
  height={400}
  format="webp"
  quality={80}
  loading="lazy"
/>
```

### Preload del hero en Layout.astro

```html
<head>
  <!-- Preload para imagen hero (mejora LCP) -->
  <link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />
</head>
```

---

## 4. Fuentes: evitar layout shift (CLS)

```html
<!-- Preconnect obligatorio -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- font-display=swap para no bloquear render -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```

```css
/* Font fallback con métricas similares para evitar CLS */
:root {
  --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Estabilizar layout mientras carga la fuente */
body {
  font-family: var(--font-sans);
  font-display: optional; /* alternativa más agresiva: no mostrar si no carga en 0ms */
}
```

---

## 5. CSS crítico (Inline para FCP)

Para páginas con mucho CSS, inlinear los estilos above-the-fold en `<head>`:

```html
<style>
  /* Solo estilos críticos: header, hero, fuentes */
  :root { --color-primary: #6b5b95; }
  body { margin: 0; font-family: system-ui, sans-serif; }
  .header { position: sticky; top: 0; background: #fff; }
</style>
<!-- El resto del CSS se carga de forma diferida (ya lo hace Astro por defecto) -->
```

---

## 6. robots.txt

```
# public/robots.txt
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://tudominio.com/sitemap-index.xml
```

---

## 7. Core Web Vitals — checklist

| Métrica | Target | Acciones |
|---|---|---|
| **LCP** < 2.5s | Contenido principal | `loading="eager"` + `fetchpriority="high"` en imagen hero |
| **CLS** < 0.1 | Estabilidad visual | `width/height` explícitos en `<Image>`, `font-display: swap` |
| **INP** < 200ms | Interactividad | Evitar JS bloqueante, usar `client:idle` en componentes no críticos |
| **FCP** < 1.8s | Primer render | CSS crítico inline, preconnect a fonts |

---

## 8. Análisis y monitoreo

```bash
# Lighthouse en local (después de build)
pnpm --filter @astro-webs/<nombre> build
pnpm --filter @astro-webs/<nombre> preview

# En otra terminal
npx lighthouse http://localhost:4321 --output html --output-path ./lighthouse-report.html
```

---

## Checklist final SEO

- [ ] `site` configurado en `astro.config.mjs`
- [ ] Todas las páginas tienen `<title>` y `<meta name="description">` únicos
- [ ] `<link rel="canonical">` presente en todas las páginas
- [ ] Open Graph configurado (título, descripción, imagen, URL)
- [ ] Schema.org LocalBusiness con datos reales del negocio
- [ ] Sitemap generado y enlazado en robots.txt
- [ ] Páginas admin excluidas con `noindex` o en `disallow`
- [ ] Imágenes usan `<Image>` de Astro (no `<img>` plano)
- [ ] Hero image con `loading="eager"` y `fetchpriority="high"`
- [ ] Preconnect a Google Fonts en `<head>`
