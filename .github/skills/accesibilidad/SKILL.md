---
name: accesibilidad
description: "Use when: building forms, navigation, interactive components, or reviewing any page for accessibility compliance. Covers WCAG AA, keyboard navigation, screen readers, and focus management."
argument-hint: "Describe what to make accessible (e.g., 'form de citas', 'navigation menu', 'review full page')"
---

# Skill: Accesibilidad (WCAG AA)

## Nivel objetivo: WCAG 2.1 AA

---

## 1. HTML semántico (base imprescindible)

```html
<!-- Estructura de página -->
<header role="banner">
  <nav aria-label="Navegación principal">
    <ul>
      <li><a href="/">Inicio</a></li>
    </ul>
  </nav>
</header>

<main id="main-content">  <!-- id para skip link -->
  <article> o <section aria-labelledby="section-title">
</main>

<footer role="contentinfo">
```

### Skip link (obligatorio)

```astro
<!-- Primer elemento del body en Layout.astro -->
<a href="#main-content" class="skip-link">Saltar al contenido principal</a>

<style>
  .skip-link {
    position: absolute;
    top: -100%;
    left: var(--space-md);
    background: var(--color-primary);
    color: #fff;
    padding: var(--space-sm) var(--space-md);
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    text-decoration: none;
    font-weight: 600;
    z-index: 9999;
    transition: top 0.2s;
  }
  .skip-link:focus {
    top: 0;
  }
</style>
```

---

## 2. Contraste mínimo (WCAG)

| Tipo de texto | Ratio mínimo | Recomendado |
|---|---|---|
| Texto normal (< 18px) | 4.5:1 | 7:1 |
| Texto grande (≥ 18px bold o ≥ 24px) | 3:1 | 4.5:1 |
| Iconos/controles UI | 3:1 | — |

### Verificar contraste en CSS

```css
:root {
  /* Pares verificados WCAG AA */
  --color-text: #1a1a2e;          /* sobre #fff: 16.5:1 ✓ */
  --color-text-secondary: #555e68; /* sobre #fff: 6.3:1 ✓ */
  --color-text-tertiary: #8a919a;  /* sobre #fff: 3.9:1 — solo para texto >18px */

  /* Verificar tu --color-primary con https://webaim.org/resources/contrastchecker/ */
}
```

---

## 3. Formularios accesibles

```astro
<form id="form-citas" aria-label="Formulario de reserva de cita" novalidate>

  <!-- Campo con label explícito y manejo de error -->
  <div class="form__field">
    <label for="nombre" id="nombre-label">
      Nombre completo
      <span aria-hidden="true" class="required-mark">*</span>
    </label>
    <input
      type="text"
      id="nombre"
      name="nombre"
      required
      autocomplete="name"
      aria-required="true"
      aria-describedby="nombre-hint nombre-error"
      aria-invalid="false"   <!-- cambiar a "true" cuando hay error -->
    />
    <span id="nombre-hint" class="form__hint">Tal como aparece en tu DNI</span>
    <span id="nombre-error" class="form__error" role="alert" aria-live="polite">
      <!-- Error dinámico: vacío hasta que hay error -->
    </span>
  </div>

  <!-- Select accesible -->
  <div class="form__field">
    <label for="servicio">Tipo de consulta</label>
    <select id="servicio" name="servicio" aria-required="true">
      <option value="" disabled selected>Selecciona un servicio</option>
      <option value="individual">Terapia individual</option>
      <option value="pareja">Terapia de pareja</option>
    </select>
  </div>

  <!-- Textarea -->
  <div class="form__field">
    <label for="mensaje">
      Mensaje
      <span class="form__optional">(opcional)</span>
    </label>
    <textarea
      id="mensaje"
      name="mensaje"
      rows="4"
      maxlength="500"
      aria-describedby="mensaje-count"
    ></textarea>
    <span id="mensaje-count" class="form__hint" aria-live="polite">
      0 / 500 caracteres
    </span>
  </div>

  <button type="submit" aria-describedby="submit-hint">
    Solicitar cita
  </button>
  <p id="submit-hint" class="form__hint">
    Recibirás confirmación por email en 24h
  </p>
</form>
```

### Validación con feedback accesible

