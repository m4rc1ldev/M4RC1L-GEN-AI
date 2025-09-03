import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ 
    message: "Test API working", 
    timestamp: new Date().toISOString(),
    method: "GET"
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({ 
      message: "Test POST working", 
      timestamp: new Date().toISOString(),
      method: "POST",
      body
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Test POST failed", 
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    { message: "Test OPTIONS working" },
    { 
      status: 200, 
      headers: { 
        Allow: "GET, POST, OPTIONS",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      } 
    }
  );
}
