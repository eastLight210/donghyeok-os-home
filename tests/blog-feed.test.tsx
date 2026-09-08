import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseBlogFeed } from "@/src/content/blog-feed";
import { GET } from "@/app/api/blog-feed/route";

const feed = (title = "New &amp; current") =>
  `<rss><channel><item><title>${title}</title><link>https://blog.donghyeok.net/posts/new/</link><pubDate>Sun, 06 Sep 2026 00:00:00 GMT</pubDate></item></channel></rss>`;

// Dynamic imports load fresh module instances after vi.resetModules() to avoid test backdoors in production code.
beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("live blog feed", () => {
  it("decodes titles and handles an empty feed without old fallback posts", () => {
    expect(parseBlogFeed(feed())[0]).toEqual({
      title: "New & current",
      href: "https://blog.donghyeok.net/posts/new/",
      date: "2026-09-06T00:00:00.000Z",
    });
    expect(parseBlogFeed("<rss><channel/></rss>")).toEqual([]);
    expect(() => parseBlogFeed("<html/>")).toThrow();
    expect(() =>
      parseBlogFeed(feed().replace("https://blog.donghyeok.net/posts/new/", "javascript:alert(1)"))
    ).toThrow();
  });

  it("proxies the live feed without caching and reports upstream failures", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(feed()))
      .mockResolvedValueOnce(new Response("failed", { status: 503 }));
    vi.stubGlobal("fetch", fetcher);
    const response = await GET();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe(feed());
    expect(fetcher.mock.calls[0][0]).toBe("https://blog.donghyeok.net/rss.xml");
    expect(fetcher.mock.calls[0][1].cache).toBe("no-store");
    expect((await GET()).status).toBe(502);
  });

  it("refreshes additions and deletions, preserves readable posts on failure, and stops on close", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const { default: BlogPosts } = await import("@/src/components/BlogPosts");
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(feed("Initial post")))
      .mockRejectedValueOnce(new Error("offline refresh"))
      .mockResolvedValueOnce(new Response(feed("Replacement post")))
      .mockResolvedValueOnce(new Response("<rss><channel/></rss>"));
    vi.stubGlobal("fetch", fetcher);
    const container = document.createElement("div");
    const root = createRoot(container);
    try {
      await act(async () => root.render(<BlogPosts />));
      expect(container.textContent).toContain("Initial post");

      // Advance time to trigger background refresh, which rejects offline while cached posts are displayed
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60_000);
      });
      // Preserves readable posts and does not display error status
      expect(container.textContent).toContain("Initial post");
      expect(container.querySelector('[role="status"]')).toBeNull();

      // Advance time for successful replacement
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60_000);
      });
      expect(container.textContent).toContain("Replacement post");
      expect(container.textContent).not.toContain("Initial post");

      // Trigger empty-feed refresh on focus
      await act(async () => {
        window.dispatchEvent(new Event("focus"));
      });
      expect(container.textContent).toContain("No published posts");
      expect(container.querySelector("ol")).toBeNull();
    } finally {
      await act(async () => root.unmount());
    }
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it("displays loading status on cold load, reports error on failure, and transitions to loading on retry", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const { default: BlogPosts } = await import("@/src/components/BlogPosts");
    const { refreshBlogFeed } = await import("@/src/content/blog-feed");
    const { promise: pending1, reject: rejectFetch1 } = Promise.withResolvers<Response>();
    const { promise: pending2, resolve: resolveFetch2 } = Promise.withResolvers<Response>();
    const fetcher = vi.fn().mockReturnValueOnce(pending1).mockReturnValueOnce(pending2);
    vi.stubGlobal("fetch", fetcher);
    const container = document.createElement("div");
    const root = createRoot(container);
    try {
      await act(async () => root.render(<BlogPosts />));
      const loadingStatus = container.querySelector('[role="status"]');
      expect(loadingStatus).not.toBeNull();
      expect(loadingStatus?.getAttribute("aria-label")).toMatch(/loading/i);
      expect(container.querySelector("ol")).toBeNull();

      await act(async () => {
        rejectFetch1(new Error("network error"));
      });
      const errorStatus = container.querySelector('[role="status"]');
      expect(errorStatus).not.toBeNull();
      expect(container.querySelector("ol")).toBeNull();

      let retryPromise: Promise<unknown>;
      await act(async () => {
        retryPromise = refreshBlogFeed().catch(() => {});
      });
      const retryLoadingStatus = container.querySelector('[role="status"]');
      expect(retryLoadingStatus).not.toBeNull();
      expect(retryLoadingStatus?.getAttribute("aria-label")).toMatch(/loading/i);

      await act(async () => {
        resolveFetch2(new Response(feed("Recovered post")));
        await retryPromise;
      });
      expect(container.textContent).toContain("Recovered post");
      expect(container.querySelector("ol")).not.toBeNull();
      expect(container.querySelector('[role="status"]')).toBeNull();
    } finally {
      await act(async () => root.unmount());
    }
  });

  it("persists posts in memory across closing and reopening while cache is fresh without re-fetching", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const { default: BlogPosts } = await import("@/src/components/BlogPosts");
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(feed("Cached post")));
    vi.stubGlobal("fetch", fetcher);
    const container = document.createElement("div");
    let root = createRoot(container);
    try {
      await act(async () => root.render(<BlogPosts />));
      expect(container.textContent).toContain("Cached post");
      expect(fetcher).toHaveBeenCalledTimes(1);
    } finally {
      await act(async () => root.unmount());
    }

    root = createRoot(container);
    try {
      await act(async () => root.render(<BlogPosts />));
      expect(container.textContent).toContain("Cached post");
      expect(container.querySelector('[role="status"]')).toBeNull();
      expect(fetcher).toHaveBeenCalledTimes(1);
    } finally {
      await act(async () => root.unmount());
    }
  });

  it("triggers background refresh on reopen when stale, preserving cached posts on offline failure", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const { default: BlogPosts } = await import("@/src/components/BlogPosts");
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(feed("Cached post")))
      .mockRejectedValueOnce(new Error("offline refresh"));
    vi.stubGlobal("fetch", fetcher);
    const container = document.createElement("div");
    let root = createRoot(container);
    try {
      await act(async () => root.render(<BlogPosts />));
      expect(container.textContent).toContain("Cached post");
    } finally {
      await act(async () => root.unmount());
    }

    await vi.advanceTimersByTimeAsync(60_001);

    root = createRoot(container);
    try {
      await act(async () => root.render(<BlogPosts />));
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(container.textContent).toContain("Cached post");
      expect(container.querySelector('[role="status"]')).toBeNull();
    } finally {
      await act(async () => root.unmount());
    }
  });

  it("survives unmount while request is pending, rendering resolved posts upon reopen under StrictMode", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const { default: BlogPosts } = await import("@/src/components/BlogPosts");
    const { StrictMode } = await import("react");
    const { promise: pending, resolve: resolveFetch } = Promise.withResolvers<Response>();
    const fetcher = vi.fn().mockReturnValue(pending);
    vi.stubGlobal("fetch", fetcher);

    const container = document.createElement("div");
    let root = createRoot(container);

    await act(async () => {
      root.render(
        <StrictMode>
          <BlogPosts />
        </StrictMode>
      );
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[role="status"]')).not.toBeNull();

    await act(async () => root.unmount());

    root = createRoot(container);
    await act(async () => {
      root.render(
        <StrictMode>
          <BlogPosts />
        </StrictMode>
      );
    });
    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch(new Response(feed("Resolved after reopen")));
    });

    expect(container.textContent).toContain("Resolved after reopen");
    expect(container.querySelector("ol")).not.toBeNull();
    expect(container.querySelector('[role="status"]')).toBeNull();

    await act(async () => root.unmount());
  });

  it("deduplicates concurrent requests and prevents hover floods on prefetch", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const { default: BlogPosts } = await import("@/src/components/BlogPosts");
    const { prefetchBlogPosts } = await import("@/src/content/blog-feed");
    const { promise: pending, resolve: resolveFetch } = Promise.withResolvers<Response>();
    const fetcher = vi.fn().mockReturnValue(pending);
    vi.stubGlobal("fetch", fetcher);

    prefetchBlogPosts();
    prefetchBlogPosts();
    prefetchBlogPosts();
    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch(new Response(feed("Prefetched post")));
    });

    prefetchBlogPosts();
    prefetchBlogPosts();
    expect(fetcher).toHaveBeenCalledTimes(1);

    const container = document.createElement("div");
    const root = createRoot(container);
    try {
      await act(async () => root.render(<BlogPosts />));
      expect(container.textContent).toContain("Prefetched post");
      expect(container.querySelector('[role="status"]')).toBeNull();
    } finally {
      await act(async () => root.unmount());
    }
  });
});
