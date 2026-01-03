// src/app/(auth)/forgot-password/page.tsx
import { Container } from "@/components/layout/Container";
import AppHeader from "@/components/layout/AppHeader";
import ForgotPasswordForm from "@/app/_components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
	return (
		<main className='min-h-dvh bg-zinc-50 text-zinc-900'>
			<AppHeader />
			<Container className='py-8'>
				<ForgotPasswordForm />
			</Container>
		</main>
	);
}
