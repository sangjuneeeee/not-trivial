// src/app/_components/PostActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EMOTION_LABEL } from "@/app/shared/emotion";
import { emotionTagEnum } from "@/app/shared/validators/post";

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

		router.replace("/posts");
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
		<div className='box'>
			<h1>내 글 관리</h1>
			<p>작성자만 보이는 영역입니다. (수정은 작성 후 30분 이내)</p>

			{msg && <div className='notice'>{msg}</div>}

			{mode === "view" ? (
				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					<button onClick={() => setMode("edit")}>수정</button>
					<button onClick={onDelete} disabled={busy}>
						{busy ? "처리 중..." : "삭제"}
					</button>
				</div>
			) : (
				<div style={{ display: "grid", gap: 10 }}>
					<div>
						<label>감정 태그</label>
						<select
							value={emotionTag}
							onChange={(e) => setEmotionTag(e.target.value)}
							style={{ padding: 8, borderRadius: 4 }}
						>
							{options.map((v) => (
								<option key={v} value={v}>
									{EMOTION_LABEL[v] ?? v}
								</option>
							))}
						</select>
					</div>

					<div>
						<label>제목</label>
						<input value={title} onChange={(e) => setTitle(e.target.value)} />
					</div>

					<div>
						<label>본문</label>
						<textarea
							value={body}
							onChange={(e) => setBody(e.target.value)}
							rows={8}
							style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
						/>
					</div>

					<div style={{ display: "flex", gap: 8 }}>
						<button className='primary' onClick={onSave} disabled={busy}>
							{busy ? "저장 중..." : "저장"}
						</button>
						<button onClick={() => setMode("view")} disabled={busy}>
							취소
						</button>
					</div>

					<div className='help'>
						현재 감정: <b>{EMOTION_LABEL[emotionTag] ?? emotionTag}</b>
					</div>
				</div>
			)}
		</div>
	);
}
