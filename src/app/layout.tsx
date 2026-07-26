import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IPTV Checker — Check Your IPTV Subscription Status Online",
  description:
    "Free online IPTV checker tool. Verify your Xtream Codes IPTV subscription status, check expiry date, active connections, and account details instantly. No registration required.",
  keywords: [
    "IPTV checker",
    "IPTV status check",
    "Xtream Codes checker",
    "IPTV subscription checker",
    "IPTV account check",
    "free IPTV checker",
    "online IPTV validator",
    "IPTV URL checker",
  ],
  openGraph: {
    title: "IPTV Checker — Check Your IPTV Subscription Status Online",
    description:
      "Free online IPTV checker tool. Verify your Xtream Codes IPTV subscription status instantly.",
    type: "website",
    locale: "en_US",
    siteName: "IPTV Checker",
  },
  twitter: {
    card: "summary_large_image",
    title: "IPTV Checker — Check Your IPTV Subscription Status Online",
    description:
      "Free online IPTV checker tool. Verify your Xtream Codes IPTV subscription status instantly.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "IPTV Checker",
              description:
                "Free online IPTV checker tool. Verify your Xtream Codes IPTV subscription status.",
              operatingSystem: "Any",
              applicationCategory: "UtilityApplication",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
