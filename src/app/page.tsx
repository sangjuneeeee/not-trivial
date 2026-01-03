// src/app/page.tsx
import Link from "next/link";
import { getCurrentUser } from "@/server/auth/get-current-user";
import { listPosts } from "@/server/posts/post.service";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PostCard } from "@/components/ui/PostCard";
import AppHeader from "@/components/layout/AppHeader";

export default async function HomePage() {
	const user = await getCurrentUser();
	const { items: posts } = await listPosts({ take: 10 });

	return (
		<main className='min-h-dvh bg-zinc-50 text-zinc-900'>
			<AppHeader />

			<Container className='py-12'>
				{/* 소개 섹션 */}
				<div className='mb-16 text-center'>
					<h1 className='text-4xl font-semibold text-zinc-900 mb-4 tracking-tight'>
						조용히 인정받는 공간
					</h1>
					<p className='text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-8'>
						비교 대신 인정, 평가 대신 반응.
						<br />
						오늘의 작은 성취나 버텨낸 하루를 남겨보세요.
					</p>
					{user && (
						<Link href='/write'>
							<Button size='lg'>글 쓰러 가기</Button>
						</Link>
					)}
					{!user && (
						<div className='flex gap-3 justify-center'>
							<Link href='/login'>
								<Button variant='secondary' size='lg'>
									로그인
								</Button>
							</Link>
							<Link href='/signup'>
								<Button size='lg'>회원가입</Button>
							</Link>
						</div>
					)}
				</div>

				{/* 게시글 목록 */}
				{posts.length > 0 && (
					<div className='space-y-4'>
						{posts.map((post) => (
							<PostCard
								key={post.id}
								post={{
									...post,
									createdAt: new Date(post.createdAt),
								}}
								isOwner={user?.id === post.author.id}
							/>
						))}
					</div>
				)}

				{posts.length === 0 && (
					<Card className='text-center py-12'>
						<p className='text-zinc-500 mb-4'>아직 게시글이 없습니다.</p>
						{user && (
							<Link href='/write'>
								<Button>첫 글 쓰러 가기</Button>
							</Link>
						)}
					</Card>
				)}
			</Container>
		</main>
	);
}
