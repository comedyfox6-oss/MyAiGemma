const MODEL = "@cf/google/gemma-4-26b-a4b-it";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ ok: true, model: MODEL });

    try {
      const { messages } = await request.json();
      if (!Array.isArray(messages)) return json({ error: "messages must be an array" }, 400);

      const r = await env.AI.run(MODEL, { messages, max_tokens: 1024 });

      const reply =
        r?.choices?.[0]?.message?.content ??
        r?.response ??
        r?.result?.response ??
        "";

      return json({ reply: typeof reply === "string" ? reply : JSON.stringify(reply) });
    } catch (e) {
      return json({ error: String(e?.message || e) }, 500);
    }
  },
};
