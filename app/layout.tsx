import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import type { Metadata } from "next";
import { Orbitron, Plus_Jakarta_Sans } from "next/font/google";
import Provider from './provider';

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EdgeCase — AI test coverage for your GitHub repos",
  description: "Connect a GitHub repo and let EdgeCase read your codebase, draft test cases, and run them in a real browser.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "var(--primary)",
          colorBackground: "var(--background)",
          colorText: "var(--foreground)",
          colorTextSecondary: "var(--muted-foreground)",
          colorInputBackground: "var(--background)",
          colorInputText: "var(--foreground)",
          colorNeutral: "var(--border)",
          borderRadius: "var(--radius)",
          fontFamily: "var(--font-jakarta), ui-sans-serif, system-ui, sans-serif",
        },
        elements: {
          card: "shadow-none border border-(--border)",
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
          footerActionLink: "text-primary hover:text-primary/90",
        },
      }}
    >
      <html lang="en" className={`scroll-smooth ${jakarta.variable} ${orbitron.variable}`}>
        <body style={{ margin: 0, padding: 0 }} className="font-sans">
          <Provider>
            {children}
          </Provider>

        </body>
      </html>
    </ClerkProvider>
  );
}
