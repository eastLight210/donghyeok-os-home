"use client";

import { useEffect, useState } from "react";
import { parseBlogFeed, type BlogPost } from "@/src/content/blog-feed";

type FeedState = { status: "loading" | "error" } | { status: "ready"; posts: BlogPost[] };

export default function BlogPosts() {
  const [state, setState] = useState<FeedState>({ status: "loading" });
  useEffect(() => {
    let disposed = false;
    let pending: AbortController | undefined;
    async function refresh() {
      if (pending) return;
      const controller = new AbortController();
      pending = controller;
      const timeout = window.setTimeout(() => controller.abort(), 15_000);
      try {
        const response = await fetch("/api/blog-feed", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Blog feed unavailable");
        const posts = parseBlogFeed(await response.text());
        if (!disposed) setState({ status: "ready", posts });
      } catch {
        if (!disposed) setState({ status: "error" });
      } finally {
        window.clearTimeout(timeout);
        pending = undefined;
      }
    }
    function refreshVisible() {
      if (document.visibilityState === "visible") void refresh();
    }
    void refresh();
    const interval = window.setInterval(refreshVisible, 60_000);
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      disposed = true;
      pending?.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, []);

  if (state.status !== "ready") {
    return <p role="status">{state.status === "loading" ? "Loading latest posts…" : "Couldn’t load posts. Please open the full blog below."}</p>;
  }
  if (!state.posts.length) return <p role="status">No published posts yet.</p>;
  return (
    <ol className="blog-app-posts">
      {state.posts.map((post) => (
        <li key={post.href}>
          <a href={post.href} target="_blank" rel="noreferrer">
            <strong>{post.title}</strong>
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-US", {
              month: "short", day: "2-digit", timeZone: "UTC",
            }).toUpperCase()}</time>
          </a>
        </li>
      ))}
    </ol>
  );
}
