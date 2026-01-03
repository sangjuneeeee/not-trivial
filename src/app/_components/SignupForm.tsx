// src/app/_components/SignupForm.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/app/shared/validators/auth";
import { readJsonSafe, mapAuthErrorMessage } from "@/app/shared/http";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignupForm() {
	const router = useRouter();
	const [serverMsg, setServerMsg] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

	const onSubmit = async (values: SignupInput) => {
		setServerMsg(null);

		const res = await fetch("/api/auth/signup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(values),
		});

		const data = await readJsonSafe(res);

		if (!res.ok) {
			setServerMsg(mapAuthErrorMessage(res, data));
			return;
		}

		alert("회원가입 완료! 로그인해주세요.");
		router.replace("/login");
	};

	return (
		<Card className='max-w-md mx-auto'>
			<h1 className='text-2xl font-semibold mb-2'>회원가입</h1>
			<p className='text-sm text-zinc-600 mb-6'>
				이메일/아이디/비밀번호로 가입합니다. 가입 후 로그인 페이지로 이동합니다.
			</p>

			{serverMsg && (
				<div className='mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700'>
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

				<Field label='비밀번호 확인' error={errors.passwordConfirm?.message}>
					<Input
						type='password'
						{...register("passwordConfirm")}
						placeholder='••••••••'
						error={errors.passwordConfirm?.message}
					/>
				</Field>

				<div className='flex flex-col gap-3 pt-2'>
					<Button type='submit' disabled={isSubmitting} className='w-full' size='lg'>
						{isSubmitting ? "처리 중..." : "회원가입"}
					</Button>

					<div className='text-center text-sm text-zinc-500'>
						이미 계정이 있으신가요?{" "}
						<Link href='/login' className='text-zinc-900 hover:underline font-medium'>
							로그인
						</Link>
					</div>
				</div>
			</form>
		</Card>
	);
}
