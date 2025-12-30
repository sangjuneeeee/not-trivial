import { NextResponse } from "next/server";
import { signupSchema } from "@/app/shared/validators/auth";
import { signup } from "@/server/services/auth.service";

/**
 * POST /api/auth/signup
 *
 * Thin Controller 패턴:
 * - 입력 검증(스키마) + 서비스 호출 + 응답만 담당합니다.
 */
export async function POST(req: Request) {
	try {
		// 1) 입력 JSON 읽기
		const json = await req.json();

		// 2) 공통 스키마로 검증 + 타입 확정(여기서부터 input은 신뢰 가능한 데이터)
		const input = signupSchema.parse(json);

		// 3) 비즈니스 로직
		const result = await signup(input);

		// 4) 응답
		if (!result.ok) {
			return NextResponse.json({ message: result.message }, { status: result.status });
		}

		return NextResponse.json({ user: result.user }, { status: result.status });
	} catch (e) {
		// TODO: zod 에러를 사용자 친화적으로 변환하고 싶으면 여기서 처리
		console.error(e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}
