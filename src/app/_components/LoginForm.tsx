// src/app/_components/LoginForm.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/app/shared/validators/auth";
import { readJsonSafe, mapAuthErrorMessage } from "@/app/shared/http";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginForm() {
	const router = useRouter();
	const [serverMsg, setServerMsg] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (values: LoginInput) => {
		setServerMsg(null);
		const res = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(values),
		});

		const data = await readJsonSafe(res);

		if (!res.ok) {
			setServerMsg(mapAuthErrorMessage(res, data));
			return;
		}

		// ✅ 로그인 성공: SSR 반영 위해 refresh + 홈으로 이동
		router.replace("/");
		router.refresh();
	};

	return (
		<Card className='max-w-md mx-auto'>
			<h1 className='text-2xl font-semibold mb-2'>로그인</h1>
			<p className='text-sm text-zinc-600 mb-6'>
				아이디/비밀번호로 로그인합니다. 너무 많이 시도하면 잠시 차단될 수 있어요.
			</p>

			{serverMsg && (
				<div className='mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700'>
					{serverMsg}
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
				<Field label='아이디' error={errors.username?.message}>
					<Input
						{...register("username")}
						placeholder='username'
						error={errors.username?.message}
					/>
				</Field>

				<Field label='비밀번호' error={errors.password?.message}>
					<Input
						type='password'
						{...register("password")}
						placeholder='••••••••'
						error={errors.password?.message}
					/>
				</Field>

				<div className='flex flex-col gap-3 pt-2'>
					<Button type='submit' disabled={isSubmitting} className='w-full' size='lg'>
						{isSubmitting ? "처리 중..." : "로그인"}
					</Button>

					<div className='text-center'>
						<Link
							href='/forgot-password'
							className='text-sm text-zinc-600 hover:text-zinc-900 transition-colors'
						>
							비밀번호를 잊으셨나요?
						</Link>
					</div>

					<div className='text-center text-sm text-zinc-500'>
						계정이 없으신가요?{" "}
						<Link href='/signup' className='text-zinc-900 hover:underline font-medium'>
							회원가입
						</Link>
					</div>
				</div>
			</form>
		</Card>
	);
}
