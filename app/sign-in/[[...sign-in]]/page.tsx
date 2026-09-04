import Image from 'next/image';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-tr from-green-400 to-emerald-500 shadow-sm">
          <Image src="/logo.svg" alt="" width={22} height={22} aria-hidden="true" />
        </div>
        <span
          style={{ fontFamily: 'var(--font-orbitron)' }}
          className="bg-linear-to-r from-green-700 to-lime-500 bg-clip-text text-base font-semibold tracking-wide text-transparent"
        >
          EdgeCase
        </span>
      </Link>
      <SignIn />
    </main>
  );
}
