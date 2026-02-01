const COHERE_CHAT_URL = "https://api.cohere.ai/v2/chat";
const COHERE_MODEL = "command-a-vision-07-2025";

export interface CohereExtractionRequest {
  systemPrompt: string;
  userPrompt: string;
  imageDataUrl: string;
  schema: Record<string, unknown>;
}

export async function extractReceiptJson(
  request: CohereExtractionRequest
): Promise<string | null> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    throw new Error("COHERE_API_KEY is not configured. Add it to .env.local");
  }

  const response = await fetch(COHERE_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Client-Name": "slipwise/1.0",
    },
    body: JSON.stringify({
      model: COHERE_MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: request.systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: request.userPrompt },
            {
              type: "image_url",
              image_url: { url: request.imageDataUrl, detail: "low" },
            },
          ],
        },
      ],
      response_format: {
        type: "json_object",
        schema: request.schema,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cohere API ${response.status}: ${detail.slice(0, 500)}`);
  }

  const payload = (await response.json()) as {
    message?: { content?: Array<{ type: string; text?: string }> };
  };
  const text = payload.message?.content?.find((part) => part.type === "text")?.text;
  return text ?? null;
}
