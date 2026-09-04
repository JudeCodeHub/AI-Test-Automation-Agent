"use client"

import React, { memo, useRef } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "framer-motion"
import { CheckCircle2, MonitorPlay, Sparkles, XCircle } from "lucide-react"

const runItems = [
  { label: "Sign-in redirects to /workspace", passed: true },
  { label: "Duplicate email returns a 409", passed: true },
  { label: "GitHub callback sets an httpOnly cookie", passed: true },
  { label: "Missing DATABASE_URL surfaces a 500", passed: false },
]

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

/**
 * Perpetual mouse-driven parallax is isolated in this leaf component (its own
 * client boundary, memoized) so mousemove never re-renders the server-rendered
 * Hero copy above it.
 */
function HeroVisual() {
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { stiffness: 100, damping: 20 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  const panelX = useTransform(springX, [-1, 1], [-6, 6])
  const panelY = useTransform(springY, [-1, 1], [-4, 4])
  const cardAX = useTransform(springX, [-1, 1], [-16, 16])
  const cardAY = useTransform(springY, [-1, 1], [-14, 14])
  const cardBX = useTransform(springX, [-1, 1], [10, -10])
  const cardBY = useTransform(springY, [-1, 1], [8, -8])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !containerRef.current) return
    const bounds = containerRef.current.getBoundingClientRect()
    mouseX.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1)
    mouseY.set(((event.clientY - bounds.top) / bounds.height) * 2 - 1)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const passedCount = runItems.filter((item) => item.passed).length

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto max-w-sm py-6"
    >
      {/* Floating context cards - parallax skipped entirely under reduced motion */}
      <motion.div
        style={reduceMotion ? undefined : { x: cardAX, y: cardAY }}
        className="hidden sm:flex absolute -top-5 -right-6 items-center gap-2 rounded-xl border border-(--landing-border) bg-(--landing-bg-raised) px-3 py-2 shadow-[0_12px_24px_-10px_rgba(0,0,0,0.15)]"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--landing-accent) opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-(--landing-accent)" />
        </span>
        <MonitorPlay className="h-3.5 w-3.5 text-(--landing-ink-muted)" aria-hidden="true" />
        <span className="text-xs font-medium text-(--landing-ink)">Browserbase session live</span>
      </motion.div>

      <motion.div
        style={reduceMotion ? undefined : { x: cardBX, y: cardBY }}
        className="hidden sm:flex absolute -bottom-5 -left-6 items-center gap-2 rounded-xl border border-(--landing-border) bg-(--landing-bg-raised) px-3 py-2 shadow-[0_12px_24px_-10px_rgba(0,0,0,0.15)]"
      >
        <Sparkles className="h-3.5 w-3.5 text-(--landing-accent)" aria-hidden="true" />
        <span className="text-xs font-medium text-(--landing-ink)">Gemini drafting test cases</span>
      </motion.div>

      {/* Main staggered "run report" panel */}
      <motion.div
        style={reduceMotion ? undefined : { x: panelX, y: panelY }}
        className="rounded-2xl border border-(--landing-border) bg-(--landing-bg-raised) p-5 shadow-[0_24px_48px_-18px_rgba(0,0,0,0.18)]"
      >
        <div className="flex items-center justify-between border-b border-dashed border-(--landing-border) pb-3">
          <span className="font-mono text-xs tracking-wide text-(--landing-ink-muted)">RUN #4821</span>
          <span className="font-mono text-xs text-(--landing-ink-muted)">app-frontend</span>
        </div>

        <motion.ul
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-4 space-y-3"
        >
          {runItems.map((item) => (
            <motion.li key={item.label} variants={itemVariants} className="flex items-start gap-2.5">
              {item.passed ? (
                <CheckCircle2 className="h-4 w-4 text-(--landing-accent) shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <span className="text-sm leading-snug text-(--landing-ink)">{item.label}</span>
            </motion.li>
          ))}
        </motion.ul>

        <div className="mt-4 flex items-center justify-between border-t border-dashed border-(--landing-border) pt-3">
          <span className="text-xs text-(--landing-ink-muted)">
            {passedCount} of {runItems.length} passed
          </span>
          <span className="text-xs font-semibold text-(--landing-ink)">
            {Math.round((passedCount / runItems.length) * 100)}% this run
          </span>
        </div>
      </motion.div>
    </div>
  )
}

export default memo(HeroVisual)
