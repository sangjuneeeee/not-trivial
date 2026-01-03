import type { ReactNode } from "react";

type Props = {
	children: ReactNode;
	className?: string;
};

/**
 * Card
 * - 내용 중심: 그림자는 아주 약하게
 * - border로 구획을 나누고, radius로 부드러운 인상을 줍니다.
 */
export function Card({ children, className = "" }: Props) {
	return (
		<div
			className={`rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 ${className}`}
		>
			{children}
		</div>
	);
}
