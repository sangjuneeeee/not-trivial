import { prisma } from "@/lib/prisma";
import { generateToken, hashToken } from "@/server/auth/token";

const SESSION_EXPIRE_DAYS = 7;

/**
 * 로그인 성공 시 호출
 * - raw token은 쿠키로 내려보내고
 * - DB에는 hash(token)만 저장
 */
export async function createSession(userId: string) {
	const token = generateToken();

	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRE_DAYS);

	await prisma.session.create({
		data: {
			userId,
			tokenHash: hashToken(token),
			expiresAt,
		},
	});

	return { token, expiresAt };
}
