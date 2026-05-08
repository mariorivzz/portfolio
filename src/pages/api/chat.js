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
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL        = 'llama-3.3-70b-versatile'; // fast, high quality, generous free tier

const SYSTEM_PROMPT = `Eres el asistente de IA de Mario Rivas, un desarrollador web experto especializado en crear páginas web de alto impacto para negocios locales: peluquerías, restaurantes, clínicas dentales, tiendas y más.

Mario tiene más de 8 años de experiencia en PHP, JavaScript y MySQL. Sus servicios son:
- Presencia Profesional: página web básica y profesional desde 497 €. Ideal para estar en internet.
- Página que Vende: solución llave en mano diseñada para captar clientes, desde 997 €.
- Socio Digital Total: mantenimiento, actualización y marketing digital mensual desde 197 €/mes.

Responde SIEMPRE en español. Sé conciso (máximo 3-4 frases), cálido y profesional.
Si alguien quiere un presupuesto o más info, invítales a usar el formulario de contacto o WhatsApp.
Si te preguntan algo completamente ajeno a Mario y sus servicios web, redirige amablemente la conversación.`;

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