```javascript
// En el script del formulario
const form = document.getElementById('form-citas');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errors = validateForm(form);

  if (errors.length > 0) {
    // Anunciar resumen de errores a lectores de pantalla
    const errorSummary = document.getElementById('error-summary');
    errorSummary.textContent = `${errors.length} errores encontrados. Por favor, corrígelos.`;
    errorSummary.focus(); // mover foco al resumen

    // Marcar campos con error
    errors.forEach(({ field, message }) => {
      const input = document.getElementById(field);
      const errorEl = document.getElementById(`${field}-error`);
      if (input) input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = message;
    });
    return;
  }
  // ... enviar
});
```

---

## 4. Navegación por teclado

```css
/* Focus visible SIEMPRE — nunca outline: none sin alternativa */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
  border-radius: 3px;
}

/* Eliminar outline feo solo para mouse, mantener para teclado */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Menú mobile accesible

```astro
<button
  id="hamburger"
  class="header__hamburger"
  aria-label="Abrir menú de navegación"
  aria-expanded="false"
  aria-controls="nav-menu"
>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
</button>

<nav id="nav-menu" aria-label="Navegación principal">
  <!-- ... -->
</nav>
```

```javascript
hamburger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
  hamburger.setAttribute('aria-label',
    isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
  );

  // Trampa de foco cuando el menú está abierto (mobile)
  if (isOpen) {
    const firstLink = nav.querySelector('a');
    firstLink?.focus();
  }
});
```

---

## 5. Imágenes accesibles

```astro
<!-- Imagen informativa: alt descriptivo y específico -->
<img src="/foto-consulta.jpg"
     alt="Sala de consulta con sillones cómodos y luz natural"
     width="800" height="600" />

<!-- Imagen decorativa: alt vacío (no null) -->
<img src="/fondo-decorativo.svg" alt="" role="presentation" />

<!-- Icono con texto: el SVG es decorativo, el texto da el significado -->
<a href="/citas">
  <svg aria-hidden="true" focusable="false">...</svg>
  Reservar cita
</a>

<!-- Icono sin texto: necesita aria-label -->
<button aria-label="Abrir menú">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

---

## 6. Reduced motion

```css
/* Respetar preferencia del sistema */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Para animaciones de reveal (IntersectionObserver) */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.reveal.is-visible {
  opacity: 1;
  transform: none;
}

/* Override para reduced motion */
@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

---

## 7. ARIA landmarks y roles clave

```html
<!-- Estructura completa con landmarks -->
<body>
  <a href="#main-content" class="skip-link">Saltar al contenido</a>

  <header role="banner">
    <nav aria-label="Navegación principal" role="navigation">...</nav>
  </header>

  <main id="main-content" role="main">
    <!-- Breadcrumb si aplica -->
    <nav aria-label="Ruta de navegación" aria-current="page">
      <ol>
        <li><a href="/">Inicio</a></li>
        <li aria-current="page">Servicios</li>
      </ol>
    </nav>

    <!-- Secciones con headings propios -->
    <section aria-labelledby="servicios-title">
      <h2 id="servicios-title">Nuestros servicios</h2>
      ...
    </section>
  </main>

  <aside aria-label="Información de contacto rápido">...</aside>

  <footer role="contentinfo">...</footer>
</body>
```

---

## Checklist de accesibilidad

### Estructura
- [ ] Skip link como primer elemento del body
- [ ] Un único `<h1>` por página
- [ ] Jerarquía de headings lógica (no saltar de H1 a H3)
- [ ] Landmarks HTML5 correctos: `<header>`, `<nav>`, `<main>`, `<footer>`
- [ ] `lang="es"` en `<html>`

### Formularios
- [ ] Todos los `<input>` tienen `<label>` asociado con `for/id`
- [ ] Los campos requeridos tienen `aria-required="true"` y marca visual
- [ ] Los errores usan `aria-invalid`, `aria-describedby` y `role="alert"`
- [ ] Autocompletado configurado (`autocomplete="name"`, `"email"`, etc.)

### Interactividad
- [ ] `:focus-visible` visible en todos los elementos interactivos
- [ ] `aria-expanded` en toggles (menú, acordeón, dropdown)
- [ ] `aria-label` en botones icon-only
- [ ] `aria-hidden="true"` en iconos decorativos
- [ ] Trampa de foco en modales/menús overlay

### Imágenes y media
- [ ] Alt text descriptivo en imágenes de contenido
- [ ] `alt=""` en imágenes decorativas
- [ ] Vídeos con subtítulos si aplica

### Color y contraste
- [ ] Contraste de texto normal ≥ 4.5:1
- [ ] Contraste de texto grande ≥ 3:1
- [ ] La información no se transmite solo por color
- [ ] `prefers-reduced-motion` respetado
