// src/server/openapi.ts
import type { OpenAPIV3 } from "openapi-types";

/**
 * OpenAPI 스펙은 "내 API의 계약서"입니다.
 * - 라우트/요청/응답 형식을 여기에 고정해두면
 *   프론트/테스트/협업이 엄청 편해집니다.
 *
 * 인증 방식(쿠키 기반 세션):
 * - 실제로는 Cookie: nt_session=... 로 인증합니다.
 * - OpenAPI에서는 cookie auth를 표현할 수 있어서 그대로 문서화합니다.
 */
export const openapi: OpenAPIV3.Document = {
	openapi: "3.0.3",
	info: {
		title: "not-trivial API",
		version: "0.1.0",
		description: "비교/경쟁을 최소화한 익명 기반 칭찬 게시판 API 문서입니다.",
	},
	servers: [{ url: "http://localhost:3000", description: "Local" }],
	components: {
		securitySchemes: {
			SessionCookie: {
				type: "apiKey",
				in: "cookie",
				name: "nt_session",
				description:
					"로그인 시 설정되는 세션 쿠키(nt_session). 대부분의 보호된 API는 이 쿠키가 필요합니다.",
			},
		},
		schemas: {
			ErrorResponse: {
				type: "object",
				properties: { message: { type: "string" } },
			},

			EmotionTag: {
				type: "string",
				enum: ["CALM", "ENDURE", "TIRED", "THANKFUL", "PROUD", "ANXIOUS", "UNSURE"],
			},
			PraiseType: {
				type: "string",
				enum: ["EMPATHY", "WELL_DONE", "COURAGE", "CONSISTENCY", "HEART"],
			},

			CreatePostInput: {
				type: "object",
				required: ["title", "body", "emotionTag"],
				properties: {
					title: { type: "string", minLength: 1, maxLength: 60 },
					body: { type: "string", minLength: 1, maxLength: 2000 },
					emotionTag: { $ref: "#/components/schemas/EmotionTag" },
				},
			},

			UpdatePostInput: {
				type: "object",
				properties: {
					title: { type: "string", minLength: 1, maxLength: 60 },
					body: { type: "string", minLength: 1, maxLength: 2000 },
					emotionTag: { $ref: "#/components/schemas/EmotionTag" },
				},
				description: "title/body/emotionTag 중 최소 1개는 필요합니다.",
			},

			PostSummary: {
				type: "object",
				properties: {
					id: { type: "string" },
					title: { type: "string" },
					body: { type: "string" },
					emotionTag: { $ref: "#/components/schemas/EmotionTag" },
					createdAt: { type: "string", format: "date-time" },
					author: {
						type: "object",
						properties: {
							id: { type: "string" },
							nickname: { type: "string" },
						},
					},
				},
			},

			PostDetail: {
				type: "object",
				properties: {
					id: { type: "string" },
					title: { type: "string" },
					body: { type: "string" },
					emotionTag: { $ref: "#/components/schemas/EmotionTag" },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
					authorId: { type: "string" },
					author: {
						type: "object",
						properties: {
							id: { type: "string" },
							nickname: { type: "string" },
						},
					},
				},
			},

			CreatePraiseInput: {
				type: "object",
				required: ["type"],
				properties: {
					type: { $ref: "#/components/schemas/PraiseType" },
				},
			},

			NotificationItem: {
				type: "object",
				properties: {
					postId: { type: "string" },
					typesJson: { type: "array", items: { $ref: "#/components/schemas/PraiseType" } },
					updatedAt: { type: "string", format: "date-time" },
					seenAt: { type: "string", format: "date-time", nullable: true },
					post: {
						type: "object",
						nullable: true,
						properties: { title: { type: "string" } },
					},
				},
			},

			UpdateNicknameInput: {
				type: "object",
				required: ["nickname"],
				properties: {
					nickname: { type: "string", minLength: 2, maxLength: 20 },
				},
			},

			UpdatePasswordInput: {
				type: "object",
				required: ["currentPassword", "newPassword", "newPasswordConfirm"],
				properties: {
					currentPassword: { type: "string", minLength: 8 },
					newPassword: { type: "string", minLength: 8 },
					newPasswordConfirm: { type: "string", minLength: 8 },
				},
			},
		},
	},

	paths: {
		"/api/posts": {
			get: {
				summary: "게시글 목록",
				description: "soft delete(deletedAt)된 글은 제외됩니다.",
				parameters: [
					{
						name: "take",
						in: "query",
						schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
					},
					{
						name: "cursor",
						in: "query",
						schema: { type: "string", nullable: true },
					},
				],
				responses: {
					"200": {
						description: "OK",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										items: { type: "array", items: { $ref: "#/components/schemas/PostSummary" } },
										nextCursor: { type: "string", nullable: true },
									},
								},
							},
						},
					},
				},
			},

			post: {
				summary: "게시글 작성",
				security: [{ SessionCookie: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": { schema: { $ref: "#/components/schemas/CreatePostInput" } },
					},
				},
				responses: {
					"201": {
						description: "Created",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: { ok: { type: "boolean" }, postId: { type: "string" } },
								},
							},
						},
					},
					"401": { description: "Unauthorized" },
				},
			},
		},

		"/api/posts/{id}": {
			get: {
				summary: "게시글 단건 조회",
				parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
				responses: {
					"200": {
						description: "OK",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: { post: { $ref: "#/components/schemas/PostDetail" } },
								},
							},
						},
					},
					"404": { description: "Not Found" },
				},
			},

			patch: {
				summary: "게시글 수정(작성자 + 30분 내)",
				security: [{ SessionCookie: [] }],
				parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
				requestBody: {
					required: true,
					content: {
						"application/json": { schema: { $ref: "#/components/schemas/UpdatePostInput" } },
					},
				},
				responses: {
					"200": { description: "OK" },
					"401": { description: "Unauthorized" },
					"403": { description: "Forbidden" },
					"404": { description: "Not Found" },
				},
			},

			delete: {
				summary: "게시글 삭제(soft delete)",
				security: [{ SessionCookie: [] }],
				parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
				responses: {
					"200": { description: "OK" },
					"401": { description: "Unauthorized" },
					"403": { description: "Forbidden" },
					"404": { description: "Not Found" },
				},
			},
		},

		"/api/posts/{id}/praise": {
			post: {
				summary: "게시글 칭찬하기(게시글당 1회 + 일일 제한)",
				security: [{ SessionCookie: [] }],
				parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
				requestBody: {
					required: true,
					content: {
						"application/json": { schema: { $ref: "#/components/schemas/CreatePraiseInput" } },
					},
				},
				responses: {
					"201": { description: "Created" },
					"401": { description: "Unauthorized" },
					"409": { description: "Already praised" },
					"429": { description: "Daily limit exceeded" },
				},
			},
		},

		"/api/me/notifications": {
			get: {
				summary: "내 알림 목록(받은 칭찬)",
				security: [{ SessionCookie: [] }],
				responses: {
					"200": {
						description: "OK",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										items: {
											type: "array",
											items: { $ref: "#/components/schemas/NotificationItem" },
										},
									},
								},
							},
						},
					},
					"401": { description: "Unauthorized" },
				},
			},
		},

		"/api/me/notifications/seen": {
			post: {
				summary: "알림 읽음 처리(게시글 단위)",
				security: [{ SessionCookie: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["postId"],
								properties: { postId: { type: "string" } },
							},
						},
					},
				},
				responses: { "200": { description: "OK" }, "401": { description: "Unauthorized" } },
			},
		},

		"/api/me/settings/nickname": {
			post: {
				summary: "닉네임 변경",
				security: [{ SessionCookie: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": { schema: { $ref: "#/components/schemas/UpdateNicknameInput" } },
					},
				},
				responses: { "200": { description: "OK" }, "401": { description: "Unauthorized" } },
			},
		},

		"/api/me/settings/password": {
			post: {
				summary: "비밀번호 변경(성공 시 전체 세션 로그아웃)",
				security: [{ SessionCookie: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": { schema: { $ref: "#/components/schemas/UpdatePasswordInput" } },
					},
				},
				responses: { "200": { description: "OK" }, "401": { description: "Unauthorized" } },
			},
		},
	},
};
