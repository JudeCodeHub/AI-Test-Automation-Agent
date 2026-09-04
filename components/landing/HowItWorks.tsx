import { GitBranch, ListChecks, Sparkles } from "lucide-react"
import Reveal from "./Reveal"
import SectionHeading, { GradientText } from "./SectionHeading"

const steps = [
  {
    number: "01",
    icon: GitBranch,
    title: "Connect your repo",
    description: "Sign in with GitHub and pick a repository. OAuth scopes are limited to reading your code and metadata.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Gemini analyzes the codebase",
    description: "Gemini reads your routes, components, and API handlers, then drafts test cases with priorities and expected outcomes.",
  },
  {
    number: "03",
    icon: ListChecks,
    title: "Review, edit, and run",
    description: "Adjust any generated case, then run it in a real Browserbase session and see the pass/fail result with a full replay.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading eyebrow="How it works">
          From repository to <GradientText>running tests in three steps</GradientText>.
        </SectionHeading>

        <div className="mt-16 grid md:grid-cols-3 gap-x-8 gap-y-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Reveal key={step.number} delay={index * 0.1}>
                <div className="relative">
                  {index < steps.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="hidden md:block absolute top-6 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-(--landing-border)"
                    />
                  )}
                  <div className="flex md:flex-col items-start md:items-start gap-4">
                    <div className="relative shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-(--landing-accent-soft) text-(--landing-accent)">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-(--landing-bg-raised) border border-(--landing-border) text-[10px] font-semibold text-(--landing-ink-muted)">
                        {step.number}
                      </span>
                    </div>
                    <div className="md:mt-5">
                      <h3 className="text-lg font-semibold text-(--landing-ink)">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-(--landing-ink-muted)">{step.description}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
