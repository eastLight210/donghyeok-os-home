import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://donghyeok.net"),
  title: {
    default: "DonghyeokOS — A personal desktop on the internet",
    template: "%s — DonghyeokOS",
  },
  description:
    "Donghyeok's warm personal desktop for writing, projects, and useful systems.",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "DonghyeokOS",
    title: "DonghyeokOS — A personal desktop on the internet",
    description:
      "Writing, projects, and useful systems from Donghyeok's desk on the internet.",
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "DonghyeokOS — A personal desktop on the internet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DonghyeokOS — A personal desktop on the internet",
    description:
      "Writing, projects, and useful systems from Donghyeok's desk on the internet.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f0e2",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
