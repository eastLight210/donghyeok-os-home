"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getBlogFeedSnapshot,
  getBlogFeedServerSnapshot,
  refreshBlogFeed,
  subscribeBlogFeed,
} from "@/src/content/blog-feed";

export default function BlogPosts() {
  const snapshot = useSyncExternalStore(
    subscribeBlogFeed,
    getBlogFeedSnapshot,
    getBlogFeedServerSnapshot
  );

  useEffect(() => {
    void refreshBlogFeed().catch(() => {});

    function refreshVisible() {
      if (document.visibilityState === "visible") {
        void refreshBlogFeed({ force: true }).catch(() => {});
      }
    }

    const interval = window.setInterval(refreshVisible, 60_000);
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, []);

  if (snapshot.status === "loading") {
    return (
      <div className="blog-posts-loading" role="status" aria-label="Loading latest posts">
        <p className="sr-only">Loading latest posts…</p>
        <div className="blog-skeleton" aria-hidden="true">
          <div className="blog-skeleton-row">
            <span className="blog-skeleton-title" style={{ width: "68%" }} />
            <span className="blog-skeleton-date" />
          </div>
          <div className="blog-skeleton-row">
            <span className="blog-skeleton-title" style={{ width: "48%" }} />
            <span className="blog-skeleton-date" />
          </div>
          <div className="blog-skeleton-row">
            <span className="blog-skeleton-title" style={{ width: "58%" }} />
            <span className="blog-skeleton-date" />
          </div>
        </div>
      </div>
    );
  }

  if (snapshot.status === "error") {
    return <p role="status">Couldn’t load posts. Please open the full blog below.</p>;
  }

  if (!snapshot.posts.length) {
    return <p role="status">No published posts yet.</p>;
  }

  return (
    <ol className="blog-app-posts">
      {snapshot.posts.map((post) => (
        <li key={post.href}>
          <a href={post.href} target="_blank" rel="noreferrer">
            <strong>{post.title}</strong>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                timeZone: "UTC",
              }).toUpperCase()}
            </time>
          </a>
        </li>
      ))}
    </ol>
  );
}
