// src/app/_components/ResetPasswordForm.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/app/shared/validators/auth";
import { readJsonSafe, mapAuthErrorMessage } from "@/app/shared/http";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordForm() {
	const router = useRouter();
	const sp = useSearchParams();
	const token = sp.get("token") ?? "";

	const [serverMsg, setServerMsg] = useState<string | null>(null);

	const defaultValues = useMemo(() => ({ token, password: "", passwordConfirm: "" }), [token]);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordInput>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues,
	});

	const onSubmit = async (values: ResetPasswordInput) => {
		setServerMsg(null);

		const res = await fetch("/api/auth/password-reset/confirm", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(values),
		});

		const data = await readJsonSafe(res);

		if (!res.ok) {
			setServerMsg(mapAuthErrorMessage(res, data));
			return;
		}

		setServerMsg("비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.");

		// ✅ UX: 약간 보여주고 이동
		setTimeout(() => {
			router.replace("/login");
		}, 700);
	};

	return (
		<Card className='max-w-md mx-auto'>
			<h1 className='text-2xl font-semibold mb-2'>비밀번호 재설정</h1>
			<p className='text-sm text-zinc-600 mb-6'>
				메일 링크의 토큰으로 비밀번호를 변경합니다. 토큰은 30분만 유효하며, 성공 시 모든 세션이
				로그아웃됩니다.
			</p>

			{serverMsg && (
				<div
					className={`mb-4 p-3 rounded-xl border text-sm ${
						serverMsg.includes("실패") || serverMsg.includes("오류")
							? "bg-red-50 border-red-200 text-red-700"
							: "bg-green-50 border-green-200 text-green-700"
					}`}
				>
					{serverMsg}
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
				<Field
					label='토큰'
					error={errors.token?.message}
					hint='메일 링크로 접속하면 자동으로 채워집니다'
				>
					<Input {...register("token")} error={errors.token?.message} />
				</Field>

				<Field label='새 비밀번호' error={errors.password?.message}>
					<Input
						type='password'
						{...register("password")}
						placeholder='••••••••'
						error={errors.password?.message}
					/>
				</Field>

				<Field label='새 비밀번호 확인' error={errors.passwordConfirm?.message}>
					<Input
						type='password'
						{...register("passwordConfirm")}
						placeholder='••••••••'
						error={errors.passwordConfirm?.message}
					/>
				</Field>

				<div className='flex flex-col gap-3 pt-2'>
					<Button type='submit' disabled={isSubmitting} className='w-full' size='lg'>
						{isSubmitting ? "처리 중..." : "비밀번호 변경"}
					</Button>

					<div className='text-center text-sm text-zinc-500'>
						<Link href='/login' className='text-zinc-900 hover:underline font-medium'>
							로그인으로 돌아가기
						</Link>
					</div>
				</div>
			</form>
		</Card>
	);
}
