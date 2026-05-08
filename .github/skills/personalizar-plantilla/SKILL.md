---
name: personalizar-plantilla
description: "Use when: customizing an existing site's design, content, services, or branding. Covers color themes, text content, service lists, contact info, and layout adjustments."
argument-hint: "Describe what to customize (e.g., 'change colors to blue', 'update services list for dentist')"
---

# Skill: Personalizar una web existente

## Procedimiento

### 1. Identificar la app
Confirmar la ruta de la app a personalizar:
```
apps/<categoría>/<nombre>/
```
Verificar que el `pnpm dev` funciona antes de hacer cambios.

### 2. Cambio de identidad visual

#### Colores
Fichero: `src/styles/global.css`

```css
:root {
  --color-primary: #NUEVO_COLOR;
  --color-primary-dark: #COLOR_HOVER;
  --color-primary-50: rgba(R, G, B, 0.06);
  --color-primary-100: rgba(R, G, B, 0.1);
  --color-primary-200: rgba(R, G, B, 0.2);
}
```

Para generar las variantes desde un hex:
1. `--color-primary` → el color elegido
2. `--color-primary-dark` → 15-20% más oscuro
3. `--color-primary-50/100/200` → mismo color con opacidad baja

#### Tipografía
Si se necesita otra fuente, cambiar en `src/layouts/Layout.astro`:
```html
<link href="https://fonts.googleapis.com/css2?family=NUEVA+FUENTE:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```
Y en `global.css`:
```css
--font-sans: 'Nueva Fuente', system-ui, sans-serif;
```

### 3. Contenido textual

#### Páginas principales
| Página | Fichero | Qué cambiar |
|--------|---------|-------------|
| Inicio | `src/pages/index.astro` | Título hero, subtítulo, servicios destacados, CTA |
| Servicios | `src/pages/servicios.astro` | Lista completa de servicios con descripciones |
| Citas | `src/pages/citas.astro` | Opciones del `<select>` de servicios |
| Contacto | `src/pages/contacto.astro` | Dirección, teléfono, email, horario |

#### Componentes
| Componente | Fichero | Qué cambiar |
|------------|---------|-------------|
| Header | `src/components/Header.astro` | Nombre del negocio, logo, links de nav |
| Footer | `src/components/Footer.astro` | Nombre, servicios en footer, datos contacto |
| Layout | `src/layouts/Layout.astro` | `<title>` suffix, meta description default |

### 4. Servicios del negocio
Los servicios se definen inline en las páginas. El patrón es:

```astro
const servicios = [
  { title: 'Nombre', description: 'Descripción breve.', icon: '🔷' },
  // ... más servicios
];
```

Para iconos, usar emojis o SVG inline según el tipo de negocio.

### 5. Contenido dinámico desde Supabase (opcional)
Si el negocio quiere editar contenidos sin tocar código:

1. Crear tabla `contenidos` en Supabase:
```sql
CREATE TABLE contenidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. Cargar contenido en las páginas:
```astro
---
import { supabase } from '../lib/supabase';
const { data: rows } = await supabase.from('contenidos').select('clave, valor');
const c: Record<string, string> = {};
if (rows) for (const row of rows) c[row.clave] = row.valor;
const t = (key: string, fallback: string) => c[key] ?? fallback;
---
<h1>{t('hero_titulo', 'Título por defecto')}</h1>
```

### 6. Verificar cambios
```bash
pnpm --filter @astro-webs/<nombre> dev
```
- Verificar en móvil (responsive)
- Verificar contraste de colores
- Probar formularios
- Revisar todos los textos

## Errores comunes
- **Color no cambia**: Asegurar que se actualizan TODAS las variantes (50, 100, 200, dark)
- **Fuente no carga**: Verificar que el link de Google Fonts está en Layout.astro
- **Forms no envían**: Verificar `.env` con credenciales Supabase correctas
