// src/app/me/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/server/auth/get-current-user";
import LogoutButton from "@/app/_components/LogoutButton";
import Link from "next/link";

export default async function MePage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");

	return (
		<div className='container'>
			<header className='header'>
				<div className='brand'>
					<div className='title'>내 정보</div>
					<div className='sub'>SSR에서 쿠키를 읽어 로그인 상태를 확인합니다</div>
				</div>
				<nav className='nav'>
					<Link className='btn' href='/'>
						홈
					</Link>
					<LogoutButton />
				</nav>
			</header>

			<div className='card' style={{ marginTop: 16 }}>
				<div className='item' style={{ color: "var(--text)" }}>
					<div>
						<b>nickname</b>: {user.nickname}
					</div>
					<div>
						<b>username</b>: {user.username}
					</div>
					<div>
						<b>email</b>: {user.email}
					</div>
				</div>

				<div className='help' style={{ marginTop: 12 }}>
					* 비밀번호 재설정 성공 시, 보안 강화를 위해 모든 세션이 로그아웃됩니다.
				</div>
			</div>
		</div>
	);
}
