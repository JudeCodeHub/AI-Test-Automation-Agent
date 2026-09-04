import type { Metadata } from 'next';
import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'EdgeCase — AI test coverage for your GitHub repos',
  description:
    'Connect a GitHub repo and let EdgeCase read your codebase with Gemini, draft test cases, and run them in a real browser with Browserbase.',
  openGraph: {
    title: 'EdgeCase — AI test coverage for your GitHub repos',
    description:
      'Connect a GitHub repo and let EdgeCase read your codebase with Gemini, draft test cases, and run them in a real browser with Browserbase.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <div className="landing-theme bg-(--landing-bg) text-(--landing-ink)">
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
