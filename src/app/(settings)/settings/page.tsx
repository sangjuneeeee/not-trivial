// src/app/(settings)/settings/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/get-current-user";
import SettingsForms from "@/app/_components/SettingsForms";

export default async function SettingsPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");

	return (
		<div className='container'>
			<header>
				<h1>계정 설정</h1>
				<nav>
					<Link href='/'>홈</Link>
					<Link href='/me'>마이페이지</Link>
					<Link href='/me/notifications'>알림</Link>
				</nav>
			</header>

			<div className='box'>
				<p>
					로그인한 상태에서만 접근 가능합니다. 비밀번호를 변경하면 보안을 위해 자동 로그아웃됩니다.
				</p>
			</div>

			<SettingsForms initialNickname={user.nickname} />
		</div>
	);
}
