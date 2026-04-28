import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, file_urls, response_json_schema } = await req.json();

    const client = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
    });

    // Buduj content — tekst + ewentualne obrazy
    const content: Anthropic.MessageParam["content"] = [];

    if (file_urls && file_urls.length > 0) {
      for (const url of file_urls) {
        // Pobierz plik i zakoduj jako base64
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        const contentType = response.headers.get("content-type") || "image/jpeg";

        if (contentType.includes("pdf")) {
          content.push({
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64 },
          } as any);
        } else {
          content.push({
            type: "image",
            source: {
              type: "base64",
              media_type: contentType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: base64,
            },
          });
        }
      }
    }

    content.push({ type: "text", text: prompt });

    // Jeśli oczekujemy JSON — dodaj instrukcję
    const systemPrompt = response_json_schema
      ? "Respond ONLY with valid JSON matching the provided schema. No markdown, no explanation."
      : "You are Kengo, a helpful renovation assistant. Respond in Polish.";

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Jeśli JSON schema — parsuj odpowiedź
    if (response_json_schema) {
      try {
        const parsed = JSON.parse(responseText);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON from model", raw: responseText }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify(responseText), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
