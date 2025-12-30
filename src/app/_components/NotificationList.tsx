// src/app/_components/NotificationList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
			<div className='box'>
				<p>아직 받은 칭찬 알림이 없습니다.</p>
			</div>
		);
	}

	return (
		<div className='box'>
			<h1 style={{ marginTop: 0 }}>받은 칭찬</h1>
			<p>숫자 대신, “어떤 종류의 반응이 왔는지”만 보여줍니다.</p>

			<ul style={{ margin: 0, paddingLeft: 18 }}>
				{items.map((it) => {
					const labels = toLabels(it.typesJson);
					const title = it.post?.title ?? "(삭제된 글)";
					const line =
						labels.length > 0 ? `‘${labels.join(" · ")}’가 남겨졌어요` : "칭찬이 남겨졌어요";

					const unread = !it.seenAt;

					return (
						<li key={it.postId} style={{ marginBottom: 12 }}>
							<button
								onClick={() => onClickItem(it.postId)}
								disabled={busy === it.postId}
								style={{
									width: "100%",
									textAlign: "left",
									padding: 10,
									border: "1px solid #ddd",
									borderRadius: 6,
									background: unread ? "#fff7e6" : "#fff",
									cursor: "pointer",
								}}
							>
								<div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
									<b>{title}</b>
									{unread && <span style={{ color: "#c0392b", fontSize: 12 }}>NEW</span>}
								</div>

								<div style={{ color: "#555", marginTop: 6 }}>{line}</div>
								<div style={{ color: "#888", fontSize: 12, marginTop: 6 }}>
									{new Date(it.updatedAt).toLocaleString("ko-KR")}
								</div>

								{busy === it.postId && (
									<div style={{ color: "#888", fontSize: 12, marginTop: 6 }}>이동 중...</div>
								)}
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
