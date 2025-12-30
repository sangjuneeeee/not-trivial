import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getMe } from "@/server/auth/auth.service";

export async function GET() {
	try {
		const token = (await cookies()).get("nt_session")?.value;
		if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

		const result = await getMe(token);
		if (!result.ok) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

		return NextResponse.json({ user: result.user }, { status: 200 });
	} catch (e) {
		console.error(e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}
