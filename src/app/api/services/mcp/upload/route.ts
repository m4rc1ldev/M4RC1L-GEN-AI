import { NextResponse } from "next/server";

export async function POST() {
	return NextResponse.json({ error: "MCP upload not implemented" }, { status: 501 });
}

export async function GET() {
	return NextResponse.json({ status: "mcp upload placeholder" });
}

