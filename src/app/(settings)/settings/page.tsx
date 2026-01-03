// src/app/(settings)/settings/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/get-current-user";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import AppHeader from "@/components/layout/AppHeader";
import SettingsForms from "@/app/_components/SettingsForms";

export default async function SettingsPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");

	return (
		<main className='min-h-dvh bg-zinc-50 text-zinc-900'>
			<AppHeader />
			<Container className='py-8'>
				<div className='mb-6'>
					<h1 className='text-2xl font-semibold mb-2'>계정 설정</h1>
					<p className='text-sm text-zinc-600'>
						비밀번호를 변경하면 보안을 위해 자동으로 로그아웃됩니다.
					</p>
				</div>

				<SettingsForms initialNickname={user.nickname} />
			</Container>
		</main>
	);
}
