// src/pages/api/chat.js
// POST /api/chat
// Body: { messages: [{role, content}] }
// Returns: { reply: string }
// Requires: Origin header (CORS validation)
//
// Uses Groq's OpenAI-compatible REST API via native fetch — no SDK, no CJS packages.
// Set GROQ_API_KEY in your .env file (get one free at console.groq.com).

import { createHash } from 'crypto';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const prerender = false;

// ── Groq API config ──────────────────────────────────────────────────────────
// ⚠️ NOTA INTERNA — margen: este endpoint es el que genera coste por consumo.
// Lo incluyen los planes de creación con asistente (690 € y 990 €, pago único)
// y, sobre todo, el "Mantenimiento con IA" de 195 €/mes, donde el gasto es
// recurrente pero el ingreso está fijado. Mirar /stats de vez en cuando: si el
// consumo de tokens + alojamiento se acerca al margen de esa cuota, hay que
// subir el precio o limitar el número de mensajes por visita.
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ⚠️ Groq RETIRA modelos cada pocos meses. Cuando eso pasa, su API responde
// 404 "model_not_found" y el asistente deja de contestar de un día para otro.
// (El anterior, llama-3.3-70b-versatile, se retiró y rompió el chat así.)
//
// Cuando vuelva a pasar NO hay que editar ni subir código. Mira qué modelos
// siguen vivos con tu clave:
//   curl -s https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"
// Descarta los whisper-* (voz a texto) y los *-guard-* (clasificadores de
// seguridad: no conversan), y pon el identificador nuevo en la variable de
// entorno GROQ_MODEL — en el .env de local y en Vercel → Settings →
// Environment Variables —. Redesplegar y listo.
//
// Se eligió el 120b y no el 20b tras compararlos: el pequeño se inventaba lo
// que incluye cada plan al dar precios. Mientras el asistente dé precios y
// condiciones al cliente, prioriza fiabilidad sobre velocidad al elegir.
const DEFAULT_MODEL = 'openai/gpt-oss-120b';

// `process.env` primero, para que Vercel pueda cambiarlo sin que el valor se
// quede incrustado en el bundle en tiempo de build; `import.meta.env` después,
// que es de donde `astro dev` lee el .env local.
const MODEL = process.env.GROQ_MODEL || import.meta.env.GROQ_MODEL || DEFAULT_MODEL;

