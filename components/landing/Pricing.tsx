import { Check } from "lucide-react"
import Reveal from "./Reveal"
import CheckoutButton from "./CheckoutButton"
import SectionHeading, { GradientText } from "./SectionHeading"

type Tier = {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: React.ReactNode
  highlighted?: boolean
}

export default function Pricing() {
  const tiers: Tier[] = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Try the full workflow on a single repository.",
      features: [
        "1 connected repository",
        "1,000 AI credits",
        "Unlimited generated test cases",
        "Community support",
      ],
      cta: (
        <a
          href="/sign-up"
          className="inline-flex h-9 w-full items-center justify-center rounded-md border border-(--landing-border) text-sm font-medium text-(--landing-ink) hover:bg-(--landing-bg) transition-colors"
        >
          Start free
        </a>
      ),
    },
    {
      name: "Pro",
      price: "$29",
      period: "/ month",
      description: "For a small team shipping regularly.",
      features: [
        "5 connected repositories",
        "10,000 AI credits / month",
        "Real-browser test runs with Browserbase",
        "Session replay & screenshots",
        "Priority support",
      ],
      cta: (
        <CheckoutButton
          priceId={process.env.STRIPE_PRICE_PRO_MONTHLY || null}
          className="w-full bg-(--landing-accent) hover:bg-(--landing-accent)/90"
        >
          Upgrade to Pro
        </CheckoutButton>
      ),
      highlighted: true,
    },
    {
      name: "Team",
      price: "$99",
      period: "/ month",
      description: "For teams standardizing coverage across projects.",
      features: [
        "Unlimited repositories",
        "50,000 AI credits / month",
        "Everything in Pro",
        "Shared workspace for your team",
        "Dedicated support",
      ],
      cta: (
        <CheckoutButton
          priceId={process.env.STRIPE_PRICE_TEAM_MONTHLY || null}
          variant="outline"
          className="w-full border-(--landing-border)"
        >
          Upgrade to Team
        </CheckoutButton>
      ),
    },
  ]

  return (
    <section id="pricing" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading eyebrow="Pricing">
          Start free. Upgrade when <GradientText>your test suite grows</GradientText>.
        </SectionHeading>

        <div className="mt-16 grid md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier, index) => (
            <Reveal key={tier.name} delay={index * 0.08}>
              <div
                className={`relative rounded-2xl border p-6 h-full flex flex-col ${
                  tier.highlighted
                    ? "border-(--landing-accent) bg-(--landing-bg-raised) shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] md:-translate-y-2"
                    : "border-(--landing-border) bg-(--landing-bg-raised)"
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-6 rounded-full bg-(--landing-accent) px-3 py-1 text-[11px] font-semibold text-white">
                    Most popular
                  </span>
                )}

                <h3 className="text-lg font-semibold text-(--landing-ink)">{tier.name}</h3>
                <p className="mt-1 text-sm text-(--landing-ink-muted)">{tier.description}</p>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight text-(--landing-ink)">{tier.price}</span>
                  <span className="text-sm text-(--landing-ink-muted)">{tier.period}</span>
                </div>

                <ul className="mt-6 space-y-2.5 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-(--landing-ink-muted)">
                      <Check className="h-4 w-4 text-(--landing-accent) shrink-0 mt-0.5" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">{tier.cta}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
