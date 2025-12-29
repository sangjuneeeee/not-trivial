// src/app/api/auth/password-reset/request/route.ts
import { NextResponse } from "next/server";
import { requestPasswordResetSchema } from "@/app/shared/validators/auth";
import { requestPasswordReset } from "@/app/server/services/password-reset.service";
import { consumeRateLimit } from "@/app/server/services/rate-limit.service";
import { getClientIp } from "@/app/server/services/request-meta";

/**
 * POST /api/auth/password-reset/request
 * - 이메일 존재 여부 노출 방지: 항상 "보냈다" 형태로 응답(단, rate limit은 429)
 */
export async function POST(req: Request) {
	try {
		const ip = getClientIp(req);

		const json = await req.json();
		const input = requestPasswordResetSchema.parse(json);

		// ✅ rate limit (비번찾기 남발 방지)
		const key = `pwreset:ip=${ip}:email=${input.email}`;
		const rl = await consumeRateLimit({
			key,
			limit: 3,
			windowSec: 15 * 60,
			blockSec: 15 * 60,
		});

		if (!rl.ok) {
			// 이메일 존재 여부와 무관하게 429로 제한만 알림
			return NextResponse.json(
				{ message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
				{ status: 429 }
			);
		}

		await requestPasswordReset(input);

		return NextResponse.json(
			{ message: "해당 이메일로 재설정 안내를 보냈습니다. (가입된 이메일이라면)" },
			{ status: 200 }
		);
	} catch (e) {
		console.error("[PasswordReset request] error:", e);
		return NextResponse.json({ message: "메일 발송 실패" }, { status: 500 });
	}
}
