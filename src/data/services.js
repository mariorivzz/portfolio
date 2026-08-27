// ─────────────────────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE LOS SERVICIOS
// Lo usan: la página /servicios, el resumen de la portada y el desplegable del
// formulario de contacto. Cambia un precio aquí y cambia en todos los sitios.
//
// Están en tres grupos porque se venden distinto:
//   plans       -> creación de la web, pago único
//   addons      -> extras que se suman a cualquier plan
//   maintenance -> cuota mensual, tres niveles
//
// ⚠️ NOTA INTERNA (no visible para el público) — revisar márgenes:
// Los planes con asistente (690 €, 990 € y el mantenimiento de 195 €/mes)
// generan coste por consumo de la API del modelo. El mensual es el delicado:
// el gasto es recurrente pero el ingreso está fijado. Monitorear en Groq
// Console → Projects → Portfolio → Usage; si el consumo se acerca al margen,
// subir precio o limitar mensajes.
//
// ⚠️ NOTA INTERNA — alcance: todo está pensado para ejecutarse en solitario
// apoyándose en herramientas ya existentes (IA, automatización, agenda).
// Nada de sistemas a medida ni de prometer plazos de equipo.
// ─────────────────────────────────────────────────────────────────────────────

// ── Iconos (trazo fino, mismo estilo que el resto de la web) ─────────────────
const ICON = {
  pagina: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="7" y1="14" x2="14" y2="14"/></svg>`,
  chat: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  edificio: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  edificioIa: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M8.5 12.5h7a1 1 0 011 1v3a1 1 0 01-1 1h-4l-2.5 2.2v-2.2h-.5a1 1 0 01-1-1v-3a1 1 0 011-1z"/></svg>`,
  enchufe: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`,
  rayo: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  compartir: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  escudo: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  calendario: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  grafico: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
};

// Frase que explica el asistente sin dejar la sigla "IA" suelta.
// Se repite a propósito en todos los planes que lo incluyen.
const EXPLICA_ASISTENTE =
  'Un ayudante virtual que responde a tus clientes las 24 horas, como una recepcionista siempre disponible';

const MONTADO_CON_HERRAMIENTAS =
  'Montado sobre herramientas ya existentes y probadas, no un desarrollo a medida';

// ── 1. Creación de la web — pago único ──────────────────────────────────────
export const plans = [
  {
    value: 'pagina-basica',
    label: 'Pago único',
    icon: ICON.pagina,
    title: 'Página Web Básica',
    tagline: 'Una sola página con todo lo importante, lista en pocos días',
    description:
      'La forma más rápida y económica de estar en internet. Una única página que cuenta quién eres, qué ofreces y cómo contactarte, con un botón directo a tu WhatsApp. Ideal si quieres empezar ya sin complicarte.',
    features: [
      'Una sola página: presentación, servicios y contacto',
      'Botón de WhatsApp para que te escriban en un toque',
      'Se ve perfecta en el móvil, que es por donde te van a mirar',
      'Entrega rápida, en pocos días',
      'Dominio (tu dirección en internet) y alojamiento configurados por mí',
    ],
    result: '→ Tu negocio en internet, esta misma semana.',
    price: 'Desde 450 €',
    cta: 'Quiero mi página',
    featured: false,
  },
  {
    value: 'pagina-ia',
    label: 'Pago único',
    icon: ICON.chat,
    title: 'Página Web con Asistente de IA',
    tagline: 'Tu página, más un ayudante que atiende a tus clientes solo',
    description:
      'Todo lo de la Landing Básica y, además, un ayudante virtual que responde al instante las dudas de siempre —horarios, precios, qué servicios ofreces—, como si tuvieras a alguien en recepción a cualquier hora del día.',
    features: [
      'Todo lo incluido en la Página Web Básica',
      EXPLICA_ASISTENTE,
      'Contesta las dudas más comunes: horarios, precios, servicios, cómo llegar',
      'Se prepara con la información real de tu negocio',
      MONTADO_CON_HERRAMIENTAS,
    ],
    result: '→ Nadie se queda sin respuesta, ni de madrugada.',
    price: 'Desde 690 €',
    cta: 'Quiero la página con asistente',
    featured: false,
  },
  {
    value: 'pagina-completa',
    label: 'Pago único',
    icon: ICON.edificio,
    title: 'Página Web Completa',
    tagline: 'Varias páginas para contar bien todo lo que ofreces',
    description:
      'Una web rápida, elegante y bien posicionada que genera confianza desde el primer segundo. Tus clientes te encuentran antes que a la competencia, ven que eres serio, y te llaman.',
    features: [
      'Varias páginas: inicio, servicios, sobre ti, contacto...',
      'Dominio y alojamiento gestionados por mí, tú no tocas nada',
      'Tu ficha en Google Maps, para que te encuentren en tu zona',
      'Formulario de contacto que te llega directo al correo',
      'Se carga en menos de 2 segundos (eso importa mucho a Google)',
    ],
    result: '→ Más credibilidad. Más llamadas.',
    price: 'Desde 750 €',
    cta: 'Quiero mi página',
    featured: false,
  },
  {
    value: 'pagina-completa-ia',
    label: 'Pago único',
    icon: ICON.edificioIa,
    title: 'Página Web Completa con Asistente de IA',
    tagline: 'Todo lo anterior más un ayudante que atiende y te avisa',
    description:
      'Tu web trabaja por ti incluso cuando duermes. El ayudante virtual resuelve las dudas de quien te visita y el sistema te avisa por correo y WhatsApp en cuanto alguien está de verdad interesado en contratarte.',
    features: [
      'Todo lo incluido en la Página Web Completa',
      EXPLICA_ASISTENTE,
      'Aviso automático por correo y WhatsApp cuando llega un cliente interesado',
      'Textos redactados por mí, pensados para vender',
      MONTADO_CON_HERRAMIENTAS,
    ],
    result: '→ Más contactos. Sin estar pendiente del teléfono.',
    price: 'Desde 990 €',
    cta: 'Lo quiero todo',
    featured: true,
  },
  {
    value: 'ia-existente',
    label: 'Sobre tu web',
    icon: ICON.enchufe,
    title: 'Añade IA a tu Web Actual',
    tagline: '¿Ya tienes web? Le conecto el ayudante sin tocar tu diseño',
    description:
      'No necesitas empezar de cero. Me conecto a la web que ya tienes e instalo el ayudante virtual y los avisos automáticos, sin cambiar tu diseño ni tus contenidos.',
    features: [
      'Se conecta a la web que ya tienes, esté hecha con lo que esté',
      EXPLICA_ASISTENTE,
      'Avisos automáticos por correo cuando alguien pregunta',
      'Sin tocar el diseño ni la estructura que ya tienes',
      MONTADO_CON_HERRAMIENTAS,
    ],
    result: '→ Tu web de siempre, pero trabajando sola.',
    price: 'Desde 400 €',
    cta: 'Añadir asistente a mi web',
    featured: false,
  },
];

// ── 2. Añadidos — se suman a cualquier plan, o van sueltos ──────────────────
export const addons = [
  {
    value: 'automatizaciones',
    label: 'Añadido',
    icon: ICON.rayo,
    title: 'Automatizaciones Sencillas',
    tagline: 'Que los recados repetitivos se hagan solos',
    description:
      'Pequeñas conexiones que te ahorran trabajo cada día: que una consulta del formulario te llegue al WhatsApp y que quede guardada y ordenada sin que hagas nada. Con herramientas de automatización ya existentes, así que es rápido de montar y fiable.',
    features: [
      'El formulario te avisa también por WhatsApp, no solo por correo',
      'Cada consulta se guarda sola en una hoja de cálculo',
      'Confirmación automática por correo a quien te escribe',
      'Se puede añadir a cualquier plan o contratarlo suelto',
    ],
    result: '→ Menos tareas repetitivas. Ningún cliente sin respuesta.',
    price: 'Desde 200 €',
    cta: 'Quiero automatizarlo',
    featured: false,
  },
  {
    value: 'redes',
    label: 'Añadido',
    icon: ICON.compartir,
    title: 'Redes Sociales Conectadas',
    tagline: 'Tus redes y tus reseñas, a la vista dentro de tu web',
    description:
      'Conecto con tu web lo que ya publicas: tu Instagram o Facebook se ve siempre al día, tus reseñas de Google quedan a la vista y se añaden botones para compartir. Es un trabajo técnico puntual: lo dejo conectado y funcionando, pero no llevo tus redes ni publico por ti.',
    features: [
      'Tu Instagram o Facebook, visible y al día dentro de la web',
      'Tus reseñas de Google, delante de quien te está mirando',
      'Botones para compartir tu web y tus servicios',
      'Es una conexión técnica puntual: no incluye llevar tus redes ni publicar contenido',
      'Se puede añadir a cualquier plan o contratarlo suelto',
    ],
    result: '→ Lo que ya publicas, trabajando también en tu web.',
    price: 'Desde 200 €',
    cta: 'Quiero conectar mis redes',
    featured: false,
  },
];

// ── 3. Mantenimiento mensual — tres niveles ─────────────────────────────────
export const maintenance = [
  {
    value: 'mant-esencial',
    label: 'Cuota mensual',
    icon: ICON.escudo,
    title: 'Mantenimiento Esencial',
    tagline: 'Tu web actualizada, respaldada y vigilada',
    description:
      'Me ocupo de que la web siga funcionando mes a mes: actualizaciones al día, copia de seguridad y vigilancia para que no se caiga. Los cambios de contenido no entran en este nivel; si necesitas alguno, te lo presupuesto aparte.',
    features: [
      'Actualizaciones al día',
      'Copia de seguridad periódica',
      'Vigilancia: si la web se cae, me entero yo antes que tú',
      'Los cambios de contenido se presupuestan aparte',
    ],
    result: '→ Tranquilidad al mínimo coste.',
    price: '45 € / mes',
    cta: 'Quiero el Esencial',
    featured: false,
  },
  {
    value: 'mant-estandar',
    label: 'Cuota mensual',
    icon: ICON.calendario,
    title: 'Mantenimiento Estándar',
    tagline: 'Lo anterior, más cambios de contenido cada mes',
    description:
      'Además de tener la web al día, cada mes tienes hasta una hora para los cambios que necesites: un precio, una foto, un horario, un texto nuevo. Me escribes y yo lo hago, sin que toques nada.',
    features: [
      'Todo lo incluido en el Esencial',
      'Hasta 1 hora al mes de cambios de contenido',
      'Precios, fotos, horarios y textos, sin que toques nada',
      'Respuesta en menos de 24 horas',
    ],
    result: '→ Tu web al día sin mover un dedo.',
    price: '95 € / mes',
    cta: 'Quiero el Estándar',
    featured: false,
  },
  {
    value: 'mant-ia',
    label: 'Cuota mensual',
    icon: ICON.grafico,
    title: 'Mantenimiento con IA',
    tagline: 'Lo anterior, con el ayudante virtual incluido',
    description:
      'El nivel completo: la web cuidada, el coste del ayudante virtual ya incluido en la cuota, el doble de horas para cambios y un informe cada mes que te cuenta en claro cuánta gente te visita y qué hace en tu web.',
    features: [
      'Todo lo incluido en el Estándar',
      'Coste del ayudante virtual incluido, sin sorpresas a fin de mes',
      'Hasta 2 horas al mes de cambios de contenido',
      'Informe mensual claro de visitas y resultados',
    ],
    result: '→ Todo cubierto, y tú a lo tuyo.',
    price: '195 € / mes',
    cta: 'Quiero el completo',
    featured: false,
  },
];

// Listado plano, para contar servicios y generar el formulario.
export const allServices = [...plans, ...addons, ...maintenance];

// Los 3 que se resumen en la portada: el más sencillo, el recomendado y el
// mantenimiento intermedio. El listado completo vive en /servicios.
export const teaserValues = ['pagina-basica', 'pagina-completa-ia', 'mant-estandar'];

// Opciones del desplegable del formulario, generadas a partir de los servicios
// para que los precios no puedan desincronizarse nunca.
export const contactOptions = [
  ...allServices.map((s) => ({ value: s.value, label: `${s.title} — ${s.price.toLowerCase()}` })),
  { value: 'renovar', label: 'Renovar o migrar mi web antigua — lo vemos juntos' },
  { value: 'otro', label: 'No lo tengo claro, quiero consejo' },
];
