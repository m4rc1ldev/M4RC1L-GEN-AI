// lib/streaming.ts
import { POLLINATIONS_BASE } from "./pollinations-api";
import { parseSSELines, extractOpenAIDelta } from "./sse-parser";
import type { StreamCallbacks, StreamOptions } from "./types";

/**
 * Stream from POST /openai endpoint using fetch + ReadableStream
 */
export async function streamPostOpenAI({
  prompt,
  model,
  signal,
  onDelta,
  onDone,
}: {
  prompt: string;
  model: string;
  signal: AbortSignal;
} & StreamCallbacks): Promise<void> {
  const response = await fetch(`${POLLINATIONS_BASE}/openai`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "Accept": "text/event-stream" 
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`POST ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffered = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffered += decoder.decode(value, { stream: true });
      
      // Process complete SSE events
      const parts = buffered.split("\n\n");
      buffered = parts.pop() || "";
      
      for (const part of parts) {
        parseSSELines(part + "\n\n", (data) => {
          if (data === "[DONE]") {
            onDone();
            return;
          }
          
          const delta = extractOpenAIDelta(data);
          if (delta) {
            onDelta(delta);
          }
        });
      }
    }
  } finally {
    onDone();
    reader.releaseLock();
  }
}

/**
 * Stream from GET endpoint using EventSource
 */
export function streamGetEventSource({
  prompt,
  model,
  onDelta,
  onDone,
}: {
  prompt: string;
  model: string;
} & StreamCallbacks): () => void {
  const url = `${POLLINATIONS_BASE}/${encodeURIComponent(prompt)}?model=${encodeURIComponent(model)}&stream=true`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    if (!event.data) return;
    
    if (event.data === "[DONE]") {
      try {
        eventSource.close();
      } catch {}
      onDone();
      return;
    }
    
    onDelta(event.data);
  };

  eventSource.onerror = () => {
    try {
      eventSource.close();
    } catch {}
    onDone();
  };

  // Return cleanup function
  return () => {
    try {
      eventSource.close();
    } catch {}
  };
}

/**
 * POST-first streaming with silent GET fallback
 */
export async function streamWithSilentFallback(
  prompt: string,
  model: string,
  onDelta: (chunk: string) => void,
  onDone: () => void,
  options: StreamOptions = {}
): Promise<void> {
  const connectTimeoutMs = options.connectTimeoutMs ?? 1500;
  let firstByteReceived = false;
  let streamFinished = false;
  const abortController = new AbortController();

  const postAttempt = (async () => {
    try {
      await streamPostOpenAI({
        prompt,
        model,
        signal: abortController.signal,
        onDelta: (chunk) => {
          firstByteReceived = true;
          onDelta(chunk);
        },
        onDone: () => {
          if (!streamFinished) {
            streamFinished = true;
            onDone();
          }
        },
      });
    } catch {
      // Swallow error for fallback handling
    }
  })();

  const timeout = new Promise<void>((resolve) => 
    setTimeout(resolve, connectTimeoutMs)
  );

  await Promise.race([postAttempt, timeout]);

  if (!firstByteReceived) {
    // Abort POST and fall back to GET silently
    abortController.abort();
    
    let stopEventSource: (() => void) | null = null;
    
    await new Promise<void>((resolve) => {
      stopEventSource = streamGetEventSource({
        prompt,
        model,
        onDelta: (chunk) => {
          firstByteReceived = true;
          onDelta(chunk);
        },
        onDone: () => {
          if (!streamFinished) {
            streamFinished = true;
            onDone();
          }
          resolve();
        },
      });
    }).finally(() => {
      if (stopEventSource) {
        stopEventSource();
      }
    });
  }
}