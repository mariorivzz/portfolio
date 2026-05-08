# @astro-webs — Monorepo de sitios web profesionales

## Arquitectura
Monorepo gestionado con **pnpm workspaces**. Cada sitio web es una app Astro independiente que se despliega a Vercel.

## Tech Stack
- **Framework**: Astro 6 (static + on-demand rendering)
- **Backend**: Supabase (Postgres DB, Auth, Edge Functions)
- **Deployment**: Vercel (un proyecto por app)
- **Styling**: Vanilla CSS con custom properties
- **Language**: TypeScript
- **Package manager**: pnpm con workspaces

## Estructura del monorepo
```
├── .github/                  ← instrucciones, skills, agents, workflows
├── AGENTS.md                 ← agentes IA (root)
├── packages/
│   ├── ui/                   ← componentes compartidos (futuro)
│   ├── config/               ← tsconfig base compartido
│   └── utils/                ← helpers: supabase client, fechas, slugs
├── apps/
│   ├── plantilla/            ← plantilla base (copiar para nuevo sitio)
│   ├── veterinarios/
│   │   └── veterinario-sedano/
│   └── psicologos/           ← (futuro)
├── pnpm-workspace.yaml
└── package.json              ← root monorepo
```

## Estructura de cada app
```
apps/<categoría>/<nombre>/
  src/
    components/   → Componentes .astro (Header, Footer, ServiceCard)
    layouts/      → Layouts (Layout.astro)
    lib/          → Clientes y utilidades (supabase.ts)
    pages/        → File-based routing
    styles/       → CSS global
  public/         → Assets estáticos
  astro.config.mjs
  package.json
  vercel.json
```

## Convenciones de código
- Usar componentes Astro (.astro) — no React/Vue/Svelte salvo necesidad explícita
- Usar `import.meta.env` para variables de entorno (nunca `process.env`)
- Supabase client en `src/lib/supabase.ts` de cada app
- Todo el texto visible al usuario en **español**
- HTML semántico
- CSS vanilla con custom properties para theming
- Forms envían datos a Supabase vía JS client, no API endpoints

## Variables de entorno
```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

## Comandos
```bash
pnpm install                                          # Instalar todo
pnpm --filter @astro-webs/<app-name> dev              # Dev server
pnpm --filter @astro-webs/<app-name> build            # Build
```

## Crear un sitio nuevo
1. Copiar `apps/plantilla/` a `apps/<categoría>/<nombre>/`
2. Actualizar `package.json` → `"name": "@astro-webs/<nombre>"`
3. Personalizar colores, textos, servicios
4. Configurar Supabase (crear proyecto, ejecutar SQL, .env)
5. Conectar a Vercel

---

## UI/UX — Diseño profesional anti-IA

### Herramientas de diseño (usar SIEMPRE para cualquier UI)

**ui-ux-pro-max** (instalado en `.github/prompts/ui-ux-pro-max/`):
Genera el design system completo antes de implementar cualquier página.
```bash
python3 .github/prompts/ui-ux-pro-max/scripts/search.py "<sector> <keywords>" --design-system -p "NombreNegocio"
```

**21st.dev**: https://21st.dev/home
Consultar antes de implementar cualquier componente UI (heroes, cards, formularios, footers).

**Heroicons**: https://heroicons.com/
Iconos SVG para TODOS los iconos. **Nunca emojis como iconos estructurales.**

### Reglas anti-IA (obligatorias)

1. **Tipografía**: `clamp()` + `letter-spacing` negativo en headings grandes
2. **Hover**: siempre `transform: translateY()` + variación de `box-shadow`
3. **Layout**: al menos una sección asimétrica por página — no todo centrado
4. **Iconos**: SVG inline de Heroicons o Lucide — 0 emojis como iconos
5. **Reducido motion**: `@media (prefers-reduced-motion: reduce)` en todas las animaciones
6. **Focus visible**: `:focus-visible` con outline visible — nunca `outline: none` sin alternativa

### Skills de diseño disponibles

| Skill | Cuándo usarlo |
|---|---|
| `maquetacion-no-ia` | Diseñar o revisar cualquier layout, componente o sección |
| `seo-performance` | Añadir meta tags, mejorar Core Web Vitals, configurar sitemap |
| `accesibilidad` | Forms, navegación, componentes interactivos, revisión general |
| `ui-ux-pro-max` | Design system sector-specific (comando en `.github/prompts/`) |

### Agentes de diseño disponibles

| Agente | Cuándo usarlo |
|---|---|
| `ui-designer` | Diseñar páginas completas o secciones desde cero |
| `layout-reviewer` | Revisar y mejorar diseños existentes |
