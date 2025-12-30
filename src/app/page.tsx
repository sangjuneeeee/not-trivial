// src/app/page.tsx
import Link from "next/link";
import LogoutButton from "@/app/_components/LogoutButton";
import { getCurrentUser } from "@/app/server/auth/get-current-user";

export default async function HomePage() {
	const user = await getCurrentUser();

	return (
		<div className='container'>
			<header className='header'>
				<div className='brand'>
					<div className='title'>not-trivial</div>
					<div className='sub'>사소하지 않아 · 비교 없이 조용히 인정받는 공간</div>
				</div>

				<nav className='nav'>
					<Link href='/posts'>게시글</Link>
					{user ? (
						<>
							<span className='pill'>
								로그인됨: <b style={{ color: "var(--text)" }}>{user.nickname}</b>
							</span>
							<Link className='btn' href='/me'>
								내 정보
							</Link>
							<LogoutButton />
						</>
					) : (
						<>
							<span className='pill'>로그아웃 상태</span>
							<Link className='btn primary' href='/login'>
								로그인
							</Link>
							<Link className='btn' href='/signup'>
								회원가입
							</Link>
						</>
					)}
				</nav>
			</header>

			<div className='grid'>
				<section className='card'>
					<h1 className='h1'>비교 없이, 조용히 인정받는 공간</h1>
					<p className='p'>
						숫자·랭킹·댓글 없이, 정해진 반응(칭찬 버튼)만 남기는 게시판을 만들고 있습니다. 지금은
						인증(MVP)부터 단단히 쌓는 중입니다.
					</p>

					<div className='list'>
						<div className='item'>✔ 댓글 없음 · 랭킹 없음 · 인기글 없음</div>
						<div className='item'>✔ 칭찬은 글쓴이에게만 보임</div>
						<div className='item'>✔ 감정 태그는 우열 없는 상태 표현</div>
					</div>

					<div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
						{user ? (
							<>
								<Link className='btn primary' href='/me'>
									내 정보 보기
								</Link>
								<button className='btn' disabled title='다음 단계에서 붙입니다'>
									글 쓰기(예정)
								</button>
							</>
						) : (
							<>
								<Link className='btn primary' href='/login'>
									로그인하고 시작하기
								</Link>
								<Link className='btn' href='/forgot-password'>
									비밀번호 찾기
								</Link>
							</>
						)}
					</div>
				</section>

				<aside className='card'>
					<div style={{ fontWeight: 850, marginBottom: 10 }}>현재 상태</div>

					{user ? (
						<div className='item' style={{ color: "var(--text)" }}>
							✅ 로그인 상태입니다.
							<br />
							<span style={{ color: "var(--muted)" }}>
								다음은 게시글(Post) API를 붙이면 서비스가 “살아납니다”.
							</span>
						</div>
					) : (
						<div className='item'>
							🔒 로그인이 필요합니다.
							<br />
							<span style={{ color: "var(--muted)" }}>
								이 문구는 SSR(서버)에서 세션 쿠키를 읽어 판별합니다.
							</span>
						</div>
					)}

					<hr className='hr' />

					<div className='list'>
						<div className='item'>다음 작업: Post 작성/수정/삭제(30분 제한)</div>
						<div className='item'>다음 작업: Praise(게시글당 1회 + 일일 제한)</div>
						<div className='item'>다음 작업: 알림 집계(NotificationAggregate)</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
