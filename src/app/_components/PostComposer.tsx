// src/app/_components/PostComposer.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	createPostSchema,
	type CreatePostInput,
	emotionTagEnum,
} from "@/app/shared/validators/post";
import { EMOTION_LABEL } from "@/app/shared/emotion";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function PostComposer() {
	const router = useRouter();
	const [serverMsg, setServerMsg] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CreatePostInput>({
		resolver: zodResolver(createPostSchema),
		defaultValues: { title: "", body: "", emotionTag: "CALM" },
	});

	const onSubmit = async (values: CreatePostInput) => {
		setServerMsg(null);

		const res = await fetch("/api/posts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(values),
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			setServerMsg(data?.message ?? "작성 실패");
			return;
		}

		// 생성 성공 -> 상세로 이동
		const postId = data?.postId;
		if (postId) router.replace(`/posts/${postId}`);
		else router.replace("/posts");
		router.refresh();
	};

	const options = emotionTagEnum.options;

	return (
		<Card className='max-w-2xl mx-auto'>
			<div className='mb-6'>
				<h1 className='text-2xl font-semibold mb-2'>글 쓰기</h1>
				<p className='text-sm text-zinc-600'>오늘의 작은 성취, 버텨낸 하루를 적어주세요.</p>
			</div>

			{serverMsg && (
				<div className='mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700'>
					{serverMsg}
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
				<Field label='감정 태그' error={errors.emotionTag?.message}>
					<select
						{...register("emotionTag")}
						className='w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200'
					>
						{options.map((v) => (
							<option key={v} value={v}>
								{EMOTION_LABEL[v] ?? v}
							</option>
						))}
					</select>
				</Field>

				<Field label='제목' error={errors.title?.message} hint='최대 60자'>
					<Input
						{...register("title")}
						placeholder='오늘의 이야기를 간단히 적어주세요'
						error={errors.title?.message}
					/>
				</Field>

				<Field label='본문' error={errors.body?.message} hint='최대 2000자'>
					<textarea
						{...register("body")}
						rows={10}
						placeholder='자유롭게 적어주세요. 작은 성취도, 버텨낸 하루도 모두 소중합니다.'
						className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 resize-none ${
							errors.body
								? "border-red-300 focus:ring-red-200"
								: "border-zinc-200 focus:ring-zinc-200"
						}`}
					/>
				</Field>

				<div className='flex gap-3 pt-2'>
					<Button type='submit' disabled={isSubmitting} className='flex-1' size='lg'>
						{isSubmitting ? "작성 중..." : "작성하기"}
					</Button>
				</div>
			</form>
		</Card>
	);
}
