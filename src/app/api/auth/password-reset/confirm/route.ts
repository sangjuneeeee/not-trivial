import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/app/shared/validators/auth";
import { resetPassword } from "@/app/server/services/password-reset.service";

export async function POST(req: Request) {
	try {
		const json = await req.json();
		const input = resetPasswordSchema.parse(json);

		const result = await resetPassword(input);
		if (!result.ok) {
			return NextResponse.json({ message: result.message }, { status: result.status });
		}

		return NextResponse.json({ message: "비밀번호가 변경되었습니다." }, { status: 200 });
	} catch (e) {
		console.error(e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}
