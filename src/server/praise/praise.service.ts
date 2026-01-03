// src/app/server/services/praise.service.ts
import { prisma } from "@/lib/prisma";
import type { CreatePraiseInput } from "@/app/shared/validators/praise";
import { updateUserBadge } from "@/server/badge/badge.service";

/**
 * 일일 칭찬 제한
 * - MVP: 하루 5회 정도 추천
 * - 남발 방지(서비스 철학과도 일치)
 */
const DAILY_PRAISE_LIMIT = 5;

/** yyyy-mm-dd 형태로 오늘 시작/끝 계산 */
function getTodayRange() {
	const now = new Date();
	const start = new Date(now);
	start.setHours(0, 0, 0, 0);

	const end = new Date(start);
	end.setDate(end.getDate() + 1);

	return { start, end };
}

/**
 * 칭찬 생성
 * - 로그인 필요(라우트에서 보장)
 * - 게시글 존재/삭제 여부 체크
 * - 내 글 칭찬 금지(권장)
 * - 게시글당 1회(Prisma unique로 최종 보장)
 * - 일일 제한
 * - NotificationAggregate에 type 집계(중복 type 무시)
 */
export async function createPraiseForPost(params: {
	postId: string;
	praiserId: string;
	input: CreatePraiseInput;
}) {
	const { postId, praiserId, input } = params;

	// 1) 게시글 확인 (soft delete 제외)
	const post = await prisma.post.findFirst({
		where: { id: postId, deletedAt: null },
		select: { id: true, authorId: true },
	});

	if (!post) {
		return { ok: false as const, status: 404, message: "게시글이 존재하지 않습니다." };
	}

	// 2) 내 글 칭찬 금지(권장 정책)
	if (post.authorId === praiserId) {
		return { ok: false as const, status: 400, message: "본인 글에는 칭찬할 수 없습니다." };
	}

	// 3) 일일 제한 체크
	const { start, end } = getTodayRange();

	const todayCount = await prisma.praise.count({
		where: {
			praiserId,
			createdAt: { gte: start, lt: end },
		},
	});

	if (todayCount >= DAILY_PRAISE_LIMIT) {
		return {
			ok: false as const,
			status: 429,
			message: `오늘은 칭찬을 ${DAILY_PRAISE_LIMIT}번까지 할 수 있습니다.`,
		};
	}

	// 4) Praise 생성 + 알림 집계 트랜잭션
	try {
		const result = await prisma.$transaction(async (tx) => {
			// 4-1) praise 생성 (게시글당 1회는 unique가 강제)
			const praise = await tx.praise.create({
				data: {
					postId,
					praiserId,
					type: input.type,
				},
				select: { id: true, type: true, createdAt: true },
			});

			// 4-2) NotificationAggregate upsert
			// typesJson: ["EMPATHY", "WELL_DONE", ...]
			const agg = await tx.notificationAggregate.upsert({
				where: { postId },
				create: {
					postId,
					authorId: post.authorId,
					typesJson: [input.type],
					// seenAt은 null (미확인 상태)
				},
				update: {}, // 아래에서 조건부 업데이트 처리
				select: { postId: true, typesJson: true },
			});

			// 4-3) typesJson에 새로운 type이면 추가, 중복이면 무시
			const current = Array.isArray(agg.typesJson) ? (agg.typesJson as any[]) : [];
			const set = new Set<string>(current.map(String));

			const beforeSize = set.size;
			set.add(input.type);

			if (set.size !== beforeSize) {
				// 새로운 type이 추가된 경우만 업데이트
				await tx.notificationAggregate.update({
					where: { postId },
					data: {
						typesJson: Array.from(set),
						seenAt: null, // 새로운 반응이 오면 다시 "미확인" 상태로 돌리는 게 자연스러움
					},
				});
			}

			return { praiseId: praise.id };
		});

		// 5) 배지 업데이트 (비동기, 실패해도 칭찬은 성공)
		updateUserBadge(praiserId).catch((err) => {
			console.error("[updateUserBadge] error:", err);
		});

		return { ok: true as const, praiseId: result.praiseId };
	} catch (e: any) {
		// Unique 충돌(이미 칭찬한 경우)
		// prisma error code: P2002
		if (e?.code === "P2002") {
			return { ok: false as const, status: 409, message: "이미 이 게시글을 칭찬하셨습니다." };
		}
		console.error("[createPraiseForPost] error:", e);
		return { ok: false as const, status: 500, message: "서버 오류" };
	}
}
