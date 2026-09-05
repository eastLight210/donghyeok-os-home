import { describe, expect, it } from "vitest";
import {
  experienceReducer,
  initialExperienceState,
} from "@/src/app/experience-machine";
import { publicApps } from "@/src/content/public-apps";
import {
  contactLinks,
  contactProfile,
  homeNowItems,
  nowItems,
  projects,
} from "@/src/content/site-content";

describe("minimal home state", () => {
  it("starts directly on the reel and keeps an unbounded rotation offset", () => {
    expect(initialExperienceState).toEqual({ name: "home", selection: 1 });
    let state = initialExperienceState;
    for (let i = 0; i < 20; i++) state = experienceReducer(state, { type: "ROTATE", direction: -1 });
    expect(state).toEqual({ name: "home", selection: -19 });
  });
  it("preserves selection across content and browser navigation", () => {
    const home = { name: "home" as const, selection: 6 };
    const open = experienceReducer(home, { type: "OPEN_APP", appId: "blog" });
    expect(experienceReducer(open, { type: "ROTATE", direction: 1 })).toEqual(open);
    expect(experienceReducer(open, { type: "CLOSE" })).toEqual(home);
    expect(experienceReducer(home, { type: "NAVIGATE", appId: "contact" })).toEqual({ name: "content", selection: 6, appId: "contact" });
  });
});

describe("public app contract", () => {
  it("contains the approved app order only", () => {
    expect(publicApps.map((app) => app.id)).toEqual([
      "blog",
      "projects",
      "now",
      "contact",
    ]);

  });

  it("contains no private app metadata", () => {
    expect(publicApps.find((app) => app.id === "blog")?.kind).toBe("internal");
    expect(JSON.stringify(publicApps).toLowerCase()).not.toContain("finance");
  });

  it("contains the approved public profile content", () => {
    expect(projects.find((project) => project.title === "SSD Remover")).toMatchObject({
      href: "https://github.com/eastLight210/SSD_Remover",
      status: "LIVE",
    });
    expect(projects.find((project) => project.title === "TrackPinch")).toMatchObject({
      href: "https://github.com/eastLight210/TrackPinch",
      status: "ALPHA",
    });
    expect(JSON.stringify(nowItems)).toContain("SHIFT UP");
    expect(JSON.stringify(nowItems)).toContain("NIKKE Engine Team");
    expect(JSON.stringify(nowItems)).toContain("Aug 31, 2026");
    expect(homeNowItems).toEqual([
      "returning to KAIST this fall",
      "writing occasional blog posts",
      "making small tools for myself",
    ]);
    expect(contactProfile.location).toBe("DONGHYEOK.NET / SEJONG");
    expect(contactLinks.map((link) => link.href)).toEqual([
      "mailto:me@donghyeok.net",
      "https://github.com/eastLight210",
      "https://www.linkedin.com/in/%EB%8F%99%ED%98%81-%EA%B9%80-37775a397/",
    ]);
  });
});
