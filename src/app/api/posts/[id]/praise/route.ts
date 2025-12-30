// src/app/api/posts/[id]/praise/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/app/server/auth/require-user";
import { createPraiseSchema } from "@/app/shared/validators/praise";
import { createPraiseForPost } from "@/app/server/services/praise.service";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
	try {
		const auth = await requireUser();
		if (!auth.ok) {
			return NextResponse.json({ message: auth.message }, { status: auth.status });
		}

		const { id: postId } = await ctx.params;

		const body = await req.json();
		const input = createPraiseSchema.parse(body);

		const result = await createPraiseForPost({
			postId,
			praiserId: auth.user.id,
			input,
		});

		if (!result.ok) {
			return NextResponse.json({ message: result.message }, { status: result.status });
		}

		return NextResponse.json({ ok: true, praiseId: result.praiseId }, { status: 201 });
	} catch (e) {
		console.error("[POST /api/posts/:id/praise] error:", e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}
