// src/app/server/services/post.service.ts
import { prisma } from "@/lib/prisma";
import type { CreatePostInput, UpdatePostInput } from "@/app/shared/validators/post";

const EDIT_LIMIT_MIN = 30;

/** 목록: soft delete 제외 */
export async function listPosts(params: { take?: number; cursor?: string | null } = {}) {
	const take = params.take ?? 20;

	// cursor 기반 페이지네이션(선택)
	const cursor = params.cursor ? { id: params.cursor } : undefined;

	const posts = await prisma.post.findMany({
		where: { deletedAt: null },
		orderBy: { createdAt: "desc" },
		take: take + 1,
		...(cursor ? { cursor, skip: 1 } : {}),
		select: {
			id: true,
			title: true,
			body: true,
			emotionTag: true,
			createdAt: true,
			author: { select: { id: true, nickname: true } },
		},
	});

	const hasNext = posts.length > take;
	const items = hasNext ? posts.slice(0, take) : posts;
	const nextCursor = hasNext ? items[items.length - 1]!.id : null;

	return { items, nextCursor };
}

/** 단건 */
export async function getPost(id: string) {
	const post = await prisma.post.findFirst({
		where: { id, deletedAt: null },
		select: {
			id: true,
			title: true,
			body: true,
			emotionTag: true,
			createdAt: true,
			updatedAt: true,
			authorId: true,
			author: { select: { id: true, nickname: true } },
		},
	});
	return post;
}

/** 생성 */
export async function createPost(authorId: string, input: CreatePostInput) {
	const post = await prisma.post.create({
		data: {
			authorId,
			title: input.title,
			body: input.body,
			emotionTag: input.emotionTag,
		},
		select: { id: true },
	});
	return post;
}

/** 수정: 작성자 + 30분 내 */
export async function updatePost(authorId: string, postId: string, input: UpdatePostInput) {
	const post = await prisma.post.findUnique({
		where: { id: postId },
		select: { id: true, authorId: true, createdAt: true, deletedAt: true },
	});

	if (!post || post.deletedAt) {
		return { ok: false as const, status: 404, message: "게시글이 존재하지 않습니다." };
	}

	if (post.authorId !== authorId) {
		return { ok: false as const, status: 403, message: "수정 권한이 없습니다." };
	}

	const limitMs = EDIT_LIMIT_MIN * 60_000;
	if (Date.now() - post.createdAt.getTime() > limitMs) {
		return {
			ok: false as const,
			status: 403,
			message: "게시글은 작성 후 30분 이내에만 수정할 수 있습니다.",
		};
	}

	await prisma.post.update({
		where: { id: postId },
		data: {
			...(input.title !== undefined ? { title: input.title } : {}),
			...(input.body !== undefined ? { body: input.body } : {}),
			...(input.emotionTag !== undefined ? { emotionTag: input.emotionTag } : {}),
		},
	});

	return { ok: true as const };
}

/** 삭제: soft delete + 작성자만 */
export async function softDeletePost(authorId: string, postId: string) {
	const post = await prisma.post.findUnique({
		where: { id: postId },
		select: { id: true, authorId: true, deletedAt: true },
	});

	if (!post || post.deletedAt) {
		return { ok: false as const, status: 404, message: "게시글이 존재하지 않습니다." };
	}

	if (post.authorId !== authorId) {
		return { ok: false as const, status: 403, message: "삭제 권한이 없습니다." };
	}

	await prisma.post.update({
		where: { id: postId },
		data: { deletedAt: new Date() },
	});

	return { ok: true as const };
}
