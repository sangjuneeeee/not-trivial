import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { EMOTION_LABEL } from "@/app/shared/emotion";

type Post = {
	id: string;
	title: string;
	body: string;
	emotionTag: string;
	createdAt: Date;
	author: { nickname: string; id?: string };
};

type Props = {
	post: Post;
	children?: ReactNode;
	isOwner?: boolean;
};

/**
 * PostCard
 * - 게시글을 표시하는 카드 컴포넌트
 * - 비교를 유도하지 않도록: 숫자, 순위, 랭킹 없음
 * - 따뜻하고 조용한 톤 유지
 */
export function PostCard({ post, children, isOwner = false }: Props) {
	const emotionLabel = EMOTION_LABEL[post.emotionTag] ?? post.emotionTag;
	const dateStr = new Date(post.createdAt).toLocaleDateString("ko-KR", {
		month: "short",
		day: "numeric",
	});

	// 본문 미리보기 (최대 150자)
	const preview = post.body.length > 150 ? post.body.slice(0, 150) + "..." : post.body;

	return (
		<Card className='hover:border-zinc-300 hover:shadow-md transition-all duration-200'>
			<Link href={`/posts/${post.id}`} className='block group'>
				<div className='flex items-start justify-between gap-4 mb-4'>
					<div className='flex-1 min-w-0'>
						<h3
							className='text-lg font-semibold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors overflow-hidden text-ellipsis'
							style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
						>
							{post.title}
						</h3>
						<p
							className='text-sm text-zinc-600 leading-relaxed overflow-hidden text-ellipsis'
							style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
						>
							{preview}
						</p>
					</div>
				</div>

				<div className='flex items-center gap-2 flex-wrap pt-4 border-t border-zinc-100 text-xs'>
					{isOwner && (
						<>
							<Badge>{emotionLabel}</Badge>
							<span className='text-zinc-300'>·</span>
						</>
					)}
					<span className='text-zinc-500'>{post.author.nickname}</span>
					<span className='text-zinc-300'>·</span>
					<span className='text-zinc-500'>{dateStr}</span>
				</div>
			</Link>
			{children && <div className='mt-4'>{children}</div>}
		</Card>
	);
}
