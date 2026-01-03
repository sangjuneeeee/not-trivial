import type { ReactNode } from "react";

type Props = {
	label: string;
	error?: string;
	children: ReactNode;
	hint?: string;
};

/**
 * Field
 * - 폼의 반복 구조(라벨/입력/에러)를 통일해서
 *   페이지 코드가 지저분해지는 것을 방지합니다.
 */
export function Field({ label, error, children, hint }: Props) {
	return (
		<div className='space-y-2'>
			<div className='flex items-baseline justify-between'>
				<label className='text-sm font-medium text-zinc-900'>{label}</label>
				{hint ? <span className='text-xs text-zinc-500'>{hint}</span> : null}
			</div>

			{children}

			{error ? <p className='text-sm text-red-600 mt-1'>{error}</p> : null}
		</div>
	);
}
