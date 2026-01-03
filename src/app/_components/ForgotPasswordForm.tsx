// src/app/_components/ForgotPasswordForm.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	requestPasswordResetSchema,
	type RequestPasswordResetInput,
} from "@/app/shared/validators/auth";
import { readJsonSafe, mapAuthErrorMessage } from "@/app/shared/http";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordForm() {
	const [serverMsg, setServerMsg] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RequestPasswordResetInput>({
		resolver: zodResolver(requestPasswordResetSchema),
	});

	const onSubmit = async (values: RequestPasswordResetInput) => {
		setServerMsg(null);

		const res = await fetch("/api/auth/password-reset/request", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(values),
		});

		const data = await readJsonSafe(res);

		if (!res.ok) {
			setServerMsg(mapAuthErrorMessage(res, data));
			return;
		}

		setServerMsg(data?.message ?? "요청 처리 완료");
	};

	return (
		<Card className='max-w-md mx-auto'>
			<h1 className='text-2xl font-semibold mb-2'>비밀번호 찾기</h1>
			<p className='text-sm text-zinc-600 mb-6'>
				가입된 이메일이라면 재설정 링크를 전송합니다. 너무 자주 요청하면 잠시 차단됩니다.
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
				<Field label='이메일' error={errors.email?.message}>
					<Input
						type='email'
						{...register("email")}
						placeholder='you@example.com'
						error={errors.email?.message}
					/>
				</Field>

				<div className='flex flex-col gap-3 pt-2'>
					<Button type='submit' disabled={isSubmitting} className='w-full' size='lg'>
						{isSubmitting ? "처리 중..." : "재설정 링크 보내기"}
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
