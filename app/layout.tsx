import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://donghyeok.net"),
  title: {
    default: "Donghyeok — Writing and building",
    template: "%s — Donghyeok",
  },
  description:
    "A personal collection of work, notes, and experiments by Donghyeok.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Donghyeok",
    title: "Donghyeok — Writing and building",
    description:
      "A personal collection of work, notes, and experiments by Donghyeok.",
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "Donghyeok — Writing and building",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Donghyeok — Writing and building",
    description:
      "A personal collection of work, notes, and experiments by Donghyeok.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon-16x16.png?v=mono-1" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png?v=mono-1" sizes="32x32" type="image/png" />
        <link rel="icon" href="/icon-512.png?v=mono-1" sizes="512x512" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=mono-1" sizes="180x180" />
      </head>
      <body>{children}</body>
    </html>
  );
}
