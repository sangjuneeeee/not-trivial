// src/app/server/services/auth.service.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { LoginInput, SignupInput } from "@/app/shared/validators/auth";

/**
 * 서비스 레이어:
 * - HTTP(route.ts)에서 분리된 비즈니스 로직
 * - 재사용/테스트/확장이 쉬워집니다.
 */

function makeRandomNickname() {
	const a = ["조용한", "담담한", "꾸준한", "용감한", "따뜻한", "성실한"];
	const b = ["고양이", "강아지", "여우", "수달", "곰", "토끼", "펭귄"];
	const n = Math.floor(Math.random() * 9000) + 1000;
	return `${a[Math.floor(Math.random() * a.length)]}${b[Math.floor(Math.random() * b.length)]}${n}`;
}

function sha256(text: string) {
	return crypto.createHash("sha256").update(text).digest("hex");
}

function makeSessionToken() {
	return crypto.randomBytes(32).toString("hex");
}

// 세션 유효 기간 (30일)
const SESSION_DAYS = 30;

export async function signup(input: SignupInput) {
	const exists = await prisma.user.findFirst({
		where: { OR: [{ email: input.email }, { username: input.username }] },
		select: { id: true },
	});
	if (exists) {
		return { ok: false as const, status: 409, message: "이미 사용 중인 이메일 또는 아이디입니다." };
	}

	const passwordHash = await bcrypt.hash(input.password, 12);

	const user = await prisma.user.create({
		data: {
			email: input.email,
			username: input.username,
			passwordHash,
			nickname: makeRandomNickname(),
			badgeLevel: "SEED",
		},
		select: {
			id: true,
			email: true,
			username: true,
			nickname: true,
			badgeLevel: true,
			createdAt: true,
		},
	});

	return { ok: true as const, status: 201, user };
}

export async function login(input: LoginInput) {
	const user = await prisma.user.findUnique({
		where: { username: input.username },
		select: {
			id: true,
			email: true,
			username: true,
			nickname: true,
			passwordHash: true,
		},
	});

	if (!user) {
		return {
			ok: false as const,
			status: 401,
			message: "아이디 또는 비밀번호가 올바르지 않습니다.",
		};
	}

	const okPw = await bcrypt.compare(input.password, user.passwordHash);
	if (!okPw) {
		return {
			ok: false as const,
			status: 401,
			message: "아이디 또는 비밀번호가 올바르지 않습니다.",
		};
	}

	const token = makeSessionToken();
	const tokenHash = sha256(token);

	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

	await prisma.session.create({
		data: { userId: user.id, tokenHash, expiresAt },
	});

	const safeUser = {
		id: user.id,
		email: user.email,
		username: user.username,
		nickname: user.nickname,
	};

	return { ok: true as const, status: 200, token, expiresAt, user: safeUser };
}

export async function getMe(sessionToken: string) {
	const tokenHash = sha256(sessionToken);

	const session = await prisma.session.findUnique({
		where: { tokenHash },
		select: {
			expiresAt: true,
			user: { select: { id: true, email: true, username: true, nickname: true, badgeLevel: true } },
		},
	});

	if (!session) return { ok: false as const, status: 401 };

	if (session.expiresAt < new Date()) {
		// 만료 세션은 즉시 삭제
		await prisma.session.delete({ where: { tokenHash } }).catch(() => {});
		return { ok: false as const, status: 401 };
	}

	return { ok: true as const, status: 200, user: session.user };
}

export async function logout(sessionToken: string) {
	const tokenHash = sha256(sessionToken);
	await prisma.session.delete({ where: { tokenHash } }).catch(() => {});
	return { ok: true as const };
}
