// src/app/_components/NotificationList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const PRAISE_LABEL: Record<string, string> = {
	EMPATHY: "공감돼요",
	WELL_DONE: "잘해내셨어요",
	COURAGE: "용기 있었어요",
	CONSISTENCY: "꾸준함이 느껴져요",
	HEART: "마음이 느껴져요",
};

type Item = {
	postId: string;
	post: { title: string } | null;
	typesJson: any;
	updatedAt: string;
	seenAt: string | null;
};

export default function NotificationList({ items }: { items: Item[] }) {
	const router = useRouter();
	const [busy, setBusy] = useState<string | null>(null);

	const toLabels = (typesJson: any) => {
		const arr = Array.isArray(typesJson) ? typesJson.map(String) : [];
		return arr.map((t) => PRAISE_LABEL[t] ?? t);
	};

	const onClickItem = async (postId: string) => {
		setBusy(postId);

		// 읽음 처리(실패해도 이동은 가능하게)
		await fetch("/api/me/notifications/seen", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ postId }),
		}).catch(() => {});

		setBusy(null);
		router.push(`/posts/${postId}`);
		router.refresh();
	};

	if (items.length === 0) {
		return (
			<Card>
				<h1 className='text-2xl font-semibold mb-2'>받은 칭찬</h1>
				<p className='text-sm text-zinc-500 text-center py-8'>아직 받은 칭찬 알림이 없습니다.</p>
			</Card>
		);
	}

	return (
		<Card>
			<div className='mb-6'>
				<h1 className='text-2xl font-semibold mb-2'>받은 칭찬</h1>
				<p className='text-sm text-zinc-600'>숫자 대신, 어떤 종류의 반응이 왔는지만 보여줍니다.</p>
			</div>

			<div className='space-y-3'>
				{items.map((it) => {
					const labels = toLabels(it.typesJson);
					const title = it.post?.title ?? "(삭제된 글)";
					const line =
						labels.length > 0 ? `'${labels.join(" · ")}'가 남겨졌어요` : "칭찬이 남겨졌어요";

					const unread = !it.seenAt;
					const dateStr = new Date(it.updatedAt).toLocaleDateString("ko-KR", {
						year: "numeric",
						month: "long",
						day: "numeric",
					});

					return (
						<button
							key={it.postId}
							onClick={() => onClickItem(it.postId)}
							disabled={busy === it.postId}
							className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
								unread
									? "border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:shadow-sm"
									: "border-zinc-200 bg-white hover:bg-zinc-50 hover:shadow-sm"
							} ${busy === it.postId ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
						>
							<div className='flex items-start justify-between gap-3 mb-2'>
								<h3 className='font-semibold text-zinc-900 flex-1'>{title}</h3>
								{unread && <Badge className='bg-amber-200 text-amber-900 text-xs'>NEW</Badge>}
							</div>

							<p className='text-sm text-zinc-700 mb-2'>{line}</p>

							<div className='text-xs text-zinc-500'>{dateStr}</div>

							{busy === it.postId && <div className='text-xs text-zinc-500 mt-2'>이동 중...</div>}
						</button>
					);
				})}
			</div>
		</Card>
	);
}
