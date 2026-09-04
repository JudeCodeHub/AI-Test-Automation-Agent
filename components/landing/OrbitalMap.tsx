'use client';

import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Coins, Github, MonitorPlay, Settings2, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Node = {
  icon: LucideIcon;
  name: string;
  caption: string;
  x: number;
  y: number;
  floatDelay: number;
};

// Six positions around a hexagon centered at (50, 50), radius 42.
const nodes: Node[] = [
  { icon: Github, name: 'GitHub', caption: 'Connect a repo', x: 50, y: 8, floatDelay: 0 },
  { icon: Sparkles, name: 'Gemini', caption: 'Drafts test cases', x: 86, y: 29, floatDelay: 0.3 },
  {
    icon: MonitorPlay,
    name: 'Browserbase',
    caption: 'Runs them live',
    x: 86,
    y: 71,
    floatDelay: 0.6,
  },
  {
    icon: Settings2,
    name: 'Editable cases',
    caption: 'Adjust routes & results',
    x: 50,
    y: 92,
    floatDelay: 0.9,
  },
  {
    icon: Coins,
    name: 'Usage credits',
    caption: '1,000 free to start',
    x: 14,
    y: 71,
    floatDelay: 1.2,
  },
  {
    icon: BarChart3,
    name: 'Live analytics',
    caption: 'Pass/fail per run',
    x: 14,
    y: 29,
    floatDelay: 1.5,
  },
];

function OrbitalMap() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
      {/* Orbit rings */}
      <div className="absolute inset-[8%] rounded-full border border-(--landing-border)" />
      <div className="absolute inset-[26%] rounded-full border border-dashed border-(--landing-border)" />

      {/* Connector lines from hub to each node */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        {nodes.map((node) => (
          <line
            key={node.name}
            x1="50%"
            y1="50%"
            x2={`${node.x}%`}
            y2={`${node.y}%`}
            stroke="var(--landing-border)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
        ))}
      </svg>

      {/* Pulsing central hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-(--landing-accent-soft) opacity-60" />
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-(--landing-accent)/30 bg-(--landing-accent) shadow-[0_12px_24px_-8px_rgba(0,0,0,0.25)]">
          <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
      </div>

      {/* Floating service nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.name}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 3.2, delay: node.floatDelay, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <div className="flex items-center gap-2 rounded-xl border border-(--landing-border) bg-(--landing-bg-raised) px-3 py-2 shadow-[0_12px_24px_-10px_rgba(0,0,0,0.15)]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-(--landing-accent-soft) text-(--landing-accent)">
              <node.icon className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <div className="whitespace-nowrap">
              <p className="text-xs font-semibold text-(--landing-ink)">{node.name}</p>
              <p className="text-[10px] text-(--landing-ink-muted)">{node.caption}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default memo(OrbitalMap);
