import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DonghyeokOS from "@/src/components/DonghyeokOS";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

let coarsePointer = false;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches:
      query.includes("prefers-reduced-motion")
      || (coarsePointer && query.includes("pointer: coarse")),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

function pointerEvent(
  type: string,
  {
    clientX,
    clientY = 0,
    pointerId = 1,
  }: { clientX: number; clientY?: number; pointerId?: number },
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    button: 0,
    clientX,
    clientY,
  });
  Object.defineProperties(event, {
    pointerId: { value: pointerId },
    pointerType: { value: "mouse" },
  });
  return event;
}

function wheelEvent({
  deltaX,
  deltaY = 0,
}: {
  deltaX: number;
  deltaY?: number;
}) {
  return new WheelEvent("wheel", {
    bubbles: true,
    cancelable: true,
    deltaX,
    deltaY,
  });
}

describe("DonghyeokOS UI contract", () => {
  let root: Root;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    coarsePointer = false;
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    window.sessionStorage.clear();
    window.history.replaceState({}, "", "/");
    document.body.innerHTML = '<div id="root"></div>';
    const container = document.querySelector("#root");
    if (!container) throw new Error("Missing test root");
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    vi.useRealTimers();
    warnSpy.mockRestore();
    document.body.innerHTML = "";
  });

  it("enters from the theatrical account and opens a modal switcher", async () => {
    await act(async () => root.render(<DonghyeokOS />));

    const login = document.querySelector<HTMLButtonElement>(
      '[aria-label="Enter DonghyeokOS as Donghyeok"]',
    );
    expect(login).not.toBeNull();
    expect(login?.classList.contains("monitor")).toBe(true);

    await act(async () => login?.click());
    await act(async () => vi.advanceTimersByTimeAsync(220));

    const nowNote = document.querySelector(".now-note");
    expect(nowNote?.textContent).toContain("returning to KAIST this fall");
    expect(nowNote?.textContent).toContain("writing occasional blog posts");
    expect(nowNote?.textContent).toContain("making small tools for myself");
    expect(nowNote?.textContent).not.toContain("reinforcement learning");

    const launcher = document.querySelector<HTMLButtonElement>(
      '[aria-label="Open App Switcher"]',
    );
    expect(launcher).not.toBeNull();
    expect(launcher?.querySelectorAll("i")).toHaveLength(9);

    await act(async () => launcher?.click());
    await act(async () => vi.advanceTimersByTimeAsync(1));

    const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
    expect(dialog).not.toBeNull();
    expect(document.body.dataset.scrollLocked).toBe("true");
    expect(document.querySelector(".reel-webgl-canvas")).not.toBeNull();
    expect(document.querySelector(".switch-word")).toBeNull();
    expect(document.querySelector(".switcher-helper")?.textContent).toContain(
      "ESC BACK TO DESKTOP",
    );
    expect(document.querySelector('[aria-selected="true"]')?.textContent).toContain(
      "Projects",
    );
    expect(
      document.querySelector('[role="option"][aria-selected="true"]')
        ?.getAttribute("aria-label"),
    ).toBe("Projects");
    expect(
      document
        .querySelector<HTMLElement>('.reel-segment[aria-selected="true"]')
        ?.style.getPropertyValue("--reel-image"),
    ).toContain("/images/reel/projects.jpg");

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    });
    expect(document.querySelector('[aria-selected="true"]')?.textContent).toContain("Now");
    const track = document.querySelector<HTMLDivElement>(".reel-track");
    const nowVisualIndex = Number(track?.dataset.visualIndex);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    });
    expect(document.querySelector('[aria-selected="true"]')?.textContent).toContain(
      "Contact",
    );
    const contactVisualIndex = Number(track?.dataset.visualIndex);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    });
    expect(document.querySelector('[aria-selected="true"]')?.textContent).toContain(
      "Blog",
    );
    const blogVisualIndex = Number(track?.dataset.visualIndex);
    expect(contactVisualIndex).toBe(nowVisualIndex + 1);
    expect(blogVisualIndex).toBe(contactVisualIndex + 1);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(launcher);
    expect(document.body.dataset.scrollLocked).toBeUndefined();
  });

  it("mutes the launcher focus treatment when a pointer-opened switcher closes", async () => {
    await act(async () => root.render(<DonghyeokOS />));
    await act(async () => {
      document
        .querySelector<HTMLButtonElement>(
          '[aria-label="Enter DonghyeokOS as Donghyeok"]',
        )
        ?.click();
      await vi.advanceTimersByTimeAsync(220);
    });

    const launcher = document.querySelector<HTMLButtonElement>(
      '[aria-label="Open App Switcher"]',
    );
    expect(launcher).not.toBeNull();

    // Real pointer clicks carry detail > 0; keyboard activation reports 0.
    await act(async () => {
      launcher?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }),
      );
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(document.activeElement).toBe(launcher);
    expect(launcher?.dataset.silentFocus).toBe("true");

    await act(async () => launcher?.blur());
    expect(launcher?.dataset.silentFocus).toBeUndefined();

    await act(async () => {
      launcher?.click();
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(document.activeElement).toBe(launcher);
    expect(launcher?.dataset.silentFocus).toBeUndefined();
  });

  it("uses touch-first helper copy on coarse pointers", async () => {
    coarsePointer = true;
    await act(async () => root.render(<DonghyeokOS />));

    expect(document.querySelector(".login-helper")?.textContent).toBe(
      "TAP TO ENTER",
    );

    await act(async () => {
      document
        .querySelector<HTMLButtonElement>(
          '[aria-label="Enter DonghyeokOS as Donghyeok"]',
        )
        ?.click();
      await vi.advanceTimersByTimeAsync(220);
    });
    await act(async () => {
      document
        .querySelector<HTMLButtonElement>('[aria-label="Open App Switcher"]')
        ?.click();
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(document.querySelector(".switcher-helper")?.textContent).toContain(
      "SWIPE",
    );
    expect(document.querySelector(".switcher-helper")?.textContent).toContain(
      "TAP TO OPEN",
    );
    expect(document.querySelector(".open-control")?.textContent).toBe("OPEN");
    expect(document.querySelector(".close-control")?.textContent).toBe("CLOSE");
  });

  it("enters from Enter without requiring monitor focus", async () => {
    await act(async () => root.render(<DonghyeokOS />));

    expect(document.activeElement).toBe(document.body);
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      await vi.advanceTimersByTimeAsync(220);
    });

    expect(
      document.querySelector('[aria-label="Open App Switcher"]'),
    ).not.toBeNull();
  });

  it("closes an app window from its red traffic light", async () => {
    await act(async () => root.render(<DonghyeokOS />));

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      await vi.advanceTimersByTimeAsync(220);
    });
    await act(async () => {
      document
        .querySelector<HTMLButtonElement>('[aria-label="Open Contact"]')
        ?.click();
      await vi.advanceTimersByTimeAsync(220);
    });

    const closeButton = document.querySelector<HTMLButtonElement>(
      '.traffic-light-close[aria-label="Close Contact"]',
    );
    const maximizeButton = document.querySelector<HTMLButtonElement>(
      '.traffic-light-maximize[aria-label="Maximize Contact window"]',
    );
    expect(closeButton).not.toBeNull();
    expect(maximizeButton).not.toBeNull();
    expect(document.querySelector('.contact-links a[href="mailto:me@donghyeok.net"]')).not.toBeNull();
    expect(document.querySelector('.contact-links a[href="https://github.com/eastLight210"]')).not.toBeNull();
    expect(closeButton?.textContent).toBe("");
    expect(document.querySelector(".app-window")).not.toBeNull();
    expect(document.body.dataset.scrollLocked).toBe("true");
    expect(
      document.querySelector(".experience-root")?.getAttribute("data-app-open"),
    ).toBe("true");
    expect(document.querySelector(".app-window-shortcut")?.textContent).toBe(
      "ESC CLOSE",
    );
    expect(window.location.search).toBe("?app=contact");

    await act(async () => maximizeButton?.click());
    expect(
      document.querySelector<HTMLElement>(".app-window")?.dataset.maximized,
    ).toBe("true");
    expect(maximizeButton?.getAttribute("aria-pressed")).toBe("true");
    expect(maximizeButton?.getAttribute("aria-label")).toBe(
      "Restore Contact window",
    );

    await act(async () => maximizeButton?.click());
    expect(
      document.querySelector<HTMLElement>(".app-window")?.dataset.maximized,
    ).toBeUndefined();
    expect(maximizeButton?.getAttribute("aria-pressed")).toBe("false");

    await act(async () => closeButton?.click());
    expect(window.location.search).toBe("");
    expect(document.body.dataset.scrollLocked).toBeUndefined();
  });

  it("closes an app window with Escape", async () => {
    await act(async () => root.render(<DonghyeokOS />));

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      await vi.advanceTimersByTimeAsync(220);
    });
    await act(async () => {
      document
        .querySelector<HTMLButtonElement>('[aria-label="Open Now"]')
        ?.click();
      await vi.advanceTimersByTimeAsync(220);
    });

    expect(document.querySelector("#active-app-title")?.textContent).toBe("Now");
    expect(window.location.search).toBe("?app=now");

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await vi.advanceTimersByTimeAsync(450);
    });

    expect(
      document.querySelector<HTMLElement>(".app-window")?.style.opacity,
    ).toBe("0");
    expect(window.location.search).toBe("");
  });

  it("opens Blog inside the same window system", async () => {
    await act(async () => root.render(<DonghyeokOS />));

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      await vi.advanceTimersByTimeAsync(220);
    });
    const blogLauncher = document.querySelector<HTMLElement>(
      '[aria-label="Open Blog"]',
    );
    expect(blogLauncher?.tagName).toBe("BUTTON");

    await act(async () => {
      blogLauncher?.click();
      await vi.advanceTimersByTimeAsync(220);
    });

    expect(document.querySelector("#active-app-title")?.textContent).toBe("Blog");
    expect(document.querySelectorAll(".blog-app-posts li")).toHaveLength(3);
    expect(
      document.querySelector('.traffic-light-close[aria-label="Close Blog"]'),
    ).not.toBeNull();
    expect(
      document.querySelector(
        '.traffic-light-maximize[aria-label="Maximize Blog window"]',
      ),
    ).not.toBeNull();
  });

  it("opens the selected reel face with a pointer click", async () => {
    await act(async () => root.render(<DonghyeokOS />));

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      await vi.advanceTimersByTimeAsync(220);
    });
    await act(async () => {
      document
        .querySelector<HTMLButtonElement>('[aria-label="Open App Switcher"]')
        ?.click();
      await vi.advanceTimersByTimeAsync(1);
    });

    const stage = document.querySelector<HTMLDivElement>(".reel-stage");
    const selectedFace = document.querySelector<HTMLButtonElement>(
      '.reel-segment[aria-selected="true"]',
    );
    expect(stage).not.toBeNull();
    expect(selectedFace?.textContent).toContain("Projects");
    if (!stage || !selectedFace) return;

    const setPointerCapture = vi.fn();
    Object.assign(stage, {
      hasPointerCapture: vi.fn(() => false),
      releasePointerCapture: vi.fn(),
      setPointerCapture,
    });

    await act(async () => {
      selectedFace.dispatchEvent(pointerEvent("pointerdown", { clientX: 500 }));
      selectedFace.dispatchEvent(pointerEvent("pointerup", { clientX: 500 }));
      selectedFace.click();
      await vi.advanceTimersByTimeAsync(220);
    });

    expect(setPointerCapture).not.toHaveBeenCalled();
    expect(document.querySelector("#active-app-title")?.textContent).toBe(
      "Projects",
    );
  });

  it("tracks pointer movement continuously and rotates on release", async () => {
    await act(async () => root.render(<DonghyeokOS />));

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      await vi.advanceTimersByTimeAsync(220);
    });
    await act(async () => {
      document
        .querySelector<HTMLButtonElement>('[aria-label="Open App Switcher"]')
        ?.click();
      await vi.advanceTimersByTimeAsync(1);
    });

    const stage = document.querySelector<HTMLDivElement>(".reel-stage");
    const track = document.querySelector<HTMLDivElement>(".reel-track");
    const reflectionTrack = document.querySelector<HTMLDivElement>(
      ".reel-reflection-track",
    );
    expect(stage).not.toBeNull();
    expect(track).not.toBeNull();
    expect(reflectionTrack).not.toBeNull();
    if (!stage || !track || !reflectionTrack) return;

    Object.defineProperty(track, "getBoundingClientRect", {
      value: () => ({
        bottom: 300,
        height: 300,
        left: 0,
        right: 9840,
        top: 0,
        width: 9840,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });
    const setPointerCapture = vi.fn();
    Object.assign(stage, {
      hasPointerCapture: vi.fn(() => false),
      releasePointerCapture: vi.fn(),
      setPointerCapture,
    });

    await act(async () => {
      stage.dispatchEvent(pointerEvent("pointerdown", { clientX: 500 }));
      stage.dispatchEvent(pointerEvent("pointermove", { clientX: 350 }));
    });
    expect(track.style.getPropertyValue("--drag-offset")).toBe("-150px");
    expect(reflectionTrack.style.getPropertyValue("--drag-offset")).toBe("-150px");
    expect(stage.dataset.dragging).toBe("true");
    expect(setPointerCapture).toHaveBeenCalledWith(1);

    await act(async () => {
      stage.dispatchEvent(pointerEvent("pointerup", { clientX: 350 }));
    });
    expect(document.querySelector('[aria-selected="true"]')?.textContent).toContain(
      "Now",
    );

    await act(async () => vi.advanceTimersByTimeAsync(40));
    expect(stage.dataset.dragging).toBeUndefined();
    expect(track.style.getPropertyValue("--drag-offset")).toBe("0px");
    expect(reflectionTrack.style.getPropertyValue("--drag-offset")).toBe("0px");
  });

  it("rotates from a horizontal trackpad gesture without hijacking vertical wheel input", async () => {
    await act(async () => root.render(<DonghyeokOS />));

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      await vi.advanceTimersByTimeAsync(220);
    });
    await act(async () => {
      document
        .querySelector<HTMLButtonElement>('[aria-label="Open App Switcher"]')
        ?.click();
      await vi.advanceTimersByTimeAsync(1);
    });

    const stage = document.querySelector<HTMLDivElement>(".reel-stage");
    const track = document.querySelector<HTMLDivElement>(".reel-track");
    const reflectionTrack = document.querySelector<HTMLDivElement>(
      ".reel-reflection-track",
    );
    expect(stage).not.toBeNull();
    expect(track).not.toBeNull();
    expect(reflectionTrack).not.toBeNull();
    if (!stage || !track || !reflectionTrack) return;

    Object.defineProperty(track, "getBoundingClientRect", {
      value: () => ({
        bottom: 300,
        height: 300,
        left: 0,
        right: 9840,
        top: 0,
        width: 9840,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    const verticalWheel = wheelEvent({ deltaX: 8, deltaY: 80 });
    await act(async () => stage.dispatchEvent(verticalWheel));
    expect(verticalWheel.defaultPrevented).toBe(false);
    expect(track.style.getPropertyValue("--drag-offset")).toBe("0px");

    const horizontalWheel = wheelEvent({ deltaX: 60, deltaY: 4 });
    await act(async () => stage.dispatchEvent(horizontalWheel));
    expect(horizontalWheel.defaultPrevented).toBe(true);
    expect(stage.dataset.dragging).toBe("true");
    expect(document.querySelector('[aria-selected="true"]')?.textContent).toContain(
      "Now",
    );

    await act(async () => vi.advanceTimersByTimeAsync(40));
    expect(stage.dataset.dragging).toBeUndefined();
    expect(track.style.getPropertyValue("--drag-offset")).toBe("0px");
    expect(reflectionTrack.style.getPropertyValue("--drag-offset")).toBe("0px");

    await act(async () => {
      for (const deltaX of [40, 28, 18, 10, 4, 2]) {
        await vi.advanceTimersByTimeAsync(40);
        stage.dispatchEvent(wheelEvent({ deltaX, deltaY: 0 }));
      }
    });
    expect(document.querySelector('[aria-selected="true"]')?.textContent).toContain(
      "Now",
    );

    await act(async () => {
      stage.dispatchEvent(wheelEvent({ deltaX: 12, deltaY: 0 }));
      stage.dispatchEvent(wheelEvent({ deltaX: 60, deltaY: 4 }));
    });
    expect(document.querySelector('[aria-selected="true"]')?.textContent).toContain(
      "Contact",
    );
  });

  it("tilts the reel and offsets its reflection with pointer position", async () => {
    await act(async () => root.render(<DonghyeokOS />));

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      await vi.advanceTimersByTimeAsync(220);
    });
    await act(async () => {
      document
        .querySelector<HTMLButtonElement>('[aria-label="Open App Switcher"]')
        ?.click();
      await vi.advanceTimersByTimeAsync(1);
    });

    const stage = document.querySelector<HTMLDivElement>(".reel-stage");
    expect(stage).not.toBeNull();
    if (!stage) return;

    Object.defineProperty(stage, "getBoundingClientRect", {
      value: () => ({
        bottom: 500,
        height: 400,
        left: 100,
        right: 900,
        top: 100,
        width: 800,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      }),
    });

    await act(async () => {
      stage.dispatchEvent(pointerEvent("pointermove", {
        clientX: 820,
        clientY: 140,
      }));
    });

    expect(stage.style.getPropertyValue("--reel-rotate-x")).toBe("2.08deg");
    expect(stage.style.getPropertyValue("--reel-rotate-y")).toBe("2.56deg");
    expect(stage.style.getPropertyValue("--reel-reflection-x")).toBe("-9.60px");
    expect(stage.style.getPropertyValue("--reel-reflection-opacity")).toBe("0.328");

    await act(async () => {
      stage.dispatchEvent(pointerEvent("pointerout", {
        clientX: 920,
        clientY: 140,
      }));
    });

    expect(stage.style.getPropertyValue("--reel-rotate-x")).toBe("");
    expect(stage.style.getPropertyValue("--reel-reflection-x")).toBe("");
  });
});
