// src/app/write/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/server/auth/get-current-user";
import PostComposer from "@/app/_components/PostComposer";

export default async function WritePage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");

	return (
		<div className='container'>
			<header>
				<h1>글 쓰기</h1>
				<nav>
					<Link href='/'>홈</Link>
					<Link href='/posts'>목록</Link>
				</nav>
			</header>

			<PostComposer />
		</div>
	);
}
