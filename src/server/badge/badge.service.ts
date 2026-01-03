// src/server/badge/badge.service.ts
import { prisma } from "@/lib/prisma";

export type BadgeLevel = "SEED" | "SPROUT" | "TREE";

const BADGE_CONFIG = {
	SEED: {
		name: "씨앗",
		description: "칭찬의 시작",
		requiredDays: 0,
		requiredPraiseCount: 0,
		requiredUniqueTypes: 0,
	},
	SPROUT: {
		name: "새싹",
		description: "꾸준한 따뜻함",
		requiredDays: 7,
		requiredPraiseCount: 15,
		requiredUniqueTypes: 3,
	},
	TREE: {
		name: "나무",
		description: "깊은 공감",
		requiredDays: 30,
		requiredPraiseCount: 50,
		requiredUniqueTypes: 5,
	},
} as const;

/**
 * 사용자의 배지 레벨을 계산합니다.
 * - 최근 N일 동안의 칭찬 활동을 분석
 * - 꾸준함(연속 일수), 다양성(고유 타입 수), 총 칭찬 수를 고려
 */
export async function calculateBadgeLevel(userId: string): Promise<BadgeLevel> {
	// 최근 30일 데이터 조회
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const praises = await prisma.praise.findMany({
		where: {
			praiserId: userId,
			createdAt: { gte: thirtyDaysAgo },
		},
		select: {
			type: true,
			createdAt: true,
		},
		orderBy: { createdAt: "asc" },
	});

	if (praises.length === 0) {
		return "SEED";
	}

	// 고유 타입 수 계산
	const uniqueTypes = new Set(praises.map((p) => p.type)).size;

	// 최근 7일 칭찬 수
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	const recentPraiseCount = praises.filter((p) => p.createdAt >= sevenDaysAgo).length;

	// 연속 일수 계산 (최근 30일 중)
	const daysWithPraise = new Set<string>();
	praises.forEach((p) => {
		const dateStr = p.createdAt.toISOString().split("T")[0];
		daysWithPraise.add(dateStr);
	});

	// TREE 조건 체크
	if (
		daysWithPraise.size >= BADGE_CONFIG.TREE.requiredDays &&
		praises.length >= BADGE_CONFIG.TREE.requiredPraiseCount &&
		uniqueTypes >= BADGE_CONFIG.TREE.requiredUniqueTypes
	) {
		return "TREE";
	}

	// SPROUT 조건 체크
	if (
		daysWithPraise.size >= BADGE_CONFIG.SPROUT.requiredDays &&
		recentPraiseCount >= BADGE_CONFIG.SPROUT.requiredPraiseCount &&
		uniqueTypes >= BADGE_CONFIG.SPROUT.requiredUniqueTypes
	) {
		return "SPROUT";
	}

	return "SEED";
}

/**
 * 사용자의 배지 레벨을 업데이트합니다.
 * 칭찬 후 호출하여 배지를 갱신합니다.
 */
export async function updateUserBadge(userId: string) {
	const newLevel = await calculateBadgeLevel(userId);

	await prisma.user.update({
		where: { id: userId },
		data: { badgeLevel: newLevel },
	});

	return newLevel;
}

/**
 * 배지 정보를 가져옵니다.
 */
export function getBadgeInfo(level: BadgeLevel) {
	return BADGE_CONFIG[level];
}
