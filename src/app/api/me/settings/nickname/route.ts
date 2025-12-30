// src/app/api/me/settings/nickname/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { updateNicknameSchema } from "@/app/shared/validators/settings";
import { updateNickname } from "@/server/me/settings.service";

export async function POST(req: Request) {
	try {
		const auth = await requireUser();
		if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });

		const body = await req.json();
		const input = updateNicknameSchema.parse(body);

		await updateNickname(auth.user.id, input);

		return NextResponse.json({ ok: true }, { status: 200 });
	} catch (e) {
		console.error("[POST /api/me/settings/nickname] error:", e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}
