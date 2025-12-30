// src/app/server/auth/get-current-user.ts
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { hashToken } from "@/server/auth/token";

export async function getCurrentUser() {
	const store = await cookies();
	const raw = store.get("nt_session")?.value;
	if (!raw) return null;

	const tokenHash = hashToken(raw);

	const session = await prisma.session.findUnique({
		where: { tokenHash },
		select: {
			expiresAt: true,
			user: { select: { id: true, username: true, email: true, nickname: true } },
		},
	});

	if (!session) return null;

	if (session.expiresAt < new Date()) {
		await prisma.session.delete({ where: { tokenHash } }).catch(() => {});
		return null;
	}

	return session.user;
}
