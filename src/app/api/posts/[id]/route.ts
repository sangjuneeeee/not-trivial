// src/app/api/posts/[id]/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { updatePostSchema } from "@/app/shared/validators/post";
import { getPost, softDeletePost, updatePost } from "@/server/services/post.service";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/posts/:id
 * - 단건 조회(soft delete 제외)
 * - 공개 가능
 */
export async function GET(_req: Request, ctx: Ctx) {
	try {
		const { id } = await ctx.params;

		const post = await getPost(id);
		if (!post) return NextResponse.json({ message: "Not Found" }, { status: 404 });

		return NextResponse.json({ post }, { status: 200 });
	} catch (e) {
		console.error("[GET /api/posts/:id] error:", e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}

/**
 * PATCH /api/posts/:id
 * - 수정: 작성자 + 작성 후 30분 이내
 */
export async function PATCH(req: Request, ctx: Ctx) {
	try {
		const auth = await requireUser();
		if (!auth.ok) {
			return NextResponse.json({ message: auth.message }, { status: auth.status });
		}

		const { id } = await ctx.params;
		const body = await req.json();
		const input = updatePostSchema.parse(body);

		const result = await updatePost(auth.user.id, id, input);
		if (!result.ok) {
			return NextResponse.json({ message: result.message }, { status: result.status });
		}

		return NextResponse.json({ ok: true }, { status: 200 });
	} catch (e) {
		console.error("[PATCH /api/posts/:id] error:", e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}

/**
 * DELETE /api/posts/:id
 * - 삭제: soft delete + 작성자만
 */
export async function DELETE(_req: Request, ctx: Ctx) {
	try {
		const auth = await requireUser();
		if (!auth.ok) {
			return NextResponse.json({ message: auth.message }, { status: auth.status });
		}

		const { id } = await ctx.params;

		const result = await softDeletePost(auth.user.id, id);
		if (!result.ok) {
			return NextResponse.json({ message: result.message }, { status: result.status });
		}

		return NextResponse.json({ ok: true }, { status: 200 });
	} catch (e) {
		console.error("[DELETE /api/posts/:id] error:", e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}
