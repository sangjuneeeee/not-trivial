// src/app/server/services/request-meta.ts
export function getClientIp(req: Request) {
	// Vercel/프록시 환경에서 일반적으로 x-forwarded-for에 들어옵니다.
	const xff = req.headers.get("x-forwarded-for");
	if (xff) return xff.split(",")[0]?.trim() ?? "unknown";
	return req.headers.get("x-real-ip") ?? "unknown";
}
