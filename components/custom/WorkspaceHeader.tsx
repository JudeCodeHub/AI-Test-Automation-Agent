import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

function WorkspaceHeader() {
    return (
        <header className="w-full border-b bg-card px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                <Link href="/workspace" className="flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-tr from-green-400 to-emerald-500 flex items-center justify-center shadow-sm shrink-0">
                        <Image src={'/logo.svg'} alt="" width={24} height={24} aria-hidden="true" />
                    </div>
                    <span
                        style={{ fontFamily: "var(--font-orbitron)" }}
                        className="text-lg font-semibold tracking-wide hidden sm:inline bg-linear-to-r from-green-700 to-lime-500 bg-clip-text text-transparent"
                    >
                        EdgeCase
                    </span>
                </Link>

                <div className="shrink-0" style={{ transform: 'scale(1.5) translateX(-20px)', transformOrigin: 'right center' }}>
                    <UserButton />
                </div>
            </div>
        </header>
    )
}

export default WorkspaceHeader
