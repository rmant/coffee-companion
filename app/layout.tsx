import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-flow-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-flow-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coffee Companion",
  description: "Registro personal de preparaciones y seguimiento de café para entusiastas del pour-over",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${cormorant.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-background">
          {/* Encabezado */}
          <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-6">
              <div className="flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="group flex items-center gap-3">
                  <div className="relative">
                    {/* Coffee cup icon */}
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      className="text-[#3c2415] transition-transform group-hover:rotate-[-5deg]"
                    >
                      <path
                        d="M6 10h16v14a4 4 0 01-4 4h-8a4 4 0 01-4-4V10z"
                        fill="currentColor"
                        opacity="0.15"
                      />
                      <path
                        d="M6 10h16v14a4 4 0 01-4 4h-8a4 4 0 01-4-4V10z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 12h2a3 3 0 010 6h-2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10 5c0-1 .5-2 2-2s2 1 2 2M14 5c0-1 .5-2 2-2s2 1 2 2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity="0.5"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="flow-display text-xl tracking-tight text-[#3c2415]">
                      Coffee Companion
                    </span>
                    <span className="flow-display-light text-xs text-[#c45c3e] -mt-1">
                      tu guía de preparación
                    </span>
                  </div>
                </Link>

                {/* Navegación */}
                <nav className="flex items-center gap-8">
                  <Link
                    href="/coffees"
                    className="nav-link text-sm font-medium text-[#4a4540] hover:text-[#3c2415] transition-colors"
                  >
                    Cafés
                  </Link>
                  <Link
                    href="/brewers"
                    className="nav-link text-sm font-medium text-[#4a4540] hover:text-[#3c2415] transition-colors"
                  >
                    Cafeteras
                  </Link>
                  <Link
                    href="/brews"
                    className="nav-link text-sm font-medium text-[#4a4540] hover:text-[#3c2415] transition-colors"
                  >
                    Preparaciones
                  </Link>
                  <Link
                    href="/brews/new"
                    className="btn-vintage text-sm"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="opacity-80"
                    >
                      <path
                        d="M8 3v10M3 8h10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Registrar
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Contenido Principal */}
          <main className="container mx-auto px-6 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-border/40 mt-auto">
            <div className="container mx-auto px-6 py-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p className="flow-display-light">
                  hecho con cariño y cafeína
                </p>
                <p className="flow-mono text-xs opacity-60">
                  pour-over companion
                </p>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
