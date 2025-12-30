// src/app/_components/SettingsForms.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	updateNicknameSchema,
	type UpdateNicknameInput,
	updatePasswordSchema,
	type UpdatePasswordInput,
} from "@/app/shared/validators/settings";

export default function SettingsForms({ initialNickname }: { initialNickname: string }) {
	const router = useRouter();

	// 닉네임 폼
	const [nickMsg, setNickMsg] = useState<string | null>(null);
	const nickForm = useForm<UpdateNicknameInput>({
		resolver: zodResolver(updateNicknameSchema),
		defaultValues: { nickname: initialNickname },
	});

	const onSubmitNickname = async (values: UpdateNicknameInput) => {
		setNickMsg(null);

		const res = await fetch("/api/me/settings/nickname", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(values),
		});

		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			setNickMsg(data?.message ?? "닉네임 변경 실패");
			return;
		}

		setNickMsg("닉네임이 변경되었습니다.");
		router.refresh(); // SSR 반영
	};

	// 비번 폼
	const [pwMsg, setPwMsg] = useState<string | null>(null);
	const pwForm = useForm<UpdatePasswordInput>({
		resolver: zodResolver(updatePasswordSchema),
		defaultValues: { currentPassword: "", newPassword: "", newPasswordConfirm: "" },
	});

	const onSubmitPassword = async (values: UpdatePasswordInput) => {
		setPwMsg(null);

		const res = await fetch("/api/me/settings/password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(values),
		});

		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			setPwMsg(data?.message ?? "비밀번호 변경 실패");
			return;
		}

		// ✅ 성공하면 세션 전부 삭제 + 쿠키 만료 -> 로그인으로 보내기
		setPwMsg(data?.message ?? "비밀번호가 변경되었습니다.");
		setTimeout(() => {
			router.replace("/login");
			router.refresh();
		}, 600);
	};

	return (
		<>
			<div className='box'>
				<h1 style={{ marginTop: 0 }}>닉네임 변경</h1>
				{nickMsg && <div className='notice'>{nickMsg}</div>}

				<form onSubmit={nickForm.handleSubmit(onSubmitNickname)}>
					<div>
						<label>닉네임</label>
						<input {...nickForm.register("nickname")} />
						{nickForm.formState.errors.nickname && (
							<div className='error'>{nickForm.formState.errors.nickname.message}</div>
						)}
					</div>

					<button className='primary' disabled={nickForm.formState.isSubmitting}>
						{nickForm.formState.isSubmitting ? "처리 중..." : "닉네임 변경"}
					</button>
				</form>
			</div>

			<div className='box'>
				<h1 style={{ marginTop: 0 }}>비밀번호 변경</h1>
				<p className='help'>비밀번호 변경 시 보안을 위해 모든 세션이 로그아웃됩니다.</p>

				{pwMsg && <div className='notice'>{pwMsg}</div>}

				<form onSubmit={pwForm.handleSubmit(onSubmitPassword)}>
					<div>
						<label>현재 비밀번호</label>
						<input type='password' {...pwForm.register("currentPassword")} />
						{pwForm.formState.errors.currentPassword && (
							<div className='error'>{pwForm.formState.errors.currentPassword.message}</div>
						)}
					</div>

					<div>
						<label>새 비밀번호</label>
						<input type='password' {...pwForm.register("newPassword")} />
						{pwForm.formState.errors.newPassword && (
							<div className='error'>{pwForm.formState.errors.newPassword.message}</div>
						)}
					</div>

					<div>
						<label>새 비밀번호 확인</label>
						<input type='password' {...pwForm.register("newPasswordConfirm")} />
						{pwForm.formState.errors.newPasswordConfirm && (
							<div className='error'>{pwForm.formState.errors.newPasswordConfirm.message}</div>
						)}
					</div>

					<button className='primary' disabled={pwForm.formState.isSubmitting}>
						{pwForm.formState.isSubmitting ? "처리 중..." : "비밀번호 변경"}
					</button>
				</form>
			</div>
		</>
	);
}
