---
name: añadir-chat
description: "Use when: adding a chat widget or AI assistant to a website. Covers the ChatWidget component, API endpoint, and OpenAI/Groq integration for business-specific chatbots."
argument-hint: "Describe the chat feature (e.g., 'add chat widget to psicologo-martinez', 'customize chatbot personality')"
---

# Skill: Añadir chat widget con IA a una web

## Procedimiento

### 1. Crear el componente ChatWidget
Copiar desde `apps/veterinarios/veterinario-sedano/src/components/ChatWidget.astro` o crear uno nuevo.

El ChatWidget es un componente autocontenido que incluye:
- Botón flotante (esquina inferior derecha)
- Ventana de chat con historial
- Indicador de escritura
- Envío de mensajes al API endpoint

### 2. Crear el API endpoint
Crear `src/pages/api/chat.ts`:

```ts
import type { APIRoute } from 'astro';

export const prerender = false;

const SYSTEM_PROMPT = `Eres el asistente virtual de [NOMBRE DEL NEGOCIO].
Tu personalidad es amable, profesional y útil.

Información del negocio:
- Nombre: [NOMBRE]
- Servicios: [LISTA DE SERVICIOS]
- Horario: [HORARIO]
- Dirección: [DIRECCIÓN]
- Teléfono: [TELÉFONO]

Reglas:
- Responde SIEMPRE en español
- Sé conciso (máximo 2-3 frases por respuesta)
- Si no sabes algo, sugiere llamar por teléfono
- Puedes ayudar a reservar citas dirigiendo a /citas
- No inventes información sobre servicios o precios`;

export const POST: APIRoute = async ({ request }) => {
  const { messages } = await request.json();

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'Formato inválido' }), {
      status: 400,
    });
  }

  // Limitar historial para no exceder tokens
  const recentMessages = messages.slice(-10);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...recentMessages,
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'Error del servicio de IA' }), {
      status: 502,
    });
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content ?? 'Lo siento, no pude responder.';

  return new Response(JSON.stringify({ reply }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### 3. Añadir al Layout
En `src/layouts/Layout.astro`:
```astro
---
import ChatWidget from '../components/ChatWidget.astro';
---
<!-- antes de </body> -->
<ChatWidget />
```

### 4. Variables de entorno
Añadir la API key del proveedor de IA:
```
GROQ_API_KEY=gsk_...
```

**Nota**: Esta variable NO lleva prefijo `PUBLIC_` porque solo se usa en el servidor.

### 5. Personalización del chatbot
El `SYSTEM_PROMPT` define la personalidad y conocimiento del bot. Adaptar:

| Tipo negocio | Tono | Ejemplo de prompt |
|-------------|------|-------------------|
| Veterinaria | Cálido, empático | "Eres el asistente de VetCare. Amas a los animales..." |
| Psicología | Profesional, sereno | "Eres el asistente de la consulta. Mantén tono respetuoso..." |
| Dentista | Cercano, tranquilizador | "Eres el asistente de la clínica dental. Tranquiliza..." |

### 6. Verificar
- [ ] Bot responde en español
- [ ] Respuestas son relevantes al negocio
- [ ] No inventa precios ni servicios falsos
- [ ] Funciona en móvil
- [ ] El widget no bloquea contenido importante
