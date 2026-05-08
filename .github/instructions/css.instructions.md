---
applyTo: "**/*.css,**/*.astro"
description: "Use when writing or editing CSS styles. Covers the project's theme system, responsive design patterns, anti-AI layout rules, and CSS conventions for any business type."
---

# CSS & Styling Guidelines

## Theme System
Each app defines its own colors via CSS custom properties in `src/styles/global.css`.
The key variables to change per business:
- `--color-primary` — main brand color
- `--color-primary-dark` — hover/active state
- `--color-primary-50/100/200` — transparent variants

## Conventions
- Use vanilla CSS — no Tailwind, SASS, or CSS-in-JS
- Global styles go in `src/styles/global.css`
- Component-scoped styles use `<style>` tags inside `.astro` files (automatically scoped)
- Use CSS custom properties for reusable values
- Mobile-first responsive design with `min-width` media queries

## Responsive Breakpoints
```css
@media (min-width: 768px) { }   /* Tablet */
@media (min-width: 1024px) { }  /* Desktop */
@media (min-width: 1280px) { }  /* Wide */
```

## Common Patterns
- `.container` — max-width centered content (`max-width: var(--container-max); margin-inline: auto; padding-inline: var(--space-lg)`)
- Grid layouts: `display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`
- Sections: `padding-block: clamp(4rem, 8vw, 8rem)` — never fixed px for vertical rhythm

---

## Anti-AI Layout Rules (CRITICAL)

These rules prevent designs from looking AI-generated.

### Tipografía — siempre aplicar
```css
/* H1: escala fluida + tracking negativo */
h1, .hero__title {
  font-size: clamp(2.2rem, 5vw, 4.5rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em; /* OBLIGATORIO en headings grandes */
}

/* H2: escala fluid */
h2, .section__title {
  font-size: clamp(1.6rem, 3vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

/* Body text: ch units para legibilidad */
p, .body-text {
  max-width: 65ch;
  line-height: 1.7;
}

/* Lead paragraph */
.hero__subtitle, .lead {
  font-size: clamp(1rem, 2vw, 1.15rem);
  line-height: 1.75;
  max-width: 52ch;
}
```

### Card hover — nunca solo color change
```css
.card {
  box-shadow:
    0 1px 3px rgba(0,0,0,0.06),
    0 1px 2px rgba(0,0,0,0.04);
  transform: translateY(0);
  transition:
    box-shadow 200ms ease,
    transform 200ms ease;
}
.card:hover {
  box-shadow:
    0 10px 25px rgba(0,0,0,0.1),
    0 4px 10px rgba(0,0,0,0.06);
  transform: translateY(-3px);
}
```

### Button feedback físico — obligatorio
```css
.btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px var(--color-primary-200);
}
.btn--primary:active {
  transform: translateY(0);
  box-shadow: none;
}
.btn--primary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}
```

### Secciones — variedad de backgrounds
```css
/* Evitar toda la web con fondo blanco plano */
.section--alt {
  background: var(--color-bg-alt); /* ~#f8f9fa — más orgánico que #fff */
}
.section--texture {
  background-color: var(--color-bg-alt);
  background-image:
    radial-gradient(circle at 30% 20%, var(--color-primary-50) 0%, transparent 50%);
}
```

### Reduced motion — siempre incluir
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## What NOT to do (Anti-patterns)

| ❌ Avoid | ✅ Do instead |
|---|---|
| `font-size: 40px` en headings | `font-size: clamp(2rem, 5vw, 4rem)` |
| `letter-spacing: normal` en H1 | `letter-spacing: -0.03em` |
| Hover: solo `background-color` | Hover: `transform` + `box-shadow` |
| `border-radius: 12px` en todo | Varía: sharp en CTAs, rounded en cards |
| Emojis como iconos (🔷🟢) | SVG inline de Heroicons/Lucide |
| `max-width: 800px` en párrafos | `max-width: 65ch` |
| `box-shadow: none` en cards | Sombra sutil idle, mayor en hover |
| `outline: none` en focus | `:focus-visible` visible siempre |
| `padding: 80px 0` fijo | `padding-block: clamp(4rem, 8vw, 8rem)` |
