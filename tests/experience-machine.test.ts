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

describe("DonghyeokOS experience machine", () => {
  it("moves through boot, entering, and desktop as one explicit state", () => {
    const entering = experienceReducer(initialExperienceState, { type: "ENTER" });
    expect(entering).toEqual({ name: "entering" });
    expect(experienceReducer(entering, { type: "ENTERED" })).toEqual({
      name: "desktop",
      activeApp: null,
    });
  });

  it("rotates exactly one public app and wraps", () => {
    const switcher = {
      name: "switcher" as const,
      selectedApp: "contact" as const,
      originApp: null,
    };
    expect(experienceReducer(switcher, { type: "ROTATE", direction: 1 })).toMatchObject({
      selectedApp: "blog",
    });
  });

  it("returns to the origin app when the switcher is cancelled", () => {
    const state = {
      name: "switcher" as const,
      selectedApp: "contact" as const,
      originApp: "projects" as const,
    };
    expect(experienceReducer(state, { type: "CANCEL_SWITCHER" })).toEqual({
      name: "desktop",
      activeApp: "projects",
    });
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
    expect(publicApps.map((app) => app.reelImage)).toEqual([
      "/images/reel/blog.jpg",
      "/images/reel/projects.jpg",
      "/images/reel/now.jpg",
      "/images/reel/contact.jpg",
    ]);
  });

  it("keeps Projects on the ink tone and contains no private app metadata", () => {
    expect(publicApps.find((app) => app.id === "projects")?.tone).toBe("ink");
    expect(publicApps.find((app) => app.id === "blog")?.kind).toBe("internal");
    expect(JSON.stringify(publicApps).toLowerCase()).not.toContain("finance");
  });

  it("contains the approved public profile content", () => {
    expect(projects.find((project) => project.title === "SSD Remover")).toMatchObject({
      href: "https://github.com/eastLight210/SSD_Remover",
      status: "LIVE",
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
