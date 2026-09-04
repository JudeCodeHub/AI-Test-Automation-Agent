import { CheckCircle2, Github, Sparkles } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading, { GradientText } from './SectionHeading';
import ConnectorLine from './ConnectorLine';

const cardClass =
  'flex h-40 flex-col justify-center gap-2.5 rounded-xl border border-(--landing-border) bg-(--landing-bg-raised) p-4';

function WindowDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-(--landing-ink-muted)/30" />
      <span className="h-1.5 w-1.5 rounded-full bg-(--landing-ink-muted)/30" />
      <span className="h-1.5 w-1.5 rounded-full bg-(--landing-ink-muted)/30" />
    </div>
  );
}

function ConnectVignette() {
  return (
    <div className={cardClass}>
      <WindowDots />
      <div className="flex items-center gap-2.5 rounded-lg border border-(--landing-border) bg-(--landing-bg) px-3 py-2.5">
        <Github className="h-4 w-4 text-(--landing-ink-muted)" aria-hidden="true" />
        <span className="text-sm font-medium text-(--landing-ink)">acme/app-frontend</span>
        <CheckCircle2 className="ml-auto h-4 w-4 text-(--landing-accent)" aria-hidden="true" />
      </div>
    </div>
  );
}

function AnalyzeVignette() {
  return (
    <div className={cardClass}>
      <WindowDots />
      <div className="space-y-1 rounded-lg border border-(--landing-border) bg-(--landing-bg) px-3 py-2.5 font-mono text-xs leading-relaxed">
        <div>
          <span className="text-(--landing-accent)">await</span>{' '}
          <span className="font-semibold text-(--landing-ink)">ai.models.generateContent</span>
          <span className="text-(--landing-ink-muted)">({'{'}</span>
        </div>
        <div className="text-(--landing-ink-muted)">
          &nbsp;&nbsp;model:{' '}
          <span className="text-(--landing-ink)">&quot;gemini-3.1-flash-lite&quot;</span>
        </div>
      </div>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-(--landing-accent-soft) px-2.5 py-1 text-xs font-medium text-(--landing-accent)">
        <Sparkles className="h-3 w-3" aria-hidden="true" />
        Analyzing
      </span>
    </div>
  );
}

function RunVignette() {
  const rows = [
    { label: 'Sign-in redirects correctly', passed: true },
    { label: 'GitHub callback sets cookie', passed: true },
  ];
  return (
    <div className={cardClass}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center gap-2.5 rounded-lg border border-(--landing-border) bg-(--landing-bg) px-3 py-2.5"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-(--landing-accent)" aria-hidden="true" />
          <span className="truncate text-sm text-(--landing-ink)">{row.label}</span>
        </div>
      ))}
    </div>
  );
}

const steps = [
  {
    number: '01',
    title: 'Connect your repo',
    description:
      'Sign in with GitHub and pick a repository. Only read access to your code is required.',
    vignette: <ConnectVignette />,
  },
  {
    number: '02',
    title: 'Gemini analyzes the codebase',
    description: 'Gemini reads your code and automatically drafts relevant test cases for you.',
    vignette: <AnalyzeVignette />,
  },
  {
    number: '03',
    title: 'Review, edit, and run',
    description:
      'Edit any generated test case, then run it and see the pass or fail result instantly.',
    vignette: <RunVignette />,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="pt-16 pb-32 lg:pt-24 lg:pb-40">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="How it works">
          From repository to <GradientText>running tests in three steps</GradientText>.
        </SectionHeading>

        <div className="relative mt-16 grid gap-x-8 gap-y-12 md:grid-cols-3">
          <ConnectorLine />

          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.15}>
              <div className="relative z-10">
                <span className="absolute -top-2 -left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-(--landing-border) bg-(--landing-bg-raised) text-[11px] font-semibold text-(--landing-ink-muted)">
                  {step.number}
                </span>
                {step.vignette}
                <h3 className="mt-5 text-xl font-semibold text-(--landing-ink)">{step.title}</h3>
                <p className="mt-2 text-justify text-base leading-relaxed text-(--landing-ink-muted)">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
