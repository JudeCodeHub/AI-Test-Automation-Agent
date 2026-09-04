import Link from "next/link"
import { CheckCircle2, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import Reveal from "./Reveal"
import OrbitalMap from "./OrbitalMap"
import SectionHeading, { GradientText } from "./SectionHeading"
import WaveCap from "./WaveCap"

const FEATURES_BG = "var(--landing-accent-softer)"

const highlights = [
  "Real browser runs, not simulations",
  "Every generated case is editable before it runs",
  "Pass/fail history tracked per repository",
]

export default function Features() {
  return (
    <section id="features" className="relative py-24 lg:py-32" style={{ backgroundColor: FEATURES_BG }}>
      <WaveCap position="top" fill={FEATURES_BG} />
      <WaveCap position="bottom" fill={FEATURES_BG} />
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading eyebrow="Features">
          One workspace, <GradientText>wired into the tools</GradientText> you already use.
        </SectionHeading>

        <div className="mt-16 grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
          <div>
            <Reveal>
              <p className="text-lg leading-relaxed text-justify text-(--landing-ink-muted) max-w-[46ch]">
                Connect a repo and Gemini drafts the test cases for you. Every case runs in a
                real Browserbase session, not a simulation, so what passes here is what actually
                works in a browser.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <ul className="mt-6 space-y-3">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-(--landing-ink)">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-(--landing-accent)" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.2}>
              <Button
                asChild
                size="lg"
                className="mt-8 bg-(--landing-accent) hover:bg-(--landing-accent)/90 gap-2"
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
  )
}
