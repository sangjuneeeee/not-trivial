// src/app/api/posts/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { createPostSchema } from "@/app/shared/validators/post";
import { createPost, listPosts } from "@/server/posts/post.service";

/**
 * GET /api/posts
 * - 목록 조회(soft delete 제외)
 * - 로그인 없어도 공개로 두는 게 MVP에선 자연스러움
 */
export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const take = Number(url.searchParams.get("take") ?? "20");
		const cursor = url.searchParams.get("cursor");

		const result = await listPosts({
			take: Number.isFinite(take) ? Math.min(Math.max(take, 1), 50) : 20,
			cursor: cursor ? String(cursor) : null,
		});

		return NextResponse.json(result, { status: 200 });
	} catch (e) {
		console.error("[GET /api/posts] error:", e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}

/**
 * POST /api/posts
 * - 게시글 작성(로그인 필수)
 */
export async function POST(req: Request) {
	try {
		const auth = await requireUser();
		if (!auth.ok) {
			return NextResponse.json({ message: auth.message }, { status: auth.status });
		}

		const body = await req.json();
		const input = createPostSchema.parse(body);

		const post = await createPost(auth.user.id, input);
		return NextResponse.json({ ok: true, postId: post.id }, { status: 201 });
	} catch (e) {
		console.error("[POST /api/posts] error:", e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}
