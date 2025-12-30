// src/app/api/openapi/route.ts
import { NextResponse } from "next/server";
import { openapi } from "@/server/openapi";

export async function GET() {
	return NextResponse.json(openapi, { status: 200 });
}
