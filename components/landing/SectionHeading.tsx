import React from 'react';
import Reveal from './Reveal';

export function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-linear-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
      {children}
    </span>
  );
}

type Props = {
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
};

/** Centered eyebrow pill + headline, shared by every section below the hero. */
export default function SectionHeading({ eyebrow, children, className }: Props) {
  return (
    <Reveal>
      <div className={`mx-auto max-w-2xl text-center ${className ?? ''}`}>
        <h2 className="bg-linear-to-r from-green-500 to-emerald-600 bg-clip-text text-2xl font-semibold tracking-tight text-transparent md:text-3xl">
          {eyebrow}
        </h2>
        <p className="mt-4 text-base text-(--landing-ink-muted) md:text-lg">{children}</p>
      </div>
    </Reveal>
  );
}
