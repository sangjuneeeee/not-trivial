// src/app/me/notifications/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/Container";
import AppHeader from "@/components/layout/AppHeader";
import NotificationList from "@/app/_components/NotificationList";

export default async function MyNotificationsPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");

	const items = await prisma.notificationAggregate.findMany({
		where: { authorId: user.id },
		orderBy: { updatedAt: "desc" },
		take: 50,
		select: {
			postId: true,
			typesJson: true,
			updatedAt: true,
			seenAt: true,
			post: { select: { title: true } },
		},
	});

	// Next에서 Date가 직렬화 되도록 문자열로 변환(클라이언트로 넘기기 위해)
	const safeItems = items.map((it) => ({
		postId: it.postId,
		typesJson: it.typesJson,
		updatedAt: it.updatedAt.toISOString(),
		seenAt: it.seenAt ? it.seenAt.toISOString() : null,
		post: it.post,
	}));

	return (
		<main className='min-h-dvh bg-zinc-50 text-zinc-900'>
			<AppHeader />
			<Container className='py-8'>
				<NotificationList items={safeItems} />
			</Container>
		</main>
	);
}
