import Link from "next/link";
import { getCurrentUser } from "@/server/auth/get-current-user";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import LogoutButton from "@/app/_components/LogoutButton";

export default async function AppHeader() {
	const me = await getCurrentUser();

	return (
		<header className='border-b border-zinc-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50'>
			<Container className='py-4'>
				<div className='flex items-center justify-between'>
					<Link href='/' className='flex items-baseline gap-2 hover:opacity-80 transition-opacity'>
						<span className='text-xs text-zinc-400 font-mono'>not-trivial</span>
						<span className='text-lg font-semibold tracking-tight text-zinc-900'>
							사소하지 않아
						</span>
					</Link>

					<nav className='flex items-center gap-2'>
						<Link href='/posts'>
							<Button variant='ghost' size='sm'>
								게시글
							</Button>
						</Link>

						{me ? (
							<>
								<Link href='/write'>
									<Button size='sm'>글쓰기</Button>
								</Link>
								<Link href='/me'>
									<Button variant='ghost' size='sm'>
										마이페이지
									</Button>
								</Link>
								<LogoutButton />
							</>
						) : (
							<>
								<Link href='/login'>
									<Button variant='ghost' size='sm'>
										로그인
									</Button>
								</Link>
								<Link href='/signup'>
									<Button size='sm'>회원가입</Button>
								</Link>
							</>
						)}
					</nav>
				</div>
			</Container>
		</header>
	);
}
