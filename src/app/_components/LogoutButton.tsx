// src/app/_components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
	const router = useRouter();

	const onLogout = async () => {
		const res = await fetch("/api/auth/logout", { method: "POST" });
		if (!res.ok) {
			alert("로그아웃 실패");
			return;
		}
		router.refresh();
	};

	return (
		<button className='btn danger' onClick={onLogout}>
			로그아웃
		</button>
	);
}
