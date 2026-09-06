import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import BlogPosts from "@/src/components/BlogPosts";
import { parseBlogFeed } from "@/src/content/blog-feed";
import { GET } from "@/app/api/blog-feed/route";

const feed = (title = "New &amp; current") => `<rss><channel><item><title>${title}</title><link>https://blog.donghyeok.net/posts/new/</link><pubDate>Sun, 06 Sep 2026 00:00:00 GMT</pubDate></item></channel></rss>`;
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe("live blog feed", () => {
  it("decodes titles and handles an empty feed without old fallback posts", () => {
    expect(parseBlogFeed(feed())[0]).toEqual({ title: "New & current", href: "https://blog.donghyeok.net/posts/new/", date: "2026-09-06T00:00:00.000Z" });
    expect(parseBlogFeed("<rss><channel/></rss>")).toEqual([]);
    expect(() => parseBlogFeed("<html/>")).toThrow();
    expect(() => parseBlogFeed(feed().replace("https://blog.donghyeok.net/posts/new/", "javascript:alert(1)"))).toThrow();
  });
  it("proxies the live feed without caching and reports upstream failures", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(feed())).mockResolvedValueOnce(new Response("failed", { status: 503 }));
    vi.stubGlobal("fetch", fetcher);
    const response = await GET();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe(feed());
    expect(fetcher.mock.calls[0][0]).toBe("https://blog.donghyeok.net/rss.xml");
    expect(fetcher.mock.calls[0][1].cache).toBe("no-store");
    expect((await GET()).status).toBe(502);
  });
  it("refreshes additions and deletions, clears stale posts on failure, and stops on close", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(feed()))
      .mockResolvedValueOnce(new Response(feed("Replacement")))
      .mockResolvedValueOnce(new Response("<rss><channel/></rss>"))
      .mockRejectedValueOnce(new Error("offline"));
    vi.stubGlobal("fetch", fetcher);
    const container = document.createElement("div");
    const root = createRoot(container);
    try {
      await act(async () => root.render(<BlogPosts />));
      expect(container.textContent).toContain("New & current");
      await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
      expect(container.textContent).toContain("Replacement");
      expect(container.textContent).not.toContain("New & current");
      await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
      expect(container.textContent).toContain("No published posts");
      await act(async () => { window.dispatchEvent(new Event("focus")); });
      expect(container.textContent).toContain("Couldn’t load posts");
    } finally { await act(async () => root.unmount()); }
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
});
