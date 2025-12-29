// src/app/(auth)/forgot-password/page.tsx
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

export default function ForgotPasswordPage() {
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
		<div className='container'>
			<header className='header'>
				<div className='brand'>
					<div className='title'>비밀번호 찾기</div>
					<div className='sub'>메일로 재설정 링크가 전송됩니다</div>
				</div>
				<nav className='nav'>
					<Link className='btn' href='/'>
						홈
					</Link>
					<Link className='btn' href='/login'>
						로그인
					</Link>
				</nav>
			</header>

			<div className='card' style={{ marginTop: 16 }}>
				<p className='p'>
					가입된 이메일이라면 재설정 링크를 전송합니다. 너무 자주 요청하면 잠시 차단됩니다(429).
				</p>

				{serverMsg && (
					<div className='item' style={{ marginTop: 12 }}>
						{serverMsg}
					</div>
				)}

				<form className='form' onSubmit={handleSubmit(onSubmit)}>
					<div className='field'>
						<div className='label'>이메일</div>
						<input className='input' {...register("email")} placeholder='you@example.com' />
						{errors.email && <div className='error'>{errors.email.message}</div>}
					</div>

					<button className='btn primary' type='submit' disabled={isSubmitting}>
						{isSubmitting ? "처리 중..." : "재설정 링크 보내기"}
					</button>

					<div className='help'>
						메일을 받았다면 링크를 눌러 진행하세요. <Link href='/login'>로그인으로</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
