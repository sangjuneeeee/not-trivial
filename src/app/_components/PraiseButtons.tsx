// src/app/_components/PraiseButtons.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
		<Card className='border-blue-100 bg-gradient-to-br from-blue-50/50 to-blue-50/30'>
			<div className='mb-4'>
				<h2 className='text-lg font-semibold mb-1 text-zinc-900'>칭찬하기</h2>
				<p className='text-xs text-zinc-600'>
					한 게시글에는 1번만 칭찬할 수 있어요. 하루 5번까지 가능합니다.
				</p>
			</div>

			<div className='flex flex-wrap gap-2 mb-4'>
				{PRAISE_TYPES.map((t) => (
					<Button
						key={t}
						onClick={() => send(t)}
						disabled={!!busy}
						variant='secondary'
						size='sm'
						className='whitespace-nowrap'
					>
						{busy === t ? "전송 중..." : PRAISE_LABEL[t]}
					</Button>
				))}
			</div>

			{msg && (
				<div
					className={`p-3 rounded-xl border text-sm transition-all ${
						msg.includes("실패") || msg.includes("오류")
							? "bg-red-50 border-red-200 text-red-700"
							: "bg-green-50 border-green-200 text-green-700"
					}`}
				>
					{msg}
				</div>
			)}
		</Card>
	);
}
