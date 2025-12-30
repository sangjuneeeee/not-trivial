// src/app/server/auth/require-user.ts
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/app/api/auth/token";

/**
 * API(서버)에서 로그인 강제 체크용 헬퍼
 * - 쿠키 nt_session(raw) -> hash -> Session 조회
 * - 만료면 세션 삭제(선택) 후 401
 */
export async function requireUser() {
	const store = await cookies();
	const raw = store.get("nt_session")?.value;

	if (!raw) {
		return { ok: false as const, status: 401, message: "로그인이 필요합니다." };
	}

	const tokenHash = hashToken(raw);

	const session = await prisma.session.findUnique({
		where: { tokenHash },
		select: {
			expiresAt: true,
			user: { select: { id: true, nickname: true } },
		},
	});

	if (!session) {
		return { ok: false as const, status: 401, message: "세션이 유효하지 않습니다." };
	}

	if (session.expiresAt < new Date()) {
		// 만료 세션 정리(선택)
		await prisma.session.delete({ where: { tokenHash } }).catch(() => {});
		return { ok: false as const, status: 401, message: "세션이 만료되었습니다." };
	}

	return { ok: true as const, user: session.user };
}
