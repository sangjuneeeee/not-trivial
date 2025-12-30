// src/app/docs/page.tsx
import Link from "next/link";
import SwaggerClient from "./SwaggerClient";

export default function DocsPage() {
	return (
		<div className='container'>
			<header>
				<h1>API Docs</h1>
				<nav>
					<Link href='/'>홈</Link>
					<Link href='/posts'>게시글</Link>
					<Link href='/me'>마이페이지</Link>
				</nav>
			</header>

			<SwaggerClient />
		</div>
	);
}
