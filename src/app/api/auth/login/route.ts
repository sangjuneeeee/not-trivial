// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/app/shared/validators/auth";
import { createSession } from "@/server/auth/session";
import { consumeRateLimit } from "@/server/services/rate-limit.service";
import { getClientIp } from "@/server/services/request-meta";

export async function POST(req: Request) {
	try {
		const ip = getClientIp(req);

		const body = await req.json();
		const input = loginSchema.parse(body);

		// ✅ rate limit (로그인 남발 방지)
		const key = `login:ip=${ip}:user=${input.username}`;
		const rl = await consumeRateLimit({
			key,
			limit: 10,
			windowSec: 5 * 60,
			blockSec: 5 * 60,
		});

		if (!rl.ok) {
			return NextResponse.json(
				{ message: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해주세요.` },
				{ status: 429 }
			);
		}

		const user = await prisma.user.findUnique({
			where: { username: input.username },
			select: { id: true, nickname: true, passwordHash: true },
		});

		if (!user) {
			return NextResponse.json(
				{ message: "아이디 또는 비밀번호가 올바르지 않습니다." },
				{ status: 401 }
			);
		}

		const ok = await bcrypt.compare(input.password, user.passwordHash);
		if (!ok) {
			return NextResponse.json(
				{ message: "아이디 또는 비밀번호가 올바르지 않습니다." },
				{ status: 401 }
			);
		}

		// ✅ 세션 생성 + 쿠키 발급
		const { token, expiresAt } = await createSession(user.id);

		const cookieStore = await cookies();
		cookieStore.set({
			name: "nt_session",
			value: token,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			expires: expiresAt,
		});

		return NextResponse.json({ user: { id: user.id, nickname: user.nickname } }, { status: 200 });
	} catch (e) {
		console.error("[login] error:", e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}
