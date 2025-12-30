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
		<div className='box'>
			<h1>글 쓰기</h1>
			<p>오늘의 작은 성취, 버텨낸 하루를 적어주세요.</p>

			{serverMsg && <div className='notice'>{serverMsg}</div>}

			<form onSubmit={handleSubmit(onSubmit)}>
				<div>
					<label>감정 태그</label>
					<select {...register("emotionTag")} style={{ padding: 8, borderRadius: 4 }}>
						{options.map((v) => (
							<option key={v} value={v}>
								{EMOTION_LABEL[v] ?? v}
							</option>
						))}
					</select>
					{errors.emotionTag && <div className='error'>{errors.emotionTag.message}</div>}
				</div>

				<div>
					<label>제목</label>
					<input {...register("title")} />
					{errors.title && <div className='error'>{errors.title.message}</div>}
				</div>

				<div>
					<label>본문</label>
					<textarea
						{...register("body")}
						rows={8}
						style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
					/>
					{errors.body && <div className='error'>{errors.body.message}</div>}
				</div>

				<button className='primary' disabled={isSubmitting}>
					{isSubmitting ? "작성 중..." : "작성하기"}
				</button>
			</form>
		</div>
	);
}
