---
name: deploy-vercel
description: 'Use when: deploying any app from the monorepo to Vercel, configuring the Vercel adapter, setting up environment variables, or troubleshooting deployment issues.'
argument-hint: "Describe the deployment task (e.g., 'deploy veterinario-sedano to production', 'configure Vercel for new app')"
---

# Skill: Desplegar una app a Vercel

## Procedimiento

### 1. Verificar el adapter de Astro

Comprobar `astro.config.mjs` de la app:

```js
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static', // o 'server' si usa SSR
  adapter: vercel(),
});
```

Si no está instalado:

```bash
cd apps/<categoría>/<nombre>
npx astro add vercel
```

### 2. Configurar vercel.json

Cada app debe tener su `vercel.json`:

```json
{
  "framework": "astro",
  "buildCommand": "pnpm --filter @astro-webs/<nombre> build",
  "outputDirectory": "apps/<categoría>/<nombre>/.vercel/output",
  "installCommand": "pnpm install",
  "devCommand": "pnpm --filter @astro-webs/<nombre> dev"
}
```

**Alternativa para monorepo**: Configurar en Vercel Dashboard:

- **Root Directory**: `apps/<categoría>/<nombre>`
- **Build Command**: `pnpm build`
- **Output Directory**: `.vercel/output`

### 3. Vincular proyecto en Vercel

#### Opción A: Vercel Dashboard

1. Ir a [vercel.com](https://vercel.com) → New Project
2. Importar el repo de GitHub
3. En **Root Directory** poner: `apps/<categoría>/<nombre>`
4. Framework: Astro
5. Build settings se auto-detectan

#### Opción B: CLI

```bash
cd apps/<categoría>/<nombre>
npx vercel link
```

### 4. Variables de entorno

Configurar en Vercel Dashboard → Settings → Environment Variables:

| Variable                   | Valor                     | Entornos                         |
| -------------------------- | ------------------------- | -------------------------------- |
| `PUBLIC_SUPABASE_URL`      | `https://xxx.supabase.co` | Production, Preview, Development |
| `PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...`             | Production, Preview, Development |

### 5. Build y deploy

#### Preview

```bash
cd apps/<categoría>/<nombre>
npx vercel
```

#### Producción

```bash
npx vercel --prod
```

### 6. Configurar dominio personalizado

1. Vercel Dashboard → Settings → Domains
2. Añadir dominio (ej: `veterinariosedano.com`)
3. Configurar DNS:
   - **A record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com`

### 7. Post-deploy checklist

- [ ] Todas las páginas cargan correctamente
- [ ] Formulario de citas envía datos a Supabase
- [ ] Formulario de contacto funciona
- [ ] Responsive en móvil
- [ ] Meta tags y title correctos
- [ ] Favicon visible
- [ ] HTTPS funciona
- [ ] Si tiene admin: login funciona

### Troubleshooting

#### "Module not found" en build

```bash
# Asegurar que las dependencias están instaladas
pnpm install
pnpm --filter @astro-webs/<nombre> build
```

#### "500 Server Error" en deploy

- Verificar variables de entorno en Vercel
- Comprobar que Supabase project está activo (no pausado)
- Revisar Vercel Function Logs

#### Build lento

- Verificar que `output: 'static'` si no necesita SSR
- Solo páginas con `export const prerender = false` usan server
