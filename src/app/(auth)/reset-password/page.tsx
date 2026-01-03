// src/app/(auth)/reset-password/page.tsx
import { Container } from "@/components/layout/Container";
import AppHeader from "@/components/layout/AppHeader";
import ResetPasswordForm from "@/app/_components/ResetPasswordForm";

export default function ResetPasswordPage() {
	return (
		<main className='min-h-dvh bg-zinc-50 text-zinc-900'>
			<AppHeader />
			<Container className='py-8'>
				<ResetPasswordForm />
			</Container>
		</main>
	);
}
