// src/components/ui/UserBadge.tsx
import type { BadgeLevel } from "@/server/badge/badge.service";

type Props = {
	level: BadgeLevel;
	size?: "sm" | "md" | "lg";
	showDescription?: boolean;
};

const sizeClasses = {
	sm: "text-xs px-2 py-0.5",
	md: "text-sm px-3 py-1",
	lg: "text-base px-4 py-1.5",
};

const badgeInfo: Record<BadgeLevel, { name: string; description: string }> = {
	SEED: {
		name: "씨앗",
		description: "칭찬의 시작",
	},
	SPROUT: {
		name: "새싹",
		description: "꾸준한 따뜻함",
	},
	TREE: {
		name: "나무",
		description: "깊은 공감",
	},
};

const emojiMap: Record<BadgeLevel, string> = {
	SEED: "🌱",
	SPROUT: "🌿",
	TREE: "🌳",
};

export function UserBadge({ level, size = "md", showDescription = false }: Props) {
	const info = badgeInfo[level];

	return (
		<div className='inline-flex flex-col items-center gap-1'>
			<div
				className={`inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-zinc-700 transition-all hover:bg-zinc-200 ${sizeClasses[size]}`}
			>
				<span className='text-base'>{emojiMap[level]}</span>
				<span className='font-medium'>{info.name}</span>
			</div>
			{showDescription && <p className='text-xs text-zinc-500'>{info.description}</p>}
		</div>
	);
}
