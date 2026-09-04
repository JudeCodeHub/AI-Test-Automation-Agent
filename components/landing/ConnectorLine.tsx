'use client';

import { motion, useReducedMotion } from 'framer-motion';

/** Draws itself left-to-right once it scrolls into view. */
export default function ConnectorLine() {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      className="pointer-events-none absolute top-20 left-0 z-0 hidden h-1 w-full md:block"
      viewBox="0 0 100 4"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.line
        x1="16.5"
        y1="2"
        x2="83.5"
        y2="2"
        stroke="var(--landing-accent)"
        strokeWidth="1"
        strokeDasharray="2.5 2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: reduceMotion ? 0.01 : 1.1, ease: 'easeInOut' }}
      />
    </svg>
  );
}
