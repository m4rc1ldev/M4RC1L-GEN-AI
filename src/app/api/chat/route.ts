import { NextResponse } from "next/server";

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
};

const ALLOWED_MODELS = new Set<string>([
  "moonshotai/kimi-vl-a3b-thinking:free",
  "moonshotai/kimi-k2:free",
  "mistralai/mistral-7b-instruct:free",
]);

export async function POST(req: Request) {
  try {
    const { model: incomingModel, messages, stream } = (await req.json()) as {
      model?: string;
      messages: ChatMessage[];
      stream?: boolean;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: OPENROUTER_API_KEY missing" },
        { status: 500 }
      );
    }

    // Default to a safe allowed model if none provided
    const model = incomingModel && ALLOWED_MODELS.has(incomingModel)
      ? incomingModel
      : "mistralai/mistral-7b-instruct:free";

    // Enforce allowlist strictly
    if (!ALLOWED_MODELS.has(model)) {
      return NextResponse.json(
        { error: "Model not allowed", code: "MODEL_NOT_ALLOWED" },
        { status: 400 }
      );
    }

    const orUrl = "https://openrouter.ai/api/v1/chat/completions";
    const res = await fetch(orUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERRER || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_TITLE || "M4RC1L Chat",
      },
      body: JSON.stringify({ model, messages, stream: !!stream }),
    });

    if (stream) {
      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        let parsed: unknown = undefined;
        try { parsed = JSON.parse(text); } catch {}
        const msg: string =
          typeof parsed === "object" && parsed !== null && "error" in parsed &&
          typeof (parsed as { error?: { message?: string } }).error?.message === "string"
            ? (parsed as { error?: { message?: string } }).error!.message!
            : text || "Upstream error";
        const isModelMissing = msg.toLowerCase().includes("model not found");
        if (res.status === 404 || isModelMissing) {
          return NextResponse.json(
            { error: "Selected model is unavailable right now", code: "MODEL_NOT_FOUND", upstream: parsed ?? text },
            { status: 424 }
          );
        }
        return NextResponse.json({ error: `Upstream error (${res.status}): ${msg}` }, { status: 502 });
      }
      return new Response(res.body, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    } else {
      const text = await res.text();
      if (!res.ok) {
        let parsed: unknown = undefined;
        try {
          parsed = JSON.parse(text);
        } catch {}
        const upstreamMsg: string =
          typeof parsed === "object" && parsed !== null && "error" in parsed &&
          typeof (parsed as { error?: { message?: string } }).error?.message === "string"
            ? (parsed as { error?: { message?: string } }).error!.message!
            : text;
        const isModelMissing = upstreamMsg.toLowerCase().includes("model not found");
        if (res.status === 404 || isModelMissing) {
          return NextResponse.json(
            { error: "Selected model is unavailable right now", code: "MODEL_NOT_FOUND", upstream: parsed ?? text },
            { status: 424 }
          );
        }
        return NextResponse.json(
          { error: `Upstream error (${res.status}): ${text}` },
          { status: 502 }
        );
      }
      const data = JSON.parse(text);
      return NextResponse.json(data);
    }
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string"
        ? (err as { message: string }).message
        : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
