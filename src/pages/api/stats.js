// src/pages/api/stats.js
// GET /api/stats — returns accumulated token usage since last server start
export const prerender = false;

export async function GET() {
  const s = globalThis.__chatStats ?? {
    inputTokens: 0, outputTokens: 0, requests: 0, startTime: Date.now(),
  };

  // gpt-4o-mini pricing as of 2024 (USD per 1M tokens)
  const INPUT_PRICE_PER_M  = 0.15;
  const OUTPUT_PRICE_PER_M = 0.60;

  const inputCost  = (s.inputTokens  / 1_000_000) * INPUT_PRICE_PER_M;
  const outputCost = (s.outputTokens / 1_000_000) * OUTPUT_PRICE_PER_M;

  return new Response(
    JSON.stringify({
      inputTokens:  s.inputTokens,
      outputTokens: s.outputTokens,
      totalTokens:  s.inputTokens + s.outputTokens,
      requests:     s.requests,
      estimatedCostUSD: parseFloat((inputCost + outputCost).toFixed(6)),
      model:        'gpt-4o-mini',
      uptimeSince:  new Date(s.startTime).toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}
