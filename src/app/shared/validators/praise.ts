// src/app/shared/validators/praise.ts
import { z } from "zod";

export const praiseTypeEnum = z.enum(["EMPATHY", "WELL_DONE", "COURAGE", "CONSISTENCY", "HEART"]);

export type PraiseTypeInput = z.infer<typeof praiseTypeEnum>;

export const createPraiseSchema = z.object({
	type: praiseTypeEnum,
});

export type CreatePraiseInput = z.infer<typeof createPraiseSchema>;
