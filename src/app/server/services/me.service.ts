// src/app/server/services/me.service.ts
import { prisma } from "@/lib/prisma";

export async function listMyPosts(userId: string) {
	return prisma.post.findMany({
		where: { authorId: userId, deletedAt: null },
		orderBy: { createdAt: "desc" },
		take: 30,
		select: {
			id: true,
			title: true,
			emotionTag: true,
			createdAt: true,
		},
	});
}
