// src/app/api/me/settings/password/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireUser } from "@/app/server/auth/require-user";
import { updatePasswordSchema } from "@/app/shared/validators/settings";
import { updatePasswordAndLogoutAllSessions } from "@/app/server/services/settings.service";

export async function POST(req: Request) {
	try {
		const auth = await requireUser();
		if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });

		const body = await req.json();
		const input = updatePasswordSchema.parse(body);

		const result = await updatePasswordAndLogoutAllSessions(auth.user.id, input);
		if (!result.ok) {
			return NextResponse.json({ message: result.message }, { status: result.status });
		}

		// ✅ 세션 전부 삭제했으니, 현재 쿠키도 만료시킴
		const store = await cookies();
		store.set({
			name: "nt_session",
			value: "",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			expires: new Date(0),
		});

		return NextResponse.json(
			{ ok: true, message: "비밀번호가 변경되었습니다. 다시 로그인해주세요." },
			{ status: 200 }
		);
	} catch (e) {
		console.error("[POST /api/me/settings/password] error:", e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}
