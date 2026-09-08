export type BlogPost = { title: string; href: string; date: string };

// RSS is parsed in the browser using its XML parser; no HTML from the feed is rendered.
export function parseBlogFeed(xml: string): BlogPost[] {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  if (document.querySelector("parsererror") || !document.querySelector("rss > channel")) {
    throw new Error("Invalid blog feed");
  }
  return Array.from(document.querySelectorAll("rss > channel > item"), (item) => {
    const title = item.querySelector("title")?.textContent?.trim();
    const href = item.querySelector("link")?.textContent?.trim();
    const date = new Date(item.querySelector("pubDate")?.textContent ?? "");
    if (!title || !href || !Number.isFinite(date.getTime())) throw new Error("Invalid blog post");
    const url = new URL(href);
    if (url.origin !== "https://blog.donghyeok.net" || !url.pathname.startsWith("/posts/")) {
      throw new Error("Invalid blog link");
    }
    return { title, href: url.href, date: date.toISOString() };
  }).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
}

export type BlogFeedStatus = "loading" | "ready" | "error";

export interface BlogFeedSnapshot {
  status: BlogFeedStatus;
  posts: BlogPost[];
}

const FRESHNESS_MS = 60_000;
const ERROR_COOLDOWN_MS = 5_000;

let lastFetchedAt = 0;
let lastAttemptAt = 0;
let inFlight: Promise<BlogPost[]> | null = null;
const listeners = new Set<() => void>();

let currentSnapshot: BlogFeedSnapshot = {
  status: "loading",
  posts: [],
};

const serverSnapshot: BlogFeedSnapshot = {
  status: "loading",
  posts: [],
};
export function subscribeBlogFeed(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getBlogFeedSnapshot(): BlogFeedSnapshot {
  if (typeof window === "undefined") return serverSnapshot;
  return currentSnapshot;
}

export function getBlogFeedServerSnapshot(): BlogFeedSnapshot {
  return serverSnapshot;
}

export async function refreshBlogFeed(options?: { force?: boolean }): Promise<BlogPost[]> {
  if (typeof window === "undefined") return [];

  if (inFlight) return inFlight;

  const isFresh = currentSnapshot.status === "ready" && Date.now() - lastFetchedAt < FRESHNESS_MS;
  if (!options?.force && isFresh) {
    return currentSnapshot.posts;
  }

  if (currentSnapshot.status !== "ready" && currentSnapshot.status !== "loading") {
    currentSnapshot = {
      status: "loading",
      posts: [],
    };
    listeners.forEach((listener) => listener());
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15_000);

  const fetchPromise = (async () => {
    try {
      const response = await fetch("/api/blog-feed", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Blog feed unavailable");
      const text = await response.text();
      const posts = parseBlogFeed(text);

      lastFetchedAt = Date.now();
      lastAttemptAt = Date.now();
      currentSnapshot = {
        status: "ready",
        posts,
      };

      listeners.forEach((listener) => listener());
      return posts;
    } catch (err) {
      lastAttemptAt = Date.now();
      if (currentSnapshot.status !== "ready") {
        currentSnapshot = {
          status: "error",
          posts: [],
        };
        listeners.forEach((listener) => listener());
      }
      throw err;
    } finally {
      window.clearTimeout(timeoutId);
      inFlight = null;
    }
  })();

  inFlight = fetchPromise;
  return fetchPromise;
}

export function prefetchBlogPosts(): void {
  if (typeof window === "undefined") return;
  if (currentSnapshot.status === "error" && Date.now() - lastAttemptAt < ERROR_COOLDOWN_MS) {
    return;
  }
  if (currentSnapshot.status === "ready" && Date.now() - lastFetchedAt < FRESHNESS_MS) {
    return;
  }
  void refreshBlogFeed().catch(() => {});
}
