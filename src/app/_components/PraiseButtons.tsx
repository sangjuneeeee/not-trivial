// src/app/_components/PraiseButtons.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRAISE_LABEL: Record<string, string> = {
	EMPATHY: "공감돼요",
	WELL_DONE: "잘해내셨어요",
	COURAGE: "용기 있었어요",
	CONSISTENCY: "꾸준함이 느껴져요",
	HEART: "마음이 느껴져요",
};

const PRAISE_TYPES = Object.keys(PRAISE_LABEL);

export default function PraiseButtons({ postId }: { postId: string }) {
	const router = useRouter();
	const [msg, setMsg] = useState<string | null>(null);
	const [busy, setBusy] = useState<string | null>(null);

	const send = async (type: string) => {
		setMsg(null);
		setBusy(type);

		const res = await fetch(`/api/posts/${postId}/praise`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ type }),
		});

		const data = await res.json().catch(() => ({}));
		setBusy(null);

		if (!res.ok) {
			setMsg(data?.message ?? "칭찬 실패");
			return;
		}

		setMsg("칭찬이 전달되었습니다.");
		router.refresh();
	};

	return (
		<div className='box'>
			<h1 style={{ marginTop: 0 }}>칭찬하기</h1>
			<p>한 게시글에는 1번만 칭찬할 수 있어요. (그리고 하루 횟수 제한이 있습니다)</p>

			<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
				{PRAISE_TYPES.map((t) => (
					<button key={t} onClick={() => send(t)} disabled={!!busy}>
						{busy === t ? "전송 중..." : PRAISE_LABEL[t]}
					</button>
				))}
			</div>

			{msg && (
				<div className='notice' style={{ marginTop: 12 }}>
					{msg}
				</div>
			)}
		</div>
	);
}
