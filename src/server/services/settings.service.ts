// src/app/server/services/settings.service.ts
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UpdateNicknameInput, UpdatePasswordInput } from "@/app/shared/validators/settings";

/**
 * 닉네임 변경
 * - 닉네임은 unique가 아니므로 충돌 체크 불필요(원하면 unique로 바꿀 수도 있음)
 */
export async function updateNickname(userId: string, input: UpdateNicknameInput) {
	await prisma.user.update({
		where: { id: userId },
		data: { nickname: input.nickname },
	});

	return { ok: true as const };
}

/**
 * 비밀번호 변경
 * - 현재 비밀번호 확인
 * - 변경 성공 시: 보안 강화로 "모든 세션 로그아웃" 권장
 */
export async function updatePasswordAndLogoutAllSessions(
	userId: string,
	input: UpdatePasswordInput
) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { passwordHash: true },
	});

	if (!user) {
		return { ok: false as const, status: 404, message: "사용자를 찾을 수 없습니다." };
	}

	const ok = await bcrypt.compare(input.currentPassword, user.passwordHash);
	if (!ok) {
		return { ok: false as const, status: 401, message: "현재 비밀번호가 올바르지 않습니다." };
	}

	const newHash = await bcrypt.hash(input.newPassword, 12);

	await prisma.$transaction([
		prisma.user.update({
			where: { id: userId },
			data: { passwordHash: newHash },
		}),
		// ✅ 보안 강화: 비밀번호 변경 시 모든 세션 무효화
		prisma.session.deleteMany({
			where: { userId },
		}),
	]);

	return { ok: true as const };
}
