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
