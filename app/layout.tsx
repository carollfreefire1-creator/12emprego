import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallBanner from "@/components/InstallBanner";
import CookieConsent from "@/components/CookieConsent";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sosservicos.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "SOS Serviços — Encontre profissionais de confiança perto de você",
    template: "%s | SOS Serviços",
  },
  description:
    "Encontre e contrate eletricistas, encanadores, pintores, diaristas e outros profissionais qualificados perto de você. Peça orçamentos grátis no SOS Serviços.",
  applicationName: "SOS Serviços",
  manifest: "/manifest.json",
  keywords: [
    "serviços residenciais",
    "encontrar profissional",
    "eletricista",
    "encanador",
    "diarista",
    "pintor",
    "orçamento de serviços",
  ],
  authors: [{ name: "SOS Serviços" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: "SOS Serviços",
    title: "SOS Serviços — Encontre profissionais de confiança",
    description:
      "Conectamos você a profissionais qualificados para serviços residenciais. Peça orçamentos grátis.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SOS Serviços" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SOS Serviços",
    description: "Encontre profissionais de confiança perto de você.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SOS Serviços",
  url: APP_URL,
  logo: `${APP_URL}/icons/icon-512.png`,
  description: "Plataforma de intermediação entre clientes e profissionais de serviços residenciais.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("sos-theme")?.value as "light" | "dark" | "system" | undefined;

  return (
    <html lang="pt-BR" className={themeCookie === "dark" ? "dark" : ""} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider initialTheme={themeCookie ?? "system"}>
          {children}
          <InstallBanner />
          <CookieConsent />
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
