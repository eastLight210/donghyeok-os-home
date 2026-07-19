export type PublicAppId = "blog" | "projects" | "now" | "contact";

export interface PublicApp {
  id: PublicAppId;
  label: string;
  shortLabel: string;
  tone: "orange" | "ink" | "blue" | "green";
  glyph: string;
  kind: "internal" | "external";
  href?: string;
  reelImage: string;
  preview: {
    eyebrow: string;
    title: string;
    description: string;
  };
}

export const publicApps: readonly PublicApp[] = [
  {
    id: "blog",
    label: "Blog",
    shortLabel: "B",
    tone: "orange",
    glyph: "B",
    kind: "internal",
    href: "https://blog.donghyeok.net",
    reelImage: "/images/reel/blog.jpg",
    preview: {
      eyebrow: "01 / WRITING",
      title: "Blog",
      description: "Essays, field notes, and things learned by writing them down.",
    },
  },
  {
    id: "projects",
    label: "Projects",
    shortLabel: "{}",
    tone: "ink",
    glyph: "{}",
    kind: "internal",
    reelImage: "/images/reel/projects.jpg",
    preview: {
      eyebrow: "02 / BUILDING",
      title: "Projects",
      description: "Selected systems, experiments, and small tools.",
    },
  },
  {
    id: "now",
    label: "Now",
    shortLabel: "n",
    tone: "green",
    glyph: "n",
    kind: "internal",
    reelImage: "/images/reel/now.jpg",
    preview: {
      eyebrow: "03 / CURRENTLY",
      title: "Now",
      description: "Between industry service and returning to KAIST.",
    },
  },
  {
    id: "contact",
    label: "Contact",
    shortLabel: "@",
    tone: "blue",
    glyph: "@",
    kind: "internal",
    reelImage: "/images/reel/contact.jpg",
    preview: {
      eyebrow: "04 / SAY HELLO",
      title: "Contact",
      description: "Email and public profiles for getting in touch.",
    },
  },
] as const;

export const getPublicApp = (id: PublicAppId) =>
  publicApps.find((app) => app.id === id) ?? publicApps[0];

export const isPublicAppId = (value: string | null): value is PublicAppId =>
  publicApps.some((app) => app.id === value);
