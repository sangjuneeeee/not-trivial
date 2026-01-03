// src/app/(auth)/signup/page.tsx
import { Container } from "@/components/layout/Container";
import AppHeader from "@/components/layout/AppHeader";
import SignupForm from "@/app/_components/SignupForm";

export default function SignupPage() {
	return (
		<main className='min-h-dvh bg-zinc-50 text-zinc-900'>
			<AppHeader />
			<Container className='py-8'>
				<SignupForm />
			</Container>
		</main>
	);
}
