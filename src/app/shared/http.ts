// src/app/shared/http.ts
export async function readJsonSafe(res: Response) {
	try {
		return await res.json();
	} catch {
		return {};
	}
}

export function mapAuthErrorMessage(res: Response, data: any) {
	if (res.status === 429)
		return data?.message ?? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
	if (res.status === 401) return data?.message ?? "아이디 또는 비밀번호가 올바르지 않습니다.";
	return data?.message ?? "요청 처리 중 오류가 발생했습니다.";
}
