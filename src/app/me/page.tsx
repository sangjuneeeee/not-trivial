// src/app/me/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/_components/LogoutButton";
import { getCurrentUser } from "@/app/server/auth/get-current-user";
import { listMyPosts } from "@/app/server/services/me.service";
import { EMOTION_LABEL } from "@/app/shared/emotion";

export default async function MePage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");

	const myPosts = await listMyPosts(user.id);

	return (
		<div className='container'>
			<header>
				<h1>마이페이지</h1>
				<nav>
					<Link href='/'>홈</Link>
					<Link href='/posts'>게시글</Link>
					<Link href='/me/notifications'>알림</Link>
					<Link href='/settings'>계정 설정</Link>
					<LogoutButton />
				</nav>
			</header>

			<div className='box'>
				<h1 style={{ marginTop: 0 }}>내 정보</h1>
				<p>
					<b>nickname</b>: {user.nickname}
					<br />
					<b>username</b>: {user.username}
					<br />
					<b>email</b>: {user.email}
				</p>
			</div>

			<div className='box'>
				<h1 style={{ marginTop: 0 }}>바로가기</h1>
				<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
					<Link href='/write'>글쓰기</Link>
					<Link href='/me/notifications'>받은 칭찬 알림</Link>
				</div>
			</div>

			<div className='box'>
				<h1 style={{ marginTop: 0 }}>내가 작성한 글</h1>

				{myPosts.length === 0 ? (
					<p>아직 작성한 글이 없습니다.</p>
				) : (
					<ul style={{ margin: 0, paddingLeft: 18 }}>
						{myPosts.map((p) => (
							<li key={p.id} style={{ marginBottom: 10 }}>
								<Link href={`/posts/${p.id}`}>
									<b>{p.title}</b>
								</Link>
								<div style={{ color: "#666", fontSize: 12 }}>
									{EMOTION_LABEL[p.emotionTag] ?? p.emotionTag} ·{" "}
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
