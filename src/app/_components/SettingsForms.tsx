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
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
		<div className='space-y-6'>
			<Card>
				<div className='mb-4'>
					<h2 className='text-lg font-semibold mb-1'>닉네임 변경</h2>
					<p className='text-xs text-zinc-600'>다른 사람에게 보이는 이름을 변경할 수 있습니다.</p>
				</div>
				{nickMsg && (
					<div
						className={`mb-4 p-3 rounded-xl border text-sm ${
							nickMsg.includes("실패") || nickMsg.includes("오류")
								? "bg-red-50 border-red-200 text-red-700"
								: "bg-green-50 border-green-200 text-green-700"
						}`}
					>
						{nickMsg}
					</div>
				)}

				<form onSubmit={nickForm.handleSubmit(onSubmitNickname)} className='space-y-6'>
					<Field label='닉네임' error={nickForm.formState.errors.nickname?.message}>
						<Input
							{...nickForm.register("nickname")}
							error={nickForm.formState.errors.nickname?.message}
						/>
					</Field>

					<Button
						type='submit'
						disabled={nickForm.formState.isSubmitting}
						className='w-full'
						size='lg'
					>
						{nickForm.formState.isSubmitting ? "처리 중..." : "닉네임 변경"}
					</Button>
				</form>
			</Card>

			<Card>
				<div className='mb-4'>
					<h2 className='text-lg font-semibold mb-1'>비밀번호 변경</h2>
					<p className='text-xs text-zinc-600'>
						비밀번호 변경 시 보안을 위해 모든 세션이 로그아웃됩니다.
					</p>
				</div>

				{pwMsg && (
					<div
						className={`mb-4 p-3 rounded-xl border text-sm ${
							pwMsg.includes("실패") || pwMsg.includes("오류")
								? "bg-red-50 border-red-200 text-red-700"
								: "bg-green-50 border-green-200 text-green-700"
						}`}
					>
						{pwMsg}
					</div>
				)}

				<form onSubmit={pwForm.handleSubmit(onSubmitPassword)} className='space-y-6'>
					<Field label='현재 비밀번호' error={pwForm.formState.errors.currentPassword?.message}>
						<Input
							type='password'
							{...pwForm.register("currentPassword")}
							placeholder='••••••••'
							error={pwForm.formState.errors.currentPassword?.message}
						/>
					</Field>

					<Field label='새 비밀번호' error={pwForm.formState.errors.newPassword?.message}>
						<Input
							type='password'
							{...pwForm.register("newPassword")}
							placeholder='••••••••'
							error={pwForm.formState.errors.newPassword?.message}
						/>
					</Field>

					<Field
						label='새 비밀번호 확인'
						error={pwForm.formState.errors.newPasswordConfirm?.message}
					>
						<Input
							type='password'
							{...pwForm.register("newPasswordConfirm")}
							placeholder='••••••••'
							error={pwForm.formState.errors.newPasswordConfirm?.message}
						/>
					</Field>

					<Button
						type='submit'
						disabled={pwForm.formState.isSubmitting}
						className='w-full'
						size='lg'
					>
						{pwForm.formState.isSubmitting ? "처리 중..." : "비밀번호 변경"}
					</Button>
				</form>
			</Card>
		</div>
	);
}
