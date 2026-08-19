// ─────────────────────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE LOS PLANES
// Lo usan: la página /servicios, el resumen de la portada y el desplegable del
// formulario de contacto. Cambia un precio aquí y cambia en todos los sitios.
//
// ⚠️ NOTA INTERNA (no visible para el público) — revisar márgenes:
// Los planes "Web con Asistente de IA" (997 €) y "Mantenimiento Mensual"
// (197 €/mes) incluyen asistente. Antes de cerrar cada venta, comprobar que el
// coste mensual real (consumo de API del modelo + alojamiento + dominio) no se
// coma el margen, sobre todo en el plan mensual, donde el gasto es recurrente
// pero el ingreso está fijado. Revisar consumo en /stats.
//
// ⚠️ NOTA INTERNA — alcance: todos los planes están pensados para ejecutarse
// en solitario apoyándose en herramientas ya existentes (IA, automatización,
// agenda). Nada de sistemas a medida ni de prometer plazos de equipo.
// ─────────────────────────────────────────────────────────────────────────────

export const services = [
  {
    label: 'Landing',
    value: 'landing',
    icon: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="7" y1="14" x2="14" y2="14"/></svg>`,
    title: 'Landing Page',
    tagline: 'Una sola página con todo lo importante, lista en pocos días',
    description:
      'La forma más rápida y económica de estar en internet. Una única página que cuenta quién eres, qué ofreces y cómo contactarte, con un botón directo a tu WhatsApp. Ideal si quieres empezar ya sin complicarte.',
    features: [
      'Una sola página: presentación, servicios y contacto',
      'Botón de WhatsApp para que te escriban en un toque',
      'Se ve perfecta en el móvil, que es por donde te van a mirar',
      'Entrega rápida, en pocos días',
      'Dominio y alojamiento configurados por mí',
    ],
    result: '→ Tu negocio en internet, esta misma semana.',
    price: 'Desde 450 €',
    cta: 'Quiero mi landing',
    featured: false,
  },
  {
    label: 'Corporativa',
    value: 'corporativa',
    icon: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    title: 'Web Corporativa',
    tagline: 'Varias páginas para contar bien todo lo que ofreces',
    description:
      'Una web rápida, elegante y bien posicionada que genera confianza desde el primer segundo. Tus clientes te encuentran antes que a la competencia, ven que eres serio, y te llaman.',
    features: [
      'Varias páginas: inicio, servicios, sobre ti, contacto...',
      'Dominio y alojamiento gestionados por mí, tú no tocas nada',
      'Tu ficha en Google Maps, para que te encuentren en tu zona',
      'Formulario de contacto que te llega directo al correo',
      'Carga en menos de 2 segundos, y eso ayuda a salir en Google',
    ],
    result: '→ Más credibilidad. Más llamadas.',
    price: 'Desde 750 €',
    cta: 'Quiero mi web',
    featured: false,
  },
  {
    label: 'Con asistente',
    value: 'ia',
    icon: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
    title: 'Web con Asistente de IA',
    tagline: 'Todo lo anterior más un ayudante que atiende a tus clientes solo',
    description:
      'Tu web trabaja por ti incluso cuando duermes. Un ayudante virtual responde al instante las dudas más habituales de quien te visita —horarios, precios, qué servicios ofreces—, como tener a alguien siempre en recepción, y te avisa cuando alguien está de verdad interesado.',
    features: [
      'Todo lo incluido en la Web Corporativa',
      'Un ayudante virtual que responde a tus clientes las 24 horas, como una recepcionista siempre disponible',
      'Contesta las dudas más comunes: horarios, precios, servicios, cómo llegar',
      'Te avisa por correo y WhatsApp cuando hay un cliente interesado',
      'Montado sobre herramientas de IA ya existentes y probadas, no un desarrollo a medida',
    ],
    result: '→ Más contactos. Sin estar pendiente del teléfono.',
    price: 'Desde 997 €',
    cta: 'Lo quiero todo incluido',
    featured: true,
  },
  {
    label: 'Sobre tu web',
    value: 'ia-existente',
    icon: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`,
    title: 'Añade IA a tu Web Actual',
    tagline: '¿Ya tienes web? Le conecto el ayudante sin tocar tu diseño',
    description:
      'No necesitas empezar de cero. Me conecto a la web que ya tienes e instalo el ayudante virtual, los avisos automáticos y el botón de WhatsApp, sin cambiar tu diseño ni tus contenidos.',
    features: [
      'Se conecta a la web que ya tienes, esté hecha con lo que esté',
      'Un ayudante virtual que aprende cómo es tu negocio y contesta por ti a cualquier hora',
      'Avisos automáticos por correo cuando alguien pregunta',
      'Botón de WhatsApp con el mensaje ya escrito',
      'Sin tocar el diseño ni la estructura que ya tienes',
    ],
    result: '→ Tu web de siempre, pero trabajando sola.',
    price: 'Desde 400 €',
    cta: 'Mejorar mi web actual',
    featured: false,
  },
  {
    label: 'Añadido',
    value: 'automatizaciones',
    icon: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    title: 'Automatizaciones Sencillas',
    tagline: 'Que los recados repetitivos se hagan solos',
    description:
      'Pequeñas conexiones que te ahorran trabajo cada día: que una consulta del formulario te llegue al WhatsApp, que quede guardada y ordenada sin que hagas nada, y que quien te escribe reciba respuesta al momento. Todo con herramientas de automatización ya existentes, así que es rápido de montar y fiable.',
    features: [
      'El formulario te avisa también por WhatsApp, no solo por correo',
      'Cada consulta se guarda sola en una hoja de cálculo',
      'Confirmación automática por correo a quien te escribe',
      'Montado con herramientas de automatización ya existentes',
      'Se puede añadir a cualquier plan o contratarlo suelto',
    ],
    result: '→ Menos tareas repetitivas. Ningún cliente sin respuesta.',
    price: 'Desde 200 €',
    cta: 'Quiero automatizarlo',
    featured: false,
  },
  {
    label: 'Añadido',
    value: 'redes',
    icon: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
    title: 'Redes Sociales Conectadas',
    tagline: 'Tus redes y tus reseñas, a la vista dentro de tu web',
    description:
      'Conecto con tu web lo que ya publicas: tu Instagram o Facebook se ve siempre al día, tus reseñas de Google quedan a la vista y se añaden botones para compartir y para escribirte por WhatsApp. Es un trabajo técnico puntual: lo dejo conectado y funcionando, pero no llevo tus redes ni publico por ti.',
    features: [
      'Tu Instagram o Facebook, visible y al día dentro de la web',
      'Tus reseñas de Google, delante de quien te está mirando',
      'Botones para compartir tu web y tus servicios',
      'Botón de WhatsApp Business con el mensaje ya escrito',
      'Es una conexión técnica puntual: no incluye llevar tus redes ni publicar contenido',
    ],
    result: '→ Lo que ya publicas, trabajando también en tu web.',
    price: 'Desde 200 €',
    cta: 'Quiero conectar mis redes',
    featured: false,
  },
  {
    label: 'Mensual',
    value: 'mantenimiento',
    icon: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    title: 'Mantenimiento Mensual',
    tagline: 'Tu web siempre al día sin que tengas que pensar en ella',
    description:
      'Yo me ocupo de que todo siga funcionando: las actualizaciones, los cambios pequeños que me pidas (un precio, una foto, un horario) y estar pendiente de que la web no se caiga. Si quieres que tus clientes reserven cita, te conecto una agenda ya existente a la web.',
    features: [
      'Actualizaciones y copias de seguridad al día',
      'Cambios pequeños de contenido: precios, fotos, horarios, textos',
      'Vigilo que tu web esté siempre en pie y cargando rápido',
      'Agenda de citas opcional, conectando una herramienta ya existente (tipo Cal.com)',
      'Informe mensual claro de visitas y resultados',
    ],
    result: '→ Tu web cuidada. Tú a lo tuyo.',
    price: 'Desde 197 € / mes',
    cta: 'Quiero despreocuparme',
    featured: false,
  },
];

// Los 3 planes que se resumen en la portada: el más sencillo, el recomendado
// y el mensual. El listado completo vive en /servicios.
export const teaserValues = ['landing', 'ia', 'mantenimiento'];

// Opciones del desplegable del formulario, generadas a partir de los planes
// para que los precios no puedan desincronizarse nunca.
export const contactOptions = [
  ...services.map(s => ({ value: s.value, label: `${s.title} — ${s.price.toLowerCase()}` })),
  { value: 'renovar', label: 'Renovar mi web antigua — lo vemos juntos' },
  { value: 'otro',    label: 'No lo tengo claro, quiero consejo' },
];
