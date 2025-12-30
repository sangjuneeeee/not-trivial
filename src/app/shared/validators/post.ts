// src/app/shared/validators/post.ts
import { z } from "zod";

/**
 * Prisma enum(EmotionTag)과 맞춰야 합니다.
 * - schema.prisma의 EmotionTag 값과 1:1로 동일
 */
export const emotionTagEnum = z.enum([
	"CALM",
	"ENDURE",
	"TIRED",
	"THANKFUL",
	"PROUD",
	"ANXIOUS",
	"UNSURE",
]);

export const createPostSchema = z.object({
	title: z.string().min(1, "제목을 입력해주세요.").max(60, "제목은 60자 이내입니다."),
	body: z.string().min(1, "본문을 입력해주세요.").max(2000, "본문은 2000자 이내입니다."),
	emotionTag: emotionTagEnum,
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = z
	.object({
		title: z.string().min(1).max(60).optional(),
		body: z.string().min(1).max(2000).optional(),
		emotionTag: emotionTagEnum.optional(),
	})
	.refine((v) => v.title !== undefined || v.body !== undefined || v.emotionTag !== undefined, {
		message: "수정할 내용을 최소 1개 이상 보내야 합니다.",
	});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
