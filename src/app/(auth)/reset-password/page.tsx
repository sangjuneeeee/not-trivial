// src/app/(auth)/reset-password/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/app/shared/validators/auth";
import { readJsonSafe, mapAuthErrorMessage } from "@/app/shared/http";

export default function ResetPasswordPage() {
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
		<div className='container'>
			<header className='header'>
				<div className='brand'>
					<div className='title'>비밀번호 재설정</div>
					<div className='sub'>성공 시 모든 세션이 로그아웃됩니다</div>
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
				<p className='p'>메일 링크의 토큰으로 비밀번호를 변경합니다. 토큰은 30분만 유효합니다.</p>

				{serverMsg && (
					<div className='item' style={{ marginTop: 12 }}>
						{serverMsg}
					</div>
				)}

				<form className='form' onSubmit={handleSubmit(onSubmit)}>
					<div className='field'>
						<div className='label'>토큰</div>
						<input className='input' {...register("token")} />
						<div className='help'>메일 링크로 접속하면 자동으로 채워집니다.</div>
						{errors.token && <div className='error'>{errors.token.message}</div>}
					</div>

					<div className='field'>
						<div className='label'>새 비밀번호</div>
						<input className='input' type='password' {...register("password")} />
						{errors.password && <div className='error'>{errors.password.message}</div>}
					</div>

					<div className='field'>
						<div className='label'>새 비밀번호 확인</div>
						<input className='input' type='password' {...register("passwordConfirm")} />
						{errors.passwordConfirm && (
							<div className='error'>{errors.passwordConfirm.message}</div>
						)}
					</div>

					<button className='btn primary' type='submit' disabled={isSubmitting}>
						{isSubmitting ? "처리 중..." : "비밀번호 변경"}
					</button>
				</form>
			</div>
		</div>
	);
}
