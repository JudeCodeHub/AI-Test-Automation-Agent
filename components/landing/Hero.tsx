import Link from "next/link"
import { Instrument_Serif } from "next/font/google"
import { ArrowRight, Github, ListChecks, MonitorPlay, Play, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Reveal from "./Reveal"
import HeroVisual from "./HeroVisual"

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
})

const kpis = [
  {
    icon: ListChecks,
    value: "3 steps",
    label: "Connect a repo, review, run tests.",
  },
  {
    icon: MonitorPlay,
    value: "Real browser",
    label: "Runs on Browserbase, not simulated.",
  },
  {
    icon: RefreshCw,
    value: "Auto-retried",
    label: "Flaky steps retry before they fail.",
  },
]

export default function Hero() {
  return (
    <section className={`relative overflow-hidden ${instrumentSerif.variable}`}>
      {/* Soft accent wash, contained to the hero only - not a full-bleed gradient-mesh cliché */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--landing-accent-soft), transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <Reveal>
              <span className="relative inline-flex items-center gap-1.5 rounded-full border border-(--landing-accent)/25 bg-(--landing-accent-softer) px-3.5 py-1.5 text-xs font-semibold tracking-wide text-(--landing-ink)">
                <span
                  aria-hidden="true"
                  className="absolute -inset-3 -z-10 rounded-full opacity-70 blur-lg"
                  style={{ background: "radial-gradient(circle, var(--landing-accent-soft), transparent 70%)" }}
                />
                <span>GITHUB</span>
                <ArrowRight className="h-3 w-3 text-(--landing-accent)" aria-hidden="true" />
                <span>GEMINI</span>
                <ArrowRight className="h-3 w-3 text-(--landing-accent)" aria-hidden="true" />
                <span>TEST CASES</span>
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1
                style={{ fontFamily: "var(--font-instrument-serif)" }}
                className="mt-5 text-4xl md:text-5xl lg:text-[3.25rem] font-normal tracking-tight leading-[1.15] text-(--landing-ink)"
              >
                Test coverage <em className="italic text-(--landing-accent)">without</em> writing tests by hand.
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-7 text-xl leading-relaxed text-(--landing-ink-muted) max-w-[58ch]">
                Connect a repo. Gemini drafts the test cases. Browserbase runs them in a real browser.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-(--landing-accent) hover:bg-(--landing-accent)/90 gap-2"
                >
                  <Link href="/workspace">
                    <Github className="h-4 w-4" />
                    Connect your GitHub repo
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 border-(--landing-border)">
                  <a href="#how-it-works">
                    <Play className="h-4 w-4" />
                    See how it works
                  </a>
                </Button>
              </div>
              <p className="mt-3 text-sm text-(--landing-ink-muted)">
                Free to start. No credit card required.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <HeroVisual />
          </Reveal>
        </div>

        <Reveal delay={0.3}>
          <div className="mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.value}
                className="rounded-2xl border border-(--landing-border) bg-(--landing-bg-raised) p-5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--landing-accent-soft) text-(--landing-accent)">
                  <kpi.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm font-semibold text-(--landing-ink)">{kpi.value}</p>
                <p className="mt-1 text-xs leading-relaxed text-(--landing-ink-muted)">{kpi.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
