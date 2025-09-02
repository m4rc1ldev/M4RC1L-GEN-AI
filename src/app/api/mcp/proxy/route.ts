import { NextResponse } from "next/server";

export async function POST() {
	return NextResponse.json({ error: "MCP proxy not implemented" }, { status: 501 });
}

export async function GET() {
	return NextResponse.json({ status: "mcp proxy placeholder" });
}

