import { z } from "zod";

/**
 * 회원가입 입력 규격(단일 진실 공급원)
 * - 프론트: 폼 검증
 * - 백엔드: 요청 검증
 * - 타입: z.infer로 자동 생성
 */
export const signupSchema = z
	.object({
		email: z.string().email("이메일 형식이 올바르지 않습니다."),
		username: z
			.string()
			.min(3, "아이디는 3자 이상이어야 합니다.")
			.max(20, "아이디는 20자 이하여야 합니다."),
		password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
		passwordConfirm: z.string().min(6, "비밀번호 확인은 6자 이상이어야 합니다."),
	})
	.refine((v) => v.password === v.passwordConfirm, {
		path: ["passwordConfirm"],
		message: "비밀번호가 일치하지 않습니다.",
	});

export type SignupInput = z.infer<typeof signupSchema>;
/**
 * 로그인 입력 규격(단일 진실 공급원)
 * - 프론트: 폼 검증
 * - 백엔드: 요청 검증
 * - 타입: z.infer로 자동 생성
 */
export const loginSchema = z.object({
	username: z.string().min(3).max(20),
	password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const requestPasswordResetSchema = z.object({
	email: z.string().email("이메일 형식이 올바르지 않습니다."),
});
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const resetPasswordSchema = z
	.object({
		token: z.string().min(20, "토큰이 올바르지 않습니다."),
		password: z.string().min(8),
		passwordConfirm: z.string().min(8),
	})
	.refine((v) => v.password === v.passwordConfirm, {
		path: ["passwordConfirm"],
		message: "비밀번호가 일치하지 않습니다.",
	});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
