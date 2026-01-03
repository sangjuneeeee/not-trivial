import type { ReactNode } from "react";

type Props = {
	children: ReactNode;
	className?: string;
};

/**
 * Badge
 * - 감정 태그/라벨은 "색으로 의미를 부여"하지 않습니다.
 * - 모두 같은 톤(zinc)으로 통일 → 비교/평가 유도 최소화
 */
export function Badge({ children, className = "" }: Props) {
	return (
		<span
			className={`inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 ${className}`}
		>
			{children}
		</span>
	);
}
