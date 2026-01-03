// src/app/_components/LogoutButton.tsx
"use client";

import { Button } from "@/components/ui/Button";

export default function LogoutButton() {
	const logout = async () => {
		await fetch("/api/auth/logout", { method: "POST" });
		location.href = "/";
	};

	return (
		<Button variant='ghost' size='sm' onClick={logout}>
			로그아웃
		</Button>
	);
}
