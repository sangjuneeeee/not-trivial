// src/app/server/services/password-reset.service.ts
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resend, EMAIL_FROM, APP_URL } from "../email/resend";
import type { RequestPasswordResetInput, ResetPasswordInput } from "@/app/shared/validators/auth";
import { generateToken, hashToken } from "@/server/auth/token";

/** 비번 재설정 토큰 유효 시간(분) */
const TOKEN_EXPIRE_MIN = 30;

export async function requestPasswordReset(input: RequestPasswordResetInput) {
	console.log("[PasswordReset] input email:", input.email);

	const user = await prisma.user.findUnique({
		where: { email: input.email },
		select: { id: true, email: true },
	});

	console.log("[PasswordReset] user exists?", Boolean(user));
	console.log("[PasswordReset] user email:", user?.email);

	// 이메일 존재 여부 노출 방지
	if (!user) {
		console.log("[PasswordReset] no user for email -> skip sending");
		return { ok: true as const };
	}

	const token = generateToken();
	const tokenHash = hashToken(token);

	await prisma.passwordResetToken.create({
		data: {
			userId: user.id,
			tokenHash,
			expiresAt: new Date(Date.now() + TOKEN_EXPIRE_MIN * 60_000),
		},
	});

	const resetUrl = `${APP_URL}/reset-password?token=${token}`;

	console.log("[PasswordReset] sending to:", user.email);
	console.log("[PasswordReset] resetUrl:", resetUrl);

	const { data, error } = await resend.emails.send({
		from: EMAIL_FROM,
		to: [user.email],
		subject: "[not-trivial] 비밀번호 재설정",
		html: `
      <p>비밀번호 재설정을 요청하셨습니다.</p>
      <p><a href="${resetUrl}">비밀번호 재설정하기</a></p>
      <p>${TOKEN_EXPIRE_MIN}분 이내에만 유효합니다.</p>
    `,
	});

	console.log("[Resend] data:", data);
	console.log("[Resend] error:", error);

	if (error) throw new Error(`Resend failed: ${JSON.stringify(error)}`);

	return { ok: true as const };
}

export async function resetPassword(input: ResetPasswordInput) {
	const tokenHash = hashToken(input.token);

	const record = await prisma.passwordResetToken.findUnique({
		where: { tokenHash },
	});

	if (!record || record.usedAt || record.expiresAt < new Date()) {
		return {
			ok: false as const,
			status: 400,
			message: "토큰이 유효하지 않습니다.",
		};
	}

	const passwordHash = await bcrypt.hash(input.password, 12);

	await prisma.$transaction([
		prisma.user.update({
			where: { id: record.userId },
			data: { passwordHash },
		}),
		prisma.passwordResetToken.update({
			where: { id: record.id },
			data: { usedAt: new Date() },
		}),

		// ✅ 비밀번호 변경 성공 시: 모든 세션 무효화(전 기기 로그아웃)
		prisma.session.deleteMany({
			where: { userId: record.userId },
		}),
	]);

	return { ok: true as const };
}
