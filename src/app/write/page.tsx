// src/app/write/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/get-current-user";
import { Container } from "@/components/layout/Container";
import AppHeader from "@/components/layout/AppHeader";
import PostComposer from "@/app/_components/PostComposer";

export default async function WritePage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");

	return (
		<main className='min-h-dvh bg-zinc-50 text-zinc-900'>
			<AppHeader />
			<Container className='py-8'>
				<PostComposer />
			</Container>
		</main>
	);
}
