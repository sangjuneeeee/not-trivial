import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
	error?: string;
};

/**
 * Input
 * - 입력 필드는 "안전한 느낌"을 주는 게 중요: 과한 색/그림자 대신 border 중심
 * - error는 빨강을 허용(입력 오류는 사용자에게 명확해야 함)
 */
export function Input({ className = "", error, ...props }: Props) {
	const base =
		"w-full rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 transition-all duration-200 " +
		"placeholder:text-zinc-400 " +
		"focus:outline-none focus:ring-2 focus:ring-zinc-200";

	const border = error
		? "border-red-300 focus:ring-red-200"
		: "border-zinc-200 hover:border-zinc-300";

	return <input {...props} className={`${base} ${border} ${className}`} />;
}
