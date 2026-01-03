import type { ReactNode } from "react";

type Props = {
	children: ReactNode;
	className?: string;
};

/**
 * 화면 폭을 일정하게 잡아주고, 페이지마다 동일한 여백을 유지합니다.
 * - 디자인 일관성 확보
 * - page.tsx가 스타일로 비대해지는 걸 방지
 */
export function Container({ children, className = "" }: Props) {
	return <div className={`mx-auto w-full max-w-3xl px-4 ${className}`}>{children}</div>;
}
