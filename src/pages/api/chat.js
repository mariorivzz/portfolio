// src/pages/api/chat.js
// POST /api/chat
// Body: { messages: [{role, content}] }
// Returns: { reply: string, usage: { prompt_tokens, completion_tokens, total_tokens } }
//
// Uses Groq's OpenAI-compatible REST API via native fetch — no SDK, no CJS packages.
// Set GROQ_API_KEY in your .env file (get one free at console.groq.com).

export const prerender = false;

// ── In-memory token stats (survives across requests, resets on server restart) ─
if (!globalThis.__chatStats) {
  globalThis.__chatStats = {
    inputTokens:  0,
    outputTokens: 0,
    requests:     0,
    startTime:    Date.now(),
  };
}

// ── Groq API config ──────────────────────────────────────────────────────────
// ⚠️ NOTA INTERNA — margen: este endpoint es el que genera coste por consumo.
// Los planes con asistente (997 € y, sobre todo, 197 €/mes) lo incluyen, así que
// conviene mirar /stats de vez en cuando: si el gasto mensual de tokens +
// alojamiento se acerca al margen del plan mensual, hay que subir el precio o
// limitar el número de mensajes por visita.
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL        = 'llama-3.3-70b-versatile'; // fast, high quality, generous free tier

const SYSTEM_PROMPT = `Eres el asistente virtual de Mario Rivas, un desarrollador web con más de 8 años de experiencia especializado en crear páginas web para negocios locales: peluquerías, restaurantes, clínicas dentales, tiendas y más.

Sus servicios y precios actuales son:
- Web Corporativa Esencial: web rápida, cuidada y bien posicionada, desde 690 €.
- Nueva Web con Asistente Virtual: todo lo anterior más un ayudante que atiende a los clientes a cualquier hora y avisa a Mario cuando alguien quiere contratar, desde 997 €.
- Mejora tu Web Actual con Asistente Virtual: se añade el ayudante, los avisos por correo y el botón de WhatsApp a una web que ya existe, desde 390 €.
- Sistema Digital Completo (Reservas): web, ayudante virtual, agenda de citas automática y mantenimiento mensual, desde 197 €/mes.
- Migración y Renovación Premium: renovación total de una web antigua sin perder datos, correos ni posición en Google, desde 790 €.

Responde SIEMPRE en español. Sé conciso (máximo 3-4 frases), cálido y cercano.

MUY IMPORTANTE — quién te lee: la mayoría son dueños de pequeños negocios, muchos de ellos mayores y con poca confianza en la tecnología. Habla como se lo explicarías a un vecino:
- Nada de tecnicismos ni siglas sueltas. No digas "IA", "chatbot", "API", "SEO", "hosting", "framework" ni nombres de modelos.
- Si hace falta mencionar el asistente, llámalo "ayudante virtual" y explica el beneficio ("responde a tus clientes a cualquier hora, como tener a alguien siempre en recepción").
- En vez de "SEO" di "aparecer en Google cuando te buscan"; en vez de "hosting" di "el alojamiento de la web, que gestiono yo".
- Nunca hagas sentir tonto a nadie por no entender algo: reformula con calma y pon un ejemplo cotidiano.

Si alguien quiere un presupuesto o más información, invítale a usar el formulario de contacto o WhatsApp.
Si te preguntan algo completamente ajeno a Mario y sus servicios, redirige amablemente la conversación.`;

// ── Request handler ──────────────────────────────────────────────────────────
export async function POST({ request }) {
  // Validate Content-Type
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return new Response(
      JSON.stringify({ error: 'Content-Type must be application/json' }),
      { status: 415, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Guard: API key must be configured
  const apiKey = import.meta.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('[/api/chat] GROQ_API_KEY is not set — returning 503');
    return new Response(
      JSON.stringify({ error: 'AI assistant is not configured. Please contact Mario directly.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Sanitise history — keep last 10 turns, cap content length
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const safeMessages = messages
    .slice(-10)
    .filter(m => m && typeof m.role === 'string' && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

  // ── Call Groq API ────────────────────────────────────────────────────────
  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       MODEL,
        messages:    [{ role: 'system', content: SYSTEM_PROMPT }, ...safeMessages],
        max_tokens:  300,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[/api/chat] Groq error ${res.status}:`, errText);
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response. Please try again.' }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data  = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? '';
    const usage = data.usage ?? {};

    // Update in-memory stats (consumed by /api/stats dashboard)
    globalThis.__chatStats.inputTokens  += usage.prompt_tokens     ?? 0;
    globalThis.__chatStats.outputTokens += usage.completion_tokens ?? 0;
    globalThis.__chatStats.requests     += 1;

    return new Response(
      JSON.stringify({
        reply,
        usage: {
          prompt_tokens:     usage.prompt_tokens     ?? 0,
          completion_tokens: usage.completion_tokens ?? 0,
          total_tokens:      usage.total_tokens      ?? 0,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[/api/chat] Network error:', err?.message ?? err);
    return new Response(
      JSON.stringify({ error: 'Failed to get AI response. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