const SYSTEM_PROMPT = `Eres el asistente virtual de Mario Rivas, un desarrollador web con más de 5 años de experiencia especializado en crear páginas web para negocios locales: peluquerías, restaurantes, clínicas dentales, tiendas y más.

Mario trabaja SOLO, sin equipo. Se apoya en herramientas de IA y de automatización que ya existen en el mercado en lugar de construir sistemas a medida: por eso puede dar precios ajustados y plazos cortos. Nunca prometas desarrollos complejos a medida, equipos de trabajo ni plazos que no dependan solo de él.

CREAR LA WEB (pago único):
- Página Web Básica: una sola página con presentación, servicios, contacto y botón de WhatsApp. Entrega rápida. Desde 450 €.
- Página Web con Asistente de IA: lo anterior más un ayudante virtual que responde las dudas más comunes a cualquier hora. Desde 690 €.
- Página Web Completa: varias páginas, dominio y alojamiento gestionados, ficha en Google Maps y formulario de contacto. Desde 750 €.
- Página Web Completa con Asistente de IA: lo anterior más el ayudante virtual y avisos automáticos por correo y WhatsApp cuando llega un cliente interesado. Desde 990 €. Es el plan más recomendado.
- Añadir IA a tu Web Actual: se conecta el ayudante y los avisos automáticos a una web que ya existe, sin cambiar su diseño. Desde 400 €.

AÑADIDOS (sobre cualquier plan, o sueltos):
- Automatizaciones Sencillas: que el formulario avise también por WhatsApp y que las consultas se guarden solas en una hoja de cálculo. Desde 200 €.
- Redes Sociales Conectadas: mostrar el Instagram o Facebook dentro de la web, enseñar las reseñas de Google y botones de compartir. Desde 200 €. IMPORTANTE: es una conexión técnica puntual; Mario NO lleva las redes del cliente ni publica contenido por él. Si preguntan por gestión de redes, dilo claramente.

MANTENIMIENTO MENSUAL (tres niveles, hay que distinguirlos bien):
- Mantenimiento Esencial, 45 €/mes: actualizaciones, copia de seguridad y vigilancia de que la web no se caiga. OJO: los cambios de contenido NO están incluidos, se presupuestan aparte.
- Mantenimiento Estándar, 95 €/mes: todo lo del Esencial más hasta 1 hora al mes de cambios de contenido (precios, fotos, horarios, textos).
- Mantenimiento con IA, 195 €/mes: todo lo del Estándar más el coste del ayudante virtual incluido, hasta 2 horas al mes de cambios e informe mensual de visitas y resultados.

RENOVAR O MIGRAR una web antigua NO tiene precio de catálogo: depende de cómo esté montada la web actual. Si preguntan por esto, no des cifras ni prometas que no se perderá nada; explícales que Mario lo mira primero gratis y sin compromiso, y que el presupuesto lo da después de revisar el caso. Invítales a contárselo por el formulario o WhatsApp.

Responde SIEMPRE en español. Sé conciso (máximo 3-4 frases), cálido y cercano.

MUY IMPORTANTE — quién te lee: la mayoría son dueños de pequeños negocios, muchos de ellos mayores y con poca confianza en la tecnología. Habla como se lo explicarías a un vecino:
- Nada de tecnicismos ni siglas sueltas. No digas "IA", "chatbot", "API", "SEO", "hosting", "framework" ni nombres de modelos.
- Si hace falta mencionar el asistente, llámalo "ayudante virtual" y explica el beneficio ("responde a tus clientes a cualquier hora, como tener a alguien siempre en recepción").
- En vez de "SEO" di "aparecer en Google cuando te buscan"; en vez de "hosting" di "el alojamiento de la web, que gestiono yo".
- Nunca hagas sentir tonto a nadie por no entender algo: reformula con calma y pon un ejemplo cotidiano.

Si alguien quiere un presupuesto o más información, invítale a usar el formulario de contacto o WhatsApp.
Si te preguntan algo completamente ajeno a Mario y sus servicios, redirige amablemente la conversación.`;

// ── Error response helper ────────────────────────────────────────────────────
function errorResponse(status, message, extraHeaders = {}) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

// ── Helper: Hash IP for rate limiting ──────────────────────────────────────
function hashIp(ip) {
  const salt = import.meta.env.IP_HASH_SALT;

  if (!ip) {
    // clientAddress should always be populated by Vercel, but if not:
    // Use a fixed shared key (not random) so all missing-IP requests
    // share the same rate limit bucket and hit the ceiling quickly
    if (!salt) {
      return 'no-ip:no-salt';
    }
    console.error('[/api/chat] clientAddress is empty (should not happen on Vercel)');
    return 'no-ip';
  }

  if (!salt) {
    console.error('[/api/chat] IP_HASH_SALT is not configured');
    return 'no-salt';
  }

  const input = `${ip}:${salt}`;
  return createHash('sha256').update(input).digest('hex');
}

// ── Rate limiting setup ──────────────────────────────────────────────────────
const RATE_LIMITS = {
  free: {
    requestsPerMinuteGlobal: 3,
    requestsPerDayGlobal: 35,
    requestsPerIpPerDay: 6,
  },
};

// Upstash Redis fallback: in-memory rate limiting if Redis is unavailable
class InMemoryRateLimiter {
  constructor(limit, window) {
    this.limit = limit;
    this.window = window; // in seconds
    this.buckets = new Map();
  }

