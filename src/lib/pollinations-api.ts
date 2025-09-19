// lib/pollinations-api.ts
export const POLLINATIONS_BASE = "https://text.pollinations.ai";

export interface FetchModelsResponse {
  [key: string]: any;
}

export async function fetchAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${POLLINATIONS_BASE}/models`);
    const data: FetchModelsResponse = await response.json();
    
    if (Array.isArray(data)) {
      const ids = data.map((d: any) => d.id || d.name).filter(Boolean);
      return ids.length ? ids : ["openai"];
    } else if (data && typeof data === "object") {
      const keys = Object.keys(data).slice(0, 12);
      return keys.length ? keys : ["openai"];
    }
    return ["openai"];
  } catch {
    return ["openai"];
  }
}

export async function fetchNonStreamingResponse(prompt: string, model: string): Promise<string> {
  // Try POST first
  try {
    const res = await fetch(`${POLLINATIONS_BASE}/openai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });
    if (!res.ok) throw new Error(`POST ${res.status}`);
    const json = await res.json();
    return json?.choices?.[0]?.message?.content ?? "";
  } catch {
    // Fallback to GET
    const res2 = await fetch(`${POLLINATIONS_BASE}/${encodeURIComponent(prompt)}?model=${encodeURIComponent(model)}`);
    return await res2.text();
  }
}