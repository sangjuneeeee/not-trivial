// src/app/posts/page.tsx
import Link from "next/link";
import { listPosts } from "@/app/server/services/post.service";
import { getCurrentUser } from "@/app/server/auth/get-current-user";
import { EMOTION_LABEL } from "@/app/shared/emotion";

export default async function PostsPage() {
	const user = await getCurrentUser();
	const { items } = await listPosts({ take: 20, cursor: null });

	return (
		<div className='container'>
			<header>
				<h1>게시글</h1>
				<nav>
					<Link href='/'>홈</Link>
					{user ? <Link href='/write'>글쓰기</Link> : <Link href='/login'>로그인</Link>}
				</nav>
			</header>

			<div className='box'>
				{items.length === 0 ? (
					<p>아직 글이 없습니다. 첫 글을 남겨보세요.</p>
				) : (
					<ul style={{ margin: 0, paddingLeft: 18 }}>
						{items.map((p) => (
							<li key={p.id} style={{ marginBottom: 10 }}>
								<Link href={`/posts/${p.id}`}>
									<b>{p.title}</b>
								</Link>
								<div className='help'>
									{EMOTION_LABEL[p.emotionTag] ?? p.emotionTag} · {p.author.nickname} ·{" "}
									{new Date(p.createdAt).toLocaleString("ko-KR")}
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
