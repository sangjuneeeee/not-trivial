// src/app/(auth)/login/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/app/shared/validators/auth";
import { readJsonSafe, mapAuthErrorMessage } from "@/app/shared/http";
import { useState } from "react";

export default function LoginPage() {
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
		<div className='container'>
			<header className='header'>
				<div className='brand'>
					<div className='title'>로그인</div>
					<div className='sub'>세션 쿠키가 발급됩니다</div>
				</div>
				<nav className='nav'>
					<Link className='btn' href='/'>
						홈
					</Link>
					<Link className='btn' href='/signup'>
						회원가입
					</Link>
				</nav>
			</header>

			<div className='card' style={{ marginTop: 16 }}>
				<p className='p'>
					아이디/비밀번호로 로그인합니다. 너무 많이 시도하면 잠시 차단될 수 있어요(429).
				</p>

				{serverMsg && (
					<div className='item' style={{ borderColor: "rgba(255,77,109,0.45)", marginTop: 12 }}>
						{serverMsg}
					</div>
				)}

				<form className='form' onSubmit={handleSubmit(onSubmit)}>
					<div className='field'>
						<div className='label'>아이디</div>
						<input className='input' {...register("username")} placeholder='username' />
						{errors.username && <div className='error'>{errors.username.message}</div>}
					</div>

					<div className='field'>
						<div className='label'>비밀번호</div>
						<input
							className='input'
							type='password'
							{...register("password")}
							placeholder='••••••••'
						/>
						{errors.password && <div className='error'>{errors.password.message}</div>}
					</div>

					<button className='btn primary' type='submit' disabled={isSubmitting}>
						{isSubmitting ? "처리 중..." : "로그인"}
					</button>

					<div className='help'>
						비밀번호를 잊으셨나요? <Link href='/forgot-password'>비밀번호 재설정</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
