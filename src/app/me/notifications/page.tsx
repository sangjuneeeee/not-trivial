// src/app/me/notifications/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/get-current-user";
import { prisma } from "@/lib/prisma";
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
		<div className='container'>
			<header>
				<h1>알림</h1>
				<nav>
					<Link href='/'>홈</Link>
					<Link href='/me'>마이페이지</Link>
					<Link href='/posts'>게시글</Link>
				</nav>
			</header>

			<NotificationList items={safeItems} />
		</div>
	);
}
