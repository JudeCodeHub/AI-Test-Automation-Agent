'use client';

import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/**
 * Fade + small upward translate as content enters the viewport.
 * Honors prefers-reduced-motion by dropping the translate/duration to ~0.
 */
export default function Reveal({ children, className, delay = 0, y = 16 }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: reduceMotion ? 0.01 : 0.5,
        delay: reduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
