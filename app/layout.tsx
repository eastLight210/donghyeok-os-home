import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dylankim.dev"),
  title: {
    default: "Dylan Kim — Writing and building",
    template: "%s — Dylan Kim",
  },
  description:
    "A personal collection of work, notes, and experiments by Dylan Kim.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Dylan Kim",
    title: "Dylan Kim — Writing and building",
    description:
      "A personal collection of work, notes, and experiments by Dylan Kim.",
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "Dylan Kim — Writing and building",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dylan Kim — Writing and building",
    description:
      "A personal collection of work, notes, and experiments by Dylan Kim.",
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
