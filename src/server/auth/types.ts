/**
 * 서버에서 "로그인 사용자"를 표현하는 최소 타입
 * - UI/권한 체크에 필요한 필드만 포함
 */
export type CurrentUser = {
	id: string;
	email: string;
	username: string;
	nickname: string;
	createdAt: Date;
};
