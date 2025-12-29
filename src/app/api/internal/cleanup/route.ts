import { NextResponse } from "next/server";
import { runCleanup } from "@/app/server/services/cleanup.service";

export async function POST(req: Request) {
	const secret = req.headers.get("x-internal-secret");
	if (secret !== process.env.INTERNAL_SECRET) {
		return NextResponse.json({ message: "forbidden" }, { status: 403 });
	}

	const result = await runCleanup();
	return NextResponse.json({ ok: true, result });
}
