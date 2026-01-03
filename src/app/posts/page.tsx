// src/app/posts/page.tsx
import { getCurrentUser } from "@/server/auth/get-current-user";
import { listPosts } from "@/server/posts/post.service";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { PostCard } from "@/components/ui/PostCard";
import AppHeader from "@/components/layout/AppHeader";

export default async function PostsPage() {
	const user = await getCurrentUser();
	const { items } = await listPosts({ take: 20, cursor: null });

	return (
		<main className='min-h-dvh bg-zinc-50 text-zinc-900'>
			<AppHeader />
			<Container className='py-8'>
				<h1 className='text-2xl font-semibold mb-6 px-1'>게시글</h1>
				<div className='space-y-4'>
					{items.length === 0 ? (
						<Card>
							<p className='text-sm text-zinc-500 text-center py-8'>
								아직 게시글이 없습니다. 첫 글을 남겨보세요.
							</p>
						</Card>
					) : (
						items.map((post) => (
							<PostCard
								key={post.id}
								post={{
									...post,
									createdAt: new Date(post.createdAt),
								}}
								isOwner={user?.id === post.author.id}
							/>
						))
					)}
				</div>
			</Container>
		</main>
	);
}
