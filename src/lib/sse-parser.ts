// lib/sse-parser.ts
/**
 * Minimal Server-Sent Events parser for handling SSE data streams
 */
export function parseSSELines(buffer: string, emit: (data: string) => void): void {
  for (const block of buffer.split("\n\n")) {
    if (!block.trim()) continue;
    
    const payload = block
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .join("\n");
      
    if (payload) {
      emit(payload);
    }
  }
}

/**
 * Extract content delta from OpenAI-style SSE chunk
 */
export function extractOpenAIDelta(data: string): string {
  if (data === "[DONE]") return "";
  
  try {
    const json = JSON.parse(data);
    return json?.choices?.[0]?.delta?.content ?? "";
  } catch {
    // Ignore non-JSON data silently
    return "";
  }
}