import Image from "next/image";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 py-16">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-tr from-green-400 to-emerald-500 shadow-sm">
          <Image src="/logo.svg" alt="" width={22} height={22} aria-hidden="true" />
        </div>
        <span className="text-base font-semibold tracking-tight text-foreground">AI Test Agent</span>
      </Link>
      <SignIn />
    </main>
  );
}
