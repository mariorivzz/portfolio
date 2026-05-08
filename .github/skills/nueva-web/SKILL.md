---
name: nueva-web
description: "Use when: creating a brand new website from the template. Covers copying apps/plantilla/, renaming the package, configuring the project with its own identity, and preparing it for Supabase and Vercel deployment."
argument-hint: "Describe the new site: business type, name, and category (e.g., 'create a new psychologist website called psicologo-martinez')"
---

# Skill: Crear una nueva web desde la plantilla

## Procedimiento

### 1. Recopilar información del negocio
Antes de empezar, preguntar al usuario:
- **Tipo de negocio**: veterinario, psicólogo, dentista, etc.
- **Nombre del negocio**: para el slug (ej: "veterinario-sedano")
- **Color primario**: código hex (verde, azul, morado, etc.)
- **Servicios principales**: lista de servicios que ofrece
- **Datos de contacto**: dirección, teléfono, email, horario

### 2. Copiar la plantilla
```bash
# Desde la raíz del monorepo
cp -r apps/plantilla apps/<categoría>/<nombre-slug>
```

Las categorías siguen el patrón:
- `apps/veterinarios/veterinario-<nombre>/`
- `apps/psicologos/psicologo-<nombre>/`
- `apps/dentistas/dentista-<nombre>/`
- etc.

### 3. Actualizar package.json
```json
{
  "name": "@astro-webs/<nombre-slug>",
  "private": true
}
```

### 4. Personalizar el sitio

#### 4.1 Colores (`src/styles/global.css`)
Cambiar las custom properties en `:root`:
```css
--color-primary: #NUEVO_COLOR;
--color-primary-dark: #COLOR_OSCURO;
--color-primary-50: rgba(R, G, B, 0.06);
--color-primary-100: rgba(R, G, B, 0.1);
--color-primary-200: rgba(R, G, B, 0.2);
```

Paletas sugeridas por tipo:
| Tipo | Primary | Dark |
|------|---------|------|
| Veterinaria | `#2d6a4f` | `#1b4332` |
| Psicología | `#5b4a8a` | `#3d2e6e` |
| Dentista | `#2563eb` | `#1d4ed8` |
| Fisioterapia | `#0891b2` | `#0e7490` |
| Nutrición | `#65a30d` | `#4d7c0f` |

#### 4.2 Textos y branding
Ficheros a actualizar:
- `src/layouts/Layout.astro` → `<title>` y meta description
- `src/components/Header.astro` → nombre del negocio, links
- `src/components/Footer.astro` → datos contacto, servicios
- `src/pages/index.astro` → título hero, descripción, servicios destacados
- `src/pages/servicios.astro` → lista completa de servicios
- `src/pages/citas.astro` → opciones de servicio en select
- `src/pages/contacto.astro` → información de contacto
- `astro.config.mjs` → `site` con dominio real

### 5. Configurar Supabase
1. Crear un nuevo proyecto en [supabase.com](https://supabase.com)
2. Ejecutar `supabase-setup.sql` en el SQL Editor
3. Crear `.env` con las credenciales:
```
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 6. Verificar
```bash
pnpm install
pnpm --filter @astro-webs/<nombre-slug> dev
```

### 7. Conectar a Vercel
```bash
cd apps/<categoría>/<nombre-slug>
npx vercel link
# Seleccionar o crear proyecto
# Configurar env vars en Vercel Dashboard
```

## Checklist final
- [ ] `package.json` tiene nombre correcto `@astro-webs/<slug>`
- [ ] Colores primarios actualizados
- [ ] Textos en español y personalizados para el negocio
- [ ] Servicios reales del negocio
- [ ] Datos de contacto reales
- [ ] Supabase configurado y SQL ejecutado
- [ ] `.env` con credenciales
- [ ] `pnpm dev` funciona sin errores
- [ ] Formulario de citas envía a Supabase
- [ ] Formulario de contacto envía a Supabase
