import BlogPosts from "./BlogPosts";
import type { CSSProperties } from "react";
import { getPublicApp, type PublicAppId } from "@/src/content/public-apps";
import { projects, nowItems, contactProfile, contactLinks } from "@/src/content/site-content";

export default function AppContent({ appId }: { appId: PublicAppId }) {
  if (appId === "blog") {
    const blogUrl = getPublicApp("blog").href;

    return (
      <div className="blog-app-content">
        <p className="app-intro">
          Essays, field notes, and ordinary days collected on my public blog.
        </p>
        <BlogPosts />
        {blogUrl ? (
          <a
            className="blog-site-link"
            href={blogUrl}
            target="_blank"
            rel="noreferrer"
          >
            OPEN THE FULL BLOG{" "}
            <span className="link-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        ) : null}
      </div>
    );
  }

  if (appId === "projects") {
    return (
      <div className="projects-list">
        {projects.map((project, index) => (
          <article
            key={project.title}
            style={{ "--stagger": index } as CSSProperties}
          >
            <div>
              <span>{project.status}</span>
              <h2>{project.title}</h2>
              <p>{project.summary}</p>
            </div>
            <footer>
              <ul aria-label={`${project.title} technologies`}>
                {project.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
              {"href" in project && project.href ? (
                <a href={project.href}>
                  VISIT{" "}
                  <span className="link-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              ) : null}
            </footer>
          </article>
        ))}
      </div>
    );
  }

  if (appId === "now") {
    return (
      <div className="now-list">
        <p className="app-intro">
          A small, manually maintained snapshot of what has my attention.
        </p>
        <dl>
          {nowItems.map(({ label, value }, index) => (
            <div key={label} style={{ "--stagger": index } as CSSProperties}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="updated-label">UPDATED SEP 2026</p>
      </div>
    );
  }

  if (appId === "contact") {
    return (
      <div className="contact-content">
        <p className="contact-lead">{contactProfile.introduction}</p>
        <p>{contactProfile.description}</p>
        <div className="contact-links" aria-label="Public contact links">
          {contactLinks.map((link, index) => (
            <a
              href={link.href}
              key={link.label}
              style={{ "--stagger": index } as CSSProperties}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            >
              <span>{link.label}</span>
              <strong>{link.value}</strong>
            </a>
          ))}
        </div>
        <span>{contactProfile.location}</span>
      </div>
    );
  }

  return null;
}
