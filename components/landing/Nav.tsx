"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Show } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? "border-b border-(--landing-border) bg-(--landing-bg)/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--landing-accent) rounded-md">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
            <Image src="/logo.svg" alt="" width={20} height={20} aria-hidden="true" />
          </div>
          <span
            style={{ fontFamily: "var(--font-orbitron)" }}
            className="text-base font-semibold tracking-wide bg-linear-to-r from-green-700 to-lime-500 bg-clip-text text-transparent"
          >
            EdgeCase
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Show
            when="signed-in"
            fallback={
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="bg-(--landing-accent) hover:bg-(--landing-accent)/90">
                  <Link href="/sign-up">Start free</Link>
                </Button>
              </>
            }
          >
            <Button asChild size="sm" className="bg-(--landing-accent) hover:bg-(--landing-accent)/90">
              <Link href="/workspace">Go to workspace</Link>
            </Button>
          </Show>
        </div>
      </div>
    </header>
  )
}
