// src/app/_components/PostActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EMOTION_LABEL } from "@/app/shared/emotion";
import { emotionTagEnum } from "@/app/shared/validators/post";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Props = {
	postId: string;
	initial: { title: string; body: string; emotionTag: string };
};

export default function PostActions({ postId, initial }: Props) {
	const router = useRouter();
	const [mode, setMode] = useState<"view" | "edit">("view");
	const [title, setTitle] = useState(initial.title);
	const [body, setBody] = useState(initial.body);
	const [emotionTag, setEmotionTag] = useState(initial.emotionTag);
	const [msg, setMsg] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const options = emotionTagEnum.options;

	const onDelete = async () => {
		if (!confirm("삭제할까요? (soft delete)")) return;
		setBusy(true);
		setMsg(null);

		const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
		const data = await res.json().catch(() => ({}));

		setBusy(false);

		if (!res.ok) {
			setMsg(data?.message ?? "삭제 실패");
			return;
		}

		router.replace("/");
		router.refresh();
	};

	const onSave = async () => {
		setBusy(true);
		setMsg(null);

		const res = await fetch(`/api/posts/${postId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title, body, emotionTag }),
		});

		const data = await res.json().catch(() => ({}));
		setBusy(false);

		if (!res.ok) {
			setMsg(data?.message ?? "수정 실패");
			return;
		}

		setMode("view");
		router.refresh();
	};

	return (
		<Card className='border-amber-100 bg-gradient-to-br from-amber-50/50 to-amber-50/30'>
			<div className='mb-4'>
				<h2 className='text-lg font-semibold mb-1 text-zinc-900'>내 글 관리</h2>
				<p className='text-xs text-zinc-600'>
					작성자만 보이는 영역입니다. 수정은 작성 후 30분 이내에만 가능합니다.
				</p>
			</div>

			{msg && (
				<div
					className={`mb-4 p-3 rounded-xl border text-sm ${
						msg.includes("실패") || msg.includes("오류")
							? "bg-red-50 border-red-200 text-red-700"
							: "bg-green-50 border-green-200 text-green-700"
					}`}
				>
					{msg}
				</div>
			)}

			{mode === "view" ? (
				<div className='flex gap-3 flex-wrap'>
					<Button onClick={() => setMode("edit")} variant='secondary'>
						수정
					</Button>
					<Button
						onClick={onDelete}
						disabled={busy}
						variant='ghost'
						className='text-zinc-600 hover:text-zinc-900'
					>
						{busy ? "처리 중..." : "삭제"}
					</Button>
				</div>
			) : (
				<div className='space-y-6'>
					<Field label='감정 태그'>
						<select
							value={emotionTag}
							onChange={(e) => setEmotionTag(e.target.value)}
							className='w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200'
						>
							{options.map((v) => (
								<option key={v} value={v}>
									{EMOTION_LABEL[v] ?? v}
								</option>
							))}
						</select>
					</Field>

					<Field label='제목' hint='최대 60자'>
						<Input value={title} onChange={(e) => setTitle(e.target.value)} />
					</Field>

					<Field label='본문' hint='최대 2000자'>
						<textarea
							value={body}
							onChange={(e) => setBody(e.target.value)}
							rows={10}
							className='w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 resize-none'
						/>
					</Field>

					<div className='flex gap-3 pt-2'>
						<Button onClick={onSave} disabled={busy} className='flex-1'>
							{busy ? "저장 중..." : "저장"}
						</Button>
						<Button onClick={() => setMode("view")} disabled={busy} variant='secondary'>
							취소
						</Button>
					</div>

					<div className='pt-4 border-t border-zinc-200'>
						<p className='text-xs text-zinc-500 flex items-center gap-2'>
							현재 감정: <Badge>{EMOTION_LABEL[emotionTag] ?? emotionTag}</Badge>
						</p>
					</div>
				</div>
			)}
		</Card>
	);
}
