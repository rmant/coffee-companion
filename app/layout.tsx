import type { Metadata } from "next";
import { Bebas_Neue, Source_Serif_4, Space_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Filtrado",
  description: "Tu diario personal de café pour-over",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${bebasNeue.variable} ${sourceSerif.variable} ${spaceMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-background">
          {/* Brutalist Header */}
          <header className="brutalist-header sticky top-0 z-50">
            <div className="header-inner">
              {/* Logo */}
              <Link href="/" className="group flex items-end gap-4">
                <div className="flex flex-col">
                  <span className="font-display text-4xl md:text-5xl tracking-tight text-paper leading-none">
                    FILTRADO
                  </span>
                  <span className="font-mono text-[10px] text-amber tracking-[0.3em] leading-none mt-1">
                    POUR-OVER JOURNAL
                  </span>
                </div>
              </Link>

              {/* Navigation - Brutalist style */}
              <nav className="flex items-center gap-2 md:gap-6">
                <Link href="/coffees" className="nav-brutalist">
                  <span className="nav-brutalist-text">CAFÉS</span>
                </Link>
                <Link href="/brewers" className="nav-brutalist">
                  <span className="nav-brutalist-text">CAFETERAS</span>
                </Link>
                <Link href="/brews" className="nav-brutalist">
                  <span className="nav-brutalist-text">REGISTROS</span>
                </Link>
                <Link href="/brews/new" className="btn-brutalist">
                  <span className="btn-brutalist-plus">+</span>
                  <span className="hidden md:inline">NUEVO</span>
                </Link>
              </nav>
            </div>
            {/* Diagonal accent line */}
            <div className="header-accent" />
          </header>

          {/* Main Content */}
          <main className="main-content">
            {children}
          </main>

          {/* Brutalist Footer */}
          <footer className="brutalist-footer">
            <div className="footer-inner">
              <div className="flex items-center gap-4">
                <span className="font-display text-lg text-stone">
                  FILTRADO
                </span>
                <span className="text-amber/40">///</span>
                <span className="font-body text-sm text-stone/70 italic">
                  tu diario de café
                </span>
              </div>
              <div className="font-mono text-[10px] text-stone/50 tracking-wider">
                SPECIALTY · CRAFT · POUR-OVER
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
