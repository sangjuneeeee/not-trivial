// src/app/(auth)/signup/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/app/shared/validators/auth";
import { readJsonSafe, mapAuthErrorMessage } from "@/app/shared/http";
import { useState } from "react";

export default function SignupPage() {
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
		<div className='container'>
			<header className='header'>
				<div className='brand'>
					<div className='title'>회원가입</div>
					<div className='sub'>가입 후 로그인으로 이동합니다</div>
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
				<p className='p'>이메일/아이디/비밀번호로 가입합니다.</p>

				{serverMsg && (
					<div className='item' style={{ borderColor: "rgba(255,77,109,0.45)", marginTop: 12 }}>
						{serverMsg}
					</div>
				)}

				<form className='form' onSubmit={handleSubmit(onSubmit)}>
					<div className='field'>
						<div className='label'>이메일</div>
						<input className='input' {...register("email")} placeholder='you@example.com' />
						{errors.email && <div className='error'>{errors.email.message}</div>}
					</div>

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

					<div className='field'>
						<div className='label'>비밀번호 확인</div>
						<input
							className='input'
							type='password'
							{...register("passwordConfirm")}
							placeholder='••••••••'
						/>
						{errors.passwordConfirm && (
							<div className='error'>{errors.passwordConfirm.message}</div>
						)}
					</div>

					<button className='btn primary' type='submit' disabled={isSubmitting}>
						{isSubmitting ? "처리 중..." : "회원가입"}
					</button>
				</form>
			</div>
		</div>
	);
}
