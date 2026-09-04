import Image from 'next/image';
import { Github } from 'lucide-react';
import Reveal from './Reveal';

const links = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
];

const footerLinkClass =
  'text-sm text-(--landing-ink-muted) transition-colors hover:text-(--landing-ink)';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-(--landing-border) bg-(--landing-bg-raised)">
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <Reveal>
          <div className="flex items-center justify-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-tr from-green-400 to-emerald-500 shadow-sm">
              <Image src="/logo.svg" alt="" width={20} height={20} aria-hidden="true" />
            </div>
            <span
              style={{ fontFamily: 'var(--font-orbitron)' }}
              className="bg-linear-to-r from-green-700 to-lime-500 bg-clip-text text-base font-semibold tracking-wide text-transparent"
            >
              EdgeCase
            </span>
          </div>
          <p className="mx-auto mt-3 max-w-sm text-sm text-(--landing-ink-muted)">
            AI-generated, real-browser-tested coverage for your GitHub repos.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <nav
            aria-label="Footer"
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          >
            {links.map((link) => (
              <a key={link.href} href={link.href} className={footerLinkClass}>
                {link.label}
              </a>
            ))}
          </nav>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="mt-8 flex items-center justify-center">
            <a
              href="https://github.com/JudeCodeHub/AI-Test-Automation-Agent"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-(--landing-border) text-(--landing-ink-muted) transition-colors hover:border-(--landing-accent)/40 hover:text-(--landing-accent)"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </Reveal>

        <div className="mt-10 border-t border-(--landing-border) pt-6">
          <p className="text-xs text-(--landing-ink-muted)">
            &copy; {year} EdgeCase. Built with Next.js, Gemini, and Browserbase.
          </p>
        </div>
      </div>
    </footer>
  );
}
