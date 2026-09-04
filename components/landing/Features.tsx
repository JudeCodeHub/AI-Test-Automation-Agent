import Link from 'next/link';
import { CheckCircle2, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Reveal from './Reveal';
import OrbitalMap from './OrbitalMap';
import SectionHeading, { GradientText } from './SectionHeading';
import WaveCap from './WaveCap';

const FEATURES_BG = 'var(--landing-accent-softer)';

const highlights = [
  'Real browser runs, not simulations',
  'Every generated case is editable before it runs',
  'Pass/fail history tracked per repository',
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-24 lg:py-32"
      style={{ backgroundColor: FEATURES_BG }}
    >
      <WaveCap position="top" fill={FEATURES_BG} />
      <WaveCap position="bottom" fill={FEATURES_BG} />
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Features">
          One workspace, <GradientText>wired into the tools</GradientText> you already use.
        </SectionHeading>

        <div className="mt-16 grid items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Reveal>
              <p className="max-w-[46ch] text-justify text-lg leading-relaxed text-(--landing-ink-muted)">
                Connect a repo and Gemini drafts the test cases for you. Every case runs in a real
                Browserbase session, not a simulation, so what passes here is what actually works in
                a browser.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <ul className="mt-6 space-y-3">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-(--landing-ink)">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-(--landing-accent)"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.2}>
              <Button
                asChild
                size="lg"
                className="mt-8 gap-2 bg-(--landing-accent) hover:bg-(--landing-accent)/90"
              >
                <Link href="/workspace">
                  <Github className="h-4 w-4" />
                  Connect your GitHub repo
                </Link>
              </Button>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <OrbitalMap />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
