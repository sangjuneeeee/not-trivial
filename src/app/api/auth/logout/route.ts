import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logout } from "@/server/services/auth.service";

export async function POST() {
	try {
		const token = (await cookies()).get("nt_session")?.value;
		if (token) await logout(token);

		(await cookies()).set({
			name: "nt_session",
			value: "",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			expires: new Date(0),
		});

		return NextResponse.json({ ok: true }, { status: 200 });
	} catch (e) {
		console.error(e);
		return NextResponse.json({ message: "서버 오류" }, { status: 500 });
	}
}
