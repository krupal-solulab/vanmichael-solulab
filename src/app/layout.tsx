import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/content/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBar } from "@/components/MobileBar";
import { JsonLd } from "@/components/JsonLd";
import { organizationSchema } from "@/lib/schema";

/**
 * Fonts are loaded with a stylesheet link rather than `next/font/google`.
 * `next/font` downloads the files during `next build`, so a slow or blocked
 * fonts.googleapis.com breaks CI. This way the build never touches the network.
 * To self-host instead, see README > "Switching to next/font".
 */
const FONTS =
  "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,300;6..72,400&family=Public+Sans:wght@400;500;600;700&display=swap";

export const viewport: Viewport = { themeColor: "#1C3A33", width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | Hair Salon in Atlanta — Nine Locations`, template: `%s | ${site.name}` },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_US", siteName: site.name, title: `${site.name} | Hair Salon in Atlanta`, description: site.description },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%231C3A33'/%3E%3Ctext x='50%25' y='56%25' text-anchor='middle' font-family='Georgia,serif' font-size='30' fill='%23F2F1EC'%3EVM%3C/text%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>
        <a href="#main" className="absolute left-[-9999px] top-0 z-[200] bg-green px-5 py-3 text-green-ink focus:left-0">
          Skip to content
        </a>
        <JsonLd data={organizationSchema()} />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <MobileBar />
      </body>
    </html>
  );
}
