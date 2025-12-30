// src/app/api/me/notifications/seen/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/app/server/auth/require-user";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const auth = await requireUser();
		if (!auth.ok) {
			return NextResponse.json({ message: auth.message }, { status: auth.status });
		}

		const body = await req.json().catch(() => ({}));
		const postId = String(body?.postId ?? "");

		if (!postId) return NextResponse.json({ message: "postId가 필요합니다." }, { status: 400 });

		// author만 읽음 처리 가능
		await prisma.notificationAggregate.updateMany({
			where: { postId, authorId: auth.user.id },
			data: { seenAt: new Date() },
		});

		return NextResponse.json({ ok: true }, { status: 200 });
	} catch (e) {
		console.error("[POST /api/me/notifications/seen] error:", e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}
