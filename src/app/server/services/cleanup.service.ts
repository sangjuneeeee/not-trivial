// src/app/server/services/cleanup.service.ts
import { prisma } from "@/lib/prisma";

/**
 * 정리 작업
 * - 만료된 세션 삭제
 * - 만료된 비번 재설정 토큰 삭제
 * - usedAt 있고 오래된 reset token 삭제(선택)
 * - 오래된 rate limit 버킷 삭제(선택)
 */
export async function runCleanup() {
	const now = new Date();

	// 1) 만료된 세션 삭제
	const sessions = await prisma.session.deleteMany({
		where: { expiresAt: { lt: now } },
	});

	// 2) 만료된 비번 재설정 토큰 삭제
	const resetExpired = await prisma.passwordResetToken.deleteMany({
		where: { expiresAt: { lt: now } },
	});

	// 3) 사용 완료 토큰도 오래된 건 삭제(선택: 7일 보관)
	const keepResetUsedDays = 7;
	const resetOlderThan = new Date(now.getTime() - keepResetUsedDays * 24 * 60 * 60 * 1000);

	const resetUsedOld = await prisma.passwordResetToken.deleteMany({
		where: {
			usedAt: { not: null },
			createdAt: { lt: resetOlderThan },
		},
	});

	// 4) RateLimitBucket 오래된 것 삭제(선택: 30일치만 보관)
	const keepBucketDays = 30;
	const bucketOlderThan = new Date(now.getTime() - keepBucketDays * 24 * 60 * 60 * 1000);

	const buckets = await prisma.rateLimitBucket.deleteMany({
		where: { updatedAt: { lt: bucketOlderThan } },
	});

	return {
		sessionsDeleted: sessions.count,
		resetExpiredDeleted: resetExpired.count,
		resetUsedOldDeleted: resetUsedOld.count,
		bucketsDeleted: buckets.count,
	};
}
