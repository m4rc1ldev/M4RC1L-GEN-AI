import { NextResponse } from "next/server";

// Backward-compatible: forward to /api/imagegen
export async function POST(req: Request) {
  try {
    const { prompt, ratio = "16:9", style = "smart" } = (await req.json()) as {
      prompt?: string;
      ratio?: string;
      style?: string;
    };
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    const base = process.env.NEXT_PUBLIC_BASE_URL || "";
    const url = `${base}/api/imagegen`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt.trim(), ratio, style }),
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string"
        ? (err as { message: string }).message
        : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
