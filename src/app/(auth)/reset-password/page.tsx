// src/app/(auth)/reset-password/page.tsx
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import AppHeader from "@/components/layout/AppHeader";
import ResetPasswordForm from "@/app/_components/ResetPasswordForm";

export default function ResetPasswordPage() {
	return (
		<main className='min-h-dvh bg-zinc-50 text-zinc-900'>
			<AppHeader />
			<Container className='py-8'>
				{/* ✅ useSearchParams()를 쓰는 Client 컴포넌트는 Suspense로 감싸야 빌드가 통과합니다 */}
				<Suspense fallback={<div className='text-sm text-zinc-600'>토큰 확인 중...</div>}>
					<ResetPasswordForm />
				</Suspense>
			</Container>
		</main>
	);
}
