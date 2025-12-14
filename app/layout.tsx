import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PK55 - Premium Quality Products & Services",
  description: "PK55 offers premium quality products and services. Discover excellence with our comprehensive solutions tailored to meet your needs.",
  keywords: ["PK55", "premium products", "quality services", "Pakistan"],
  authors: [{ name: "PK55" }],
  openGraph: {
    title: "PK55 - Premium Quality Products & Services",
    description: "PK55 offers premium quality products and services. Discover excellence with our comprehensive solutions.",
    type: "website",
    locale: "en_US",
    siteName: "PK55",
  },
  twitter: {
    card: "summary_large_image",
    title: "PK55 - Premium Quality Products & Services",
    description: "PK55 offers premium quality products and services. Discover excellence with our comprehensive solutions.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
