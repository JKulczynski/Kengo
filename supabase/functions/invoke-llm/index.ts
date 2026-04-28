import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, file_urls, response_json_schema } = await req.json();

    const client = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
    });

    const content: any[] = [];

    if (file_urls && file_urls.length > 0) {
      for (const url of file_urls) {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const base64 = toBase64(buffer);
        const rawContentType = response.headers.get("content-type") || "image/jpeg";
        const contentType = rawContentType.split(";")[0].trim();

        if (contentType.includes("pdf")) {
          content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } });
        } else {
          const mediaType = contentType.startsWith("image/") ? contentType : "image/jpeg";
          content.push({ type: "image", source: { type: "base64", media_type: mediaType, data: base64 } });
        }
      }
    }

    content.push({ type: "text", text: prompt });

    const systemPrompt = response_json_schema
      ? "Respond ONLY with valid JSON matching the schema. No markdown, no explanation. All text values (notes, titles, descriptions) must be in Polish."
      : "You are Kengo, a helpful renovation assistant. Respond in Polish. Do not use emojis.";

    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    if (response_json_schema) {
      try {
        return new Response(JSON.stringify(JSON.parse(responseText)), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON", raw: responseText }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify(responseText), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
