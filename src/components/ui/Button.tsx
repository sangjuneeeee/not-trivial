import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: Variant;
	size?: Size;
};

/**
 * Button
 * - 이 프로젝트는 "조용한 톤"이므로 색 대비를 최소화하고, 상태 변화는 미묘하게 줍니다.
 * - primary만 확실한 강조(검정 배경) / 나머지는 border/hover로만 구분
 */
export function Button({ variant = "primary", size = "md", className = "", ...props }: Props) {
	const base =
		"inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 " +
		"focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 " +
		"disabled:opacity-50 disabled:cursor-not-allowed";

	const sizeClasses: Record<Size, string> = {
		sm: "px-3 py-1.5 text-xs",
		md: "px-4 py-2 text-sm",
		lg: "px-6 py-3 text-base",
	};

	const variants: Record<Variant, string> = {
		primary: "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]",
		secondary: "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 active:scale-[0.98]",
		ghost: "text-zinc-700 hover:bg-zinc-100 active:scale-[0.98]",
		danger: "bg-red-600 text-white hover:bg-red-500 active:scale-[0.98]",
	};

	return (
		<button
			{...props}
			className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}
		/>
	);
}
