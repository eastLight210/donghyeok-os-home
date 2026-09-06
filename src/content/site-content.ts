export const projects = [
  {
    title: "DonghyeokOS",
    status: "BUILDING",
    summary:
      "A minimal personal home for writing, projects, and experiments, with an interactive application reel.",
    technologies: ["React", "TypeScript", "Motion", "Cloudflare"],
  },
  {
    title: "Personal Blog",
    status: "LIVE",
    summary:
      "A static-first writing space for development notes, learning logs, and ordinary days.",
    technologies: ["Astro", "MDX", "Cloudflare Workers"],
    href: "https://blog.donghyeok.net",
  },
  {
    title: "SSD Remover",
    status: "LIVE",
    summary:
      "A macOS menu bar utility that finds processes blocking external drives, lets you stop them selectively, and ejects disks safely.",
    technologies: ["Swift", "SwiftUI", "Swift Concurrency", "CLI"],
    href: "https://github.com/eastLight210/SSD_Remover",
  },
  {
    title: "TrackPinch",
    status: "ALPHA",
    summary:
      "A macOS menu bar utility for resizing the active window with a modifier key and a two-finger trackpad gesture.",
    technologies: ["Swift", "SwiftUI", "AppKit", "Accessibility"],
    href: "https://github.com/eastLight210/TrackPinch",
  },
] as const;

export const nowItems = [
  {
    label: "SCHOOL",
    value: "KAIST Computer Science undergraduate, 2021 cohort",
  },
  {
    label: "PREVIOUSLY",
    value:
      "Software developer on the NIKKE Engine Team at SHIFT UP · Jan 31, 2024 — May 8, 2026",
  },
  {
    label: "NEXT",
    value: "Returning to KAIST for the fall semester on Aug 31, 2026",
    home: "returning to KAIST this fall",
  },
  {
    label: "WRITING",
    value: "Occasional blog posts on whatever feels worth writing about",
    home: "writing occasional blog posts",
  },
  {
    label: "MAKING",
    value: "Small personal tools whenever I need them, without a fixed project",
    home: "making small tools for myself",
  },
] as const;

export const homeNowItems = nowItems.flatMap((item) =>
  "home" in item ? [item.home] : [],
);

export const contactProfile = {
  introduction:
    "A KAIST Computer Science undergraduate who enjoys building software and writing.",
  description:
    "You can reach me by email or find my work and background through the links below.",
  location: "DONGHYEOK.NET / SEJONG",
} as const;

export const contactLinks = [
  {
    label: "EMAIL",
    value: "me@donghyeok.net",
    href: "mailto:me@donghyeok.net",
  },
  {
    label: "GITHUB",
    value: "eastLight210",
    href: "https://github.com/eastLight210",
  },
  {
    label: "LINKEDIN",
    value: "Donghyeok Kim",
    href:
      "https://www.linkedin.com/in/%EB%8F%99%ED%98%81-%EA%B9%80-37775a397/",
  },
] as const;
