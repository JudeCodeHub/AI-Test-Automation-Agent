import Link from "next/link"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import Reveal from "./Reveal"
import OrbitalMap from "./OrbitalMap"
import SectionHeading, { GradientText } from "./SectionHeading"

export default function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-(--landing-bg-raised)/40">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading eyebrow="Features">
          One workspace, <GradientText>wired into the tools</GradientText> you already use.
        </SectionHeading>

        <div className="mt-16 grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
          <div>
            <Reveal>
              <p className="text-lg leading-relaxed text-(--landing-ink-muted) max-w-[46ch]">
                AI Test Agent sits in the middle of your stack: GitHub for code, Gemini for
                analysis, Browserbase for real-browser runs, Clerk for auth, Neon for storage,
                and Stripe when you're ready to upgrade. Nothing to glue together yourself.
              </p>
            </Reveal>

            <Reveal delay={0.16}>
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
