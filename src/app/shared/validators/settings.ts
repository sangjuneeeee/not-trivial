// src/app/shared/validators/settings.ts
import { z } from "zod";

/**
 * 닉네임 정책(가볍게)
 * - 너무 빡세게 하면 피곤해짐
 * - 대신 최소/최대와 공백 트림 정도만
 */
export const updateNicknameSchema = z.object({
	nickname: z
		.string()
		.trim()
		.min(2, "닉네임은 2자 이상이어야 합니다.")
		.max(20, "닉네임은 20자 이내여야 합니다."),
});

export type UpdateNicknameInput = z.infer<typeof updateNicknameSchema>;

/**
 * 비밀번호 정책
 * - 지금 프로젝트 auth validator랑 맞춰도 되고
 * - 여기서만 정의해도 됨
 */
export const updatePasswordSchema = z
	.object({
		currentPassword: z.string().min(8, "현재 비밀번호를 입력해주세요."),
		newPassword: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다."),
		newPasswordConfirm: z.string().min(8, "새 비밀번호 확인을 입력해주세요."),
	})
	.refine((v) => v.newPassword === v.newPasswordConfirm, {
		message: "새 비밀번호가 일치하지 않습니다.",
		path: ["newPasswordConfirm"],
	});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
