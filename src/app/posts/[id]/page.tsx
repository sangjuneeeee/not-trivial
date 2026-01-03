// src/app/posts/[id]/page.tsx
import { notFound } from "next/navigation";
import { getPost } from "@/server/posts/post.service";
import { getCurrentUser } from "@/server/auth/get-current-user";
import { EMOTION_LABEL } from "@/app/shared/emotion";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import AppHeader from "@/components/layout/AppHeader";
import PostActions from "@/app/_components/PostActions";
import PraiseButtons from "@/app/_components/PraiseButtons";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: Props) {
	const { id } = await params;

	const user = await getCurrentUser();
	const post = await getPost(id);

	if (!post) return notFound();

	const isOwner = user?.id === post.authorId;
	const emotionLabel = EMOTION_LABEL[post.emotionTag] ?? post.emotionTag;
	const createdAt = new Date(post.createdAt);
	const updatedAt = new Date(post.updatedAt);
	const isEdited = updatedAt.getTime() > createdAt.getTime() + 1000; // 1초 이상 차이

	return (
		<main className='min-h-dvh bg-zinc-50 text-zinc-900'>
			<AppHeader />
			<Container className='py-8 max-w-3xl'>
				{/* 게시글 본문 */}
				<Card className='mb-6'>
					<div className='mb-6'>
						<h1 className='text-2xl font-semibold text-zinc-900 mb-4 leading-tight'>
							{post.title}
						</h1>
						<div className='flex items-center gap-2 flex-wrap text-sm text-zinc-600'>
							{isOwner && <Badge>{emotionLabel}</Badge>}
							{isOwner && <span className='text-zinc-300'>·</span>}
							<span className='text-zinc-700 font-medium'>{post.author.nickname}</span>
							<span className='text-zinc-300'>·</span>
							<time dateTime={createdAt.toISOString()} className='text-zinc-500'>
								{createdAt.toLocaleDateString("ko-KR", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</time>
							{isEdited && (
								<>
									<span className='text-zinc-300'>·</span>
									<span className='text-xs text-zinc-400'>수정됨</span>
								</>
							)}
						</div>
					</div>

					<hr className='border-zinc-200 my-6' />

					<div className='whitespace-pre-wrap text-zinc-700 leading-relaxed text-[15px]'>
						{post.body}
					</div>
				</Card>

				{/* 작성자 전용 액션 */}
				{isOwner && (
					<PostActions
						postId={post.id}
						initial={{ title: post.title, body: post.body, emotionTag: post.emotionTag }}
					/>
				)}

				{/* 칭찬하기 (작성자가 아닌 로그인 사용자만) */}
				{user && !isOwner && <PraiseButtons postId={post.id} />}
			</Container>
		</main>
	);
}
