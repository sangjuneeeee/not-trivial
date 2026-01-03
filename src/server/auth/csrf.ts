// src/server/auth/csrf.ts
import { NextResponse } from "next/server";

/**
 * CSRF 방어(간단 버전)
 * - 브라우저는 크로스사이트 요청에도 쿠키를 실어 보낼 수 있어서 CSRF가 생깁니다.
 * - 그래서 "상태 변경 요청"은 반드시 same-origin에서만 오도록 막습니다.
 *
 * 체크 기준:
 * 1) Origin 헤더가 있으면, 우리 사이트 origin과 정확히 일치해야 함
 * 2) Origin이 없으면(일부 환경), Referer로 fallback (가능하면)
 *
 * 주의:
 * - 이 함수는 POST/PUT/PATCH/DELETE 라우트의 맨 위에서 호출하세요.
 */
export function assertSameOrigin(req: Request) {
	const origin = req.headers.get("origin"); // 예: https://not-trivial.vercel.app
	const referer = req.headers.get("referer"); // 예: https://not-trivial.vercel.app/me

	// 서버가 허용하는 기준 origin
	// APP_URL은 "https://도메인" 형태여야 합니다. (로컬은 http://localhost:3000)
	const allowedOrigin = process.env.APP_URL;

	if (!allowedOrigin) {
		// APP_URL이 없다면 안전하게 막는게 좋지만, 개발 편의상 통과시키고 싶으면 여기서 return null
		return NextResponse.json({ message: "APP_URL is not set" }, { status: 500 });
	}

	// 1) Origin이 있으면 가장 신뢰
	if (origin) {
		if (origin !== allowedOrigin) {
			return NextResponse.json({ message: "CSRF blocked (bad origin)" }, { status: 403 });
		}
		return null;
	}

	// 2) Origin이 없으면 Referer로 확인 (완전하지는 않지만 현실적으로 도움 됨)
	if (referer) {
		try {
			const refOrigin = new URL(referer).origin;
			if (refOrigin !== allowedOrigin) {
				return NextResponse.json({ message: "CSRF blocked (bad referer)" }, { status: 403 });
			}
			return null;
		} catch {
			return NextResponse.json({ message: "CSRF blocked (invalid referer)" }, { status: 403 });
		}
	}

	// 3) 둘 다 없으면 판단 불가 → 안전하게 차단(권장)
	return NextResponse.json({ message: "CSRF blocked (missing origin)" }, { status: 403 });
}