  async limit(key) {
    const now = Date.now();
    const expiry = now + this.window * 1000;

    if (!this.buckets.has(key)) {
      this.buckets.set(key, { count: 1, expiry });
      return { success: true, limit: this.limit, remaining: this.limit - 1, reset: expiry };
    }

    const bucket = this.buckets.get(key);
    if (bucket.expiry < now) {
      bucket.count = 1;
      bucket.expiry = expiry;
      return { success: true, limit: this.limit, remaining: this.limit - 1, reset: expiry };
    }

    bucket.count += 1;
    if (bucket.count > this.limit) {
      return {
        success: false,
        limit: this.limit,
        remaining: 0,
        reset: bucket.expiry,
      };
    }

    return { success: true, limit: this.limit, remaining: this.limit - bucket.count, reset: bucket.expiry };
  }
}

// Initialize Upstash Redis or fallback to in-memory
let rateLimitGlobalMin, rateLimitGlobalDay, rateLimitIpDay;

const upstashUrl = import.meta.env.UPSTASH_REDIS_REST_URL;
const upstashToken = import.meta.env.UPSTASH_REDIS_REST_TOKEN;

if (!upstashUrl || !upstashToken) {
  console.error(
    '[/api/chat] 🚨 RATE LIMITING DEGRADADO — Upstash no configurado. Usando fallback en memoria (cada instancia serverless tiene su propio contador, sin persistencia entre solicitudes). Configura UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN en Vercel inmediatamente.'
  );
  rateLimitGlobalMin = new InMemoryRateLimiter(RATE_LIMITS.free.requestsPerMinuteGlobal, 60);
  rateLimitGlobalDay = new InMemoryRateLimiter(RATE_LIMITS.free.requestsPerDayGlobal, 86400);
  rateLimitIpDay = new InMemoryRateLimiter(RATE_LIMITS.free.requestsPerIpPerDay, 86400);
} else {
  const redis = new Redis({
    url: upstashUrl,
    token: upstashToken,
  });

  rateLimitGlobalMin = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.free.requestsPerMinuteGlobal, '60 s'),
    prefix: 'rl:portfolio:global:min',
    analytics: false,
  });

  rateLimitGlobalDay = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.free.requestsPerDayGlobal, '24 h'),
    prefix: 'rl:portfolio:global:day',
    analytics: false,
  });

  rateLimitIpDay = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.free.requestsPerIpPerDay, '24 h'),
    prefix: 'rl:portfolio:ip:day',
    analytics: false,
  });
}

