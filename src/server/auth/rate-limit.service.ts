// src/app/server/services/rate-limit.service.ts
import { prisma } from "@/lib/prisma";

type RateLimitResult =
	| { ok: true }
	| { ok: false; retryAfterSec: number; reason: "blocked" | "limit" };

function nowSec() {
	return Math.floor(Date.now() / 1000);
}

function toSec(d: Date) {
	return Math.floor(d.getTime() / 1000);
}

/**
 * DB 기반 rate limit (고정 윈도우 + block)
 *
 * @param key 고유 키 (ex: login:ip=...:user=...)
 * @param limit 윈도우 내 허용 횟수
 * @param windowSec 윈도우 길이(초)
 * @param blockSec limit 초과 시 차단 시간(초)
 */
export async function consumeRateLimit(params: {
	key: string;
	limit: number;
	windowSec: number;
	blockSec: number;
}): Promise<RateLimitResult> {
	const { key, limit, windowSec, blockSec } = params;
	const now = new Date();

	// 1) existing 확인
	const existing = await prisma.rateLimitBucket.findUnique({ where: { key } });

	// 1-1) 현재 block 상태인지 확인
	if (existing?.blockedUntil && existing.blockedUntil > now) {
		return {
			ok: false,
			reason: "blocked",
			retryAfterSec: toSec(existing.blockedUntil) - nowSec(),
		};
	}

	// 2) 윈도우 초기화 여부 판단
	const windowStart = existing?.windowStart ?? now;
	const windowAgeSec = (now.getTime() - windowStart.getTime()) / 1000;

	// 윈도우가 지났으면 새로 시작
	if (!existing || windowAgeSec >= windowSec) {
		await prisma.rateLimitBucket.upsert({
			where: { key },
			create: {
				key,
				windowStart: now,
				count: 1,
				blockedUntil: null,
			},
			update: {
				windowStart: now,
				count: 1,
				blockedUntil: null,
			},
		});
		return { ok: true };
	}

	// 3) 같은 윈도우 내 카운트 증가
	const nextCount = existing.count + 1;

	// limit 초과면 block 걸기
	if (nextCount > limit) {
		const blockedUntil = new Date(now.getTime() + blockSec * 1000);

		await prisma.rateLimitBucket.update({
			where: { key },
			data: {
				count: nextCount,
				blockedUntil,
			},
		});

		return {
			ok: false,
			reason: "limit",
			retryAfterSec: blockSec,
		};
	}

	// limit 이하면 count만 업데이트
	await prisma.rateLimitBucket.update({
		where: { key },
		data: { count: nextCount },
	});

	return { ok: true };
}
