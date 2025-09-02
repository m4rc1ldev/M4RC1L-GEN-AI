import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY missing" },
        { status: 500 }
      );
    }

    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERRER || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_TITLE || "M4RC1L Chat MVP",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Upstream error (${res.status}): ${text}` },
        { status: 502 }
      );
    }
    const data: unknown = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string"
        ? (err as { message: string }).message
        : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
