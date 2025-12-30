// src/app/posts/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/server/services/post.service";
import { getCurrentUser } from "@/server/auth/get-current-user";
import { EMOTION_LABEL } from "@/app/shared/emotion";
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

	return (
		<div className='container'>
			<header>
				<h1>게시글 상세</h1>
				<nav>
					<Link href='/'>홈</Link>
					<Link href='/posts'>목록</Link>
					{user ? <Link href='/write'>글쓰기</Link> : <Link href='/login'>로그인</Link>}
				</nav>
			</header>

			<div className='box'>
				<h1 style={{ marginTop: 0 }}>{post.title}</h1>
				<p className='help'>
					{EMOTION_LABEL[post.emotionTag] ?? post.emotionTag} · {post.author.nickname} ·{" "}
					{new Date(post.createdAt).toLocaleString("ko-KR")}
				</p>
				<div style={{ whiteSpace: "pre-wrap" }}>{post.body}</div>

				<hr className='hr' />

				<div className='help'>수정시간: {new Date(post.updatedAt).toLocaleString("ko-KR")}</div>
			</div>

			{isOwner ? (
				<PostActions
					postId={post.id}
					initial={{ title: post.title, body: post.body, emotionTag: post.emotionTag }}
				/>
			) : (
				<div className='box'>
					<p>작성자만 수정/삭제할 수 있습니다.</p>
				</div>
			)}
			{user && !isOwner && <PraiseButtons postId={post.id} />}
		</div>
	);
}
