// src/app/api/me/notifications/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const auth = await requireUser();
		if (!auth.ok) {
			return NextResponse.json({ message: auth.message }, { status: auth.status });
		}

		const items = await prisma.notificationAggregate.findMany({
			where: { authorId: auth.user.id },
			orderBy: { updatedAt: "desc" },
			take: 30,
			select: {
				postId: true,
				typesJson: true,
				updatedAt: true,
				seenAt: true,
				post: { select: { title: true } },
			},
		});

		return NextResponse.json({ items }, { status: 200 });
	} catch (e) {
		console.error("[GET /api/me/notifications] error:", e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}
