// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let _prisma: PrismaClient | null = null;

function getClient() {
	if (_prisma) return _prisma;

	const url = process.env.DATABASE_URL;
	if (!url) {
		// 빌드 중 import 단계에서 죽지 않게 하려면 여기서 throw를 안 하고 싶겠지만,
		// 실제 런타임에서 DB 없으면 어차피 동작 불가라 명확히 에러를 내는 게 낫습니다.
		throw new Error("DATABASE_URL is not defined");
	}

	const pool = new Pool({ connectionString: url });
	const adapter = new PrismaPg(pool);

	_prisma = new PrismaClient({ adapter });
	return _prisma;
}

/**
 * ✅ 기존 코드 변경 0을 위해 prisma.user... 형태 유지
 * - import 되는 순간에는 DB 초기화 안 함
 * - 실제로 prisma의 프로퍼티에 접근하는 순간에만 초기화
 */
export const prisma = new Proxy({} as PrismaClient, {
	get(_target, prop) {
		const client = getClient();
		const value = (client as any)[prop];
		return typeof value === "function" ? value.bind(client) : value;
	},
});
