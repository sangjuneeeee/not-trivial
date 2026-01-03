// src/app/me/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/_components/LogoutButton";
import { getCurrentUser } from "@/server/auth/get-current-user";
import { listMyPosts } from "@/server/me/me.service";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/ui/PostCard";
import { UserBadge } from "@/components/ui/UserBadge";
import AppHeader from "@/components/layout/AppHeader";

export default async function MePage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");

	const myPosts = await listMyPosts(user.id);

	return (
		<main className='min-h-dvh bg-zinc-50 text-zinc-900'>
			<AppHeader />
			<Container className='py-8'>
				{/* 프로필 섹션 */}
				<Card className='mb-6'>
					<div className='flex items-start justify-between mb-6'>
						<div>
							<h1 className='text-2xl font-semibold mb-2'>{user.nickname}</h1>
							<p className='text-sm text-zinc-500'>칭찬을 주는 마음이 모여 만든 공간</p>
						</div>
						<UserBadge level={(user.badgeLevel || "SEED") as any} size='lg' showDescription />
					</div>

					<div className='flex gap-2 flex-wrap'>
						<Link href='/write'>
							<Button>글쓰기</Button>
						</Link>
						<Link href='/me/notifications'>
							<Button variant='secondary'>받은 칭찬</Button>
						</Link>
						<Link href='/settings'>
							<Button variant='ghost'>설정</Button>
						</Link>
						<LogoutButton />
					</div>
				</Card>

				{/* 내가 작성한 글 */}
				{myPosts.length > 0 && (
					<div className='space-y-4'>
						<h2 className='text-lg font-semibold text-zinc-900 px-1'>내가 작성한 글</h2>
						{myPosts.map((post) => (
							<PostCard
								key={post.id}
								post={{
									...post,
									createdAt: new Date(post.createdAt),
								}}
								isOwner={true}
							/>
						))}
					</div>
				)}

				{myPosts.length === 0 && (
					<Card>
						<div className='text-center py-12'>
							<p className='text-zinc-500 mb-4'>아직 작성한 글이 없습니다.</p>
							<Link href='/write'>
								<Button>첫 글 쓰러 가기</Button>
							</Link>
						</div>
					</Card>
				)}
			</Container>
		</main>
	);
}
