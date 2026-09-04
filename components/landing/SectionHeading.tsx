import React from "react"
import Reveal from "./Reveal"

export function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-linear-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
      {children}
    </span>
  )
}

type Props = {
  eyebrow: string
  children: React.ReactNode
  className?: string
}

/** Centered eyebrow pill + headline, shared by every section below the hero. */
export default function SectionHeading({ eyebrow, children, className }: Props) {
  return (
    <Reveal>
      <div className={`max-w-2xl mx-auto text-center ${className ?? ""}`}>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight bg-linear-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
          {eyebrow}
        </h2>
        <p className="mt-4 text-base md:text-lg text-(--landing-ink-muted)">
          {children}
        </p>
      </div>
    </Reveal>
  )
}
