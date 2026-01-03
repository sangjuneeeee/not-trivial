// src/app/(auth)/login/page.tsx
import { Container } from "@/components/layout/Container";
import AppHeader from "@/components/layout/AppHeader";
import LoginForm from "@/app/_components/LoginForm";

export default function LoginPage() {
	return (
		<main className='min-h-dvh bg-zinc-50 text-zinc-900'>
			<AppHeader />
			<Container className='py-8'>
				<LoginForm />
			</Container>
		</main>
	);
}