// ── Request handler ──────────────────────────────────────────────────────────
export async function POST({ request, clientAddress }) {
  // Validate Content-Type
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return errorResponse(415, 'Content-Type debe ser application/json');
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'JSON inválido');
  }

  // Validate Origin header (reject missing or invalid)
  const origin = request.headers.get('origin')?.toLowerCase();
  if (!origin) {
    console.warn('[/api/chat] Missing Origin header — rejecting');
    return errorResponse(403, 'No autorizado');
  }

  // Whitelist of allowed origins
  const allowedOrigins = [
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/,
    /^https:\/\/mariorivashernandez\.com$/,
    /^https:\/\/www\.mariorivashernandez\.com$/,
  ];

  // Check preview deployments (Vercel)
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    allowedOrigins.push(
      new RegExp(`^https:\\/\\/${process.env.VERCEL_URL.replace(/\./g, '\\.')}$`)
    );
  }

  const isOriginAllowed = allowedOrigins.some((pattern) => pattern.test(origin));
  if (!isOriginAllowed) {
    console.warn(`[/api/chat] Invalid Origin: ${origin} — rejecting`);
    return errorResponse(403, 'No autorizado');
  }

  // Hash IP AFTER Origin validation (don't hash traffic we'll reject)
  const hashedIp = hashIp(clientAddress);

  // ── Rate limiting check ──────────────────────────────────────────────────
  try {
    // Check per-IP per-day limit FIRST (fail early on abusers)
    const ipDayResponse = await rateLimitIpDay.limit(hashedIp);
    if (!ipDayResponse.success) {
      const secondsLeft = Math.ceil((ipDayResponse.reset - Date.now()) / 1000);
      return errorResponse(429, 'Has alcanzado tu límite diario. Vuelve mañana.', {
        'Retry-After': String(Math.max(1, secondsLeft)),
      });
    }

    // Check global per-minute limit
    const globalMinResponse = await rateLimitGlobalMin.limit('global');
    if (!globalMinResponse.success) {
      return errorResponse(429, 'Demasiadas peticiones. Intenta de nuevo en 60 segundos.', {
        'Retry-After': '60',
      });
    }

    // Check global per-day limit
    const globalDayResponse = await rateLimitGlobalDay.limit('global');
    if (!globalDayResponse.success) {
      const secondsLeft = Math.ceil((globalDayResponse.reset - Date.now()) / 1000);
      return errorResponse(429, 'Límite diario alcanzado. Vuelve mañana.', {
        'Retry-After': String(Math.max(1, secondsLeft)),
      });
    }
  } catch (err) {
    // Distinguish between quota exhausted (HTTP 429) and network errors
    const statusCode = err?.status || err?.statusCode;
    const isQuotaError = statusCode === 429;

    if (isQuotaError) {
      // Upstash quota exhausted: fail closed (block request)
      console.error('[/api/chat] Rate limiting quota exhausted:', err?.message);
      return errorResponse(503, 'El servicio no está disponible. Intenta más tarde.');
    } else {
      // Network/connection error: fail open (allow request)
      console.warn('[/api/chat] Rate limiting unavailable (network error), allowing request:', err?.message);
      // Continue without rate limiting
    }
  }

  // Guard: API key must be configured
  const apiKey = import.meta.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('[/api/chat] GROQ_API_KEY is not set — returning 503');
    return errorResponse(503, 'Asistente no configurado. Contacta a Mario.');
  }

  // Sanitise history — keep last 5 turns, cap content to 600 chars, whitelist roles
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const validRoles = ['user', 'assistant'];
  const safeMessages = messages
    .slice(-5)
    .filter((m) => m && validRoles.includes(m.role) && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 600) }));

  // ── Call Groq API ────────────────────────────────────────────────────────
  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...safeMessages],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[/api/chat] Groq error (${res.status}):`, errText);

      // Map Groq errors to client-safe status codes
      if (res.status === 429) {
        const retryAfter = res.headers.get('retry-after');
        const headers = retryAfter ? { 'Retry-After': retryAfter } : {};
        return errorResponse(429, 'Demasiadas peticiones. Intenta de nuevo más tarde.', headers);
      }
      if (res.status >= 500) {
        return errorResponse(502, 'Error al obtener respuesta. Intenta de nuevo.');
      }
      if (res.status === 401 || res.status === 403) {
        return errorResponse(503, 'Asistente no configurado. Contacta a Mario.');
      }
      if (res.status === 400) {
        console.log('[/api/chat] 400 error body:', errText);
        if (errText.includes('blocked_api_access')) {
          console.error('[/api/chat] SPENDING LIMIT EXCEEDED or API access blocked');
          return errorResponse(503, 'El servicio no está disponible. Intenta más tarde.');
        }
        return errorResponse(400, 'Solicitud inválida. Intenta de nuevo.');
      }
      if (res.status >= 400) {
        return errorResponse(400, 'Solicitud inválida. Intenta de nuevo.');
      }
      return errorResponse(502, 'Error al obtener respuesta. Intenta de nuevo.');
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? '';
    const usage = data.usage ?? {};

    // Log token usage server-side for monitoring (no exposure to client)
    console.log(
      '[/api/chat] Tokens consumed — input: ' +
        (usage.prompt_tokens ?? 0) +
        ', output: ' +
        (usage.completion_tokens ?? 0)
    );

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[/api/chat] Network error:', err?.message ?? err);
    return errorResponse(502, 'Error al obtener respuesta. Intenta de nuevo.');
  }
}
