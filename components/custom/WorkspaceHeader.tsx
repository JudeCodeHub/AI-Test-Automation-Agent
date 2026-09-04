import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

function WorkspaceHeader() {
  return (
    <header className="bg-card w-full border-b px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <Link href="/workspace" className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-tr from-green-400 to-emerald-500 shadow-sm">
            <Image src={'/logo.svg'} alt="" width={24} height={24} aria-hidden="true" />
          </div>
          <span
            style={{ fontFamily: 'var(--font-orbitron)' }}
            className="hidden bg-linear-to-r from-green-700 to-lime-500 bg-clip-text text-lg font-semibold tracking-wide text-transparent sm:inline"
          >
            EdgeCase
          </span>
        </Link>

        <div
          className="shrink-0"
          style={{ transform: 'scale(1.5) translateX(-20px)', transformOrigin: 'right center' }}
        >
          <UserButton />
        </div>
      </div>
    </header>
  );
}

export default WorkspaceHeader;
