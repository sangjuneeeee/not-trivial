import crypto from "crypto";

/**
 * 보안 토큰을 DB에 저장할 때 사용하는 해시 함수
 * - session token
 * - password reset token
 * 공통 사용
 */
export function hashToken(token: string) {
	return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateToken(bytes = 32) {
	return crypto.randomBytes(bytes).toString("hex");
}
