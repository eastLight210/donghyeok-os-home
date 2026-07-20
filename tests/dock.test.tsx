import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dock } from "@/src/components/desktop/Dock";
import {
  getDockMagnification,
  type DockMagnification,
} from "@/src/components/desktop/DockItem";

const motionMock = vi.hoisted(() => ({
  reducedMotion: false,
  values: [] as Array<{ get: () => number }>,
}));

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();

  return {
    ...actual,
    useMotionValue: (initial: number) => {
      const value = actual.useMotionValue(initial);
      motionMock.values.push(value);
      return value;
    },
    useReducedMotion: () => motionMock.reducedMotion,
  };
});

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function pointerEvent(type: string, clientX: number) {
  const event = new MouseEvent(type, { bubbles: true, clientX });
  Object.defineProperty(event, "pointerType", { value: "mouse" });
  return event;
}

function setBounds(element: HTMLElement, left: number, width = 66) {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      bottom: 66,
      height: 66,
      left,
      right: left + width,
      top: 0,
      width,
      x: left,
      y: 0,
      toJSON: () => ({}),
    }),
  });
  Object.defineProperty(element, "offsetWidth", {
    configurable: true,
    value: width,
  });
}

describe("Dock proximity magnification", () => {
  let root: Root;

  beforeEach(async () => {
    motionMock.reducedMotion = false;
    motionMock.values.length = 0;
    document.body.innerHTML = '<div id="root"></div>';
    const container = document.querySelector("#root");
    if (!container) throw new Error("Missing test root");
    root = createRoot(container);

    await act(async () => {
      root.render(
        <Dock
          onOpenApp={vi.fn()}
          onOpenSwitcher={vi.fn()}
          onPower={vi.fn()}
          launcherRef={{ current: null }}
        />,
      );
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.innerHTML = "";
  });

  it("uses a smooth distance falloff and a stable resting transform", () => {
    const center = getDockMagnification(100, 100, 66);
    const neighbor = getDockMagnification(166, 100, 66);
    const far = getDockMagnification(300, 100, 66);
    const reset = getDockMagnification(Number.POSITIVE_INFINITY, 100, 66);

    expect(center).toEqual<DockMagnification>({
      influence: 1,
      scale: 1.22,
      y: -7,
    });
    expect(neighbor.scale).toBeGreaterThan(1);
    expect(neighbor.scale).toBeLessThan(center.scale);
    expect(far).toEqual({ influence: 0, scale: 1, y: 0 });
    expect(reset).toEqual({ influence: 0, scale: 1, y: 0 });
  });

  it("tracks pointer proximity and resets the shared motion value on leave", async () => {
    const dock = document.querySelector<HTMLElement>(".dock");
    const pointerX = motionMock.values[0];
    expect(dock).not.toBeNull();
    expect(pointerX?.get()).toBe(Number.POSITIVE_INFINITY);

    await act(async () => {
      dock?.dispatchEvent(pointerEvent("pointermove", 148));
    });
    expect(pointerX?.get()).toBe(148);

    await act(async () => {
      dock?.dispatchEvent(pointerEvent("pointerout", 148));
    });
    expect(pointerX?.get()).toBe(Number.POSITIVE_INFINITY);
  });

  it("keeps magnification disabled when reduced motion is requested", async () => {
    act(() => root.unmount());
    motionMock.values.length = 0;
    motionMock.reducedMotion = true;
    const container = document.querySelector("#root");
    if (!container) throw new Error("Missing test root");
    root = createRoot(container);

    await act(async () => {
      root.render(
        <Dock
          onOpenApp={vi.fn()}
          onOpenSwitcher={vi.fn()}
          onPower={vi.fn()}
          launcherRef={{ current: null }}
        />,
      );
    });

    const dock = document.querySelector<HTMLElement>(".dock");
    await act(async () => {
      dock?.dispatchEvent(pointerEvent("pointermove", 148));
    });

    expect(dock?.dataset.magnification).toBe("disabled");
    expect(motionMock.values[0]?.get()).toBe(Number.POSITIVE_INFINITY);
    expect(getDockMagnification(100, 100, 66, true)).toEqual({
      influence: 0,
      scale: 1,
      y: 0,
    });
  });

  it("magnifies keyboard focus without trapping focus in the Dock", async () => {
    const blog = document.querySelector<HTMLElement>('[aria-label="Open Blog"]');
    const projects = document.querySelector<HTMLElement>(
      '[aria-label="Open Projects"]',
    );
    const outside = document.createElement("button");
    outside.textContent = "Outside";
    document.body.append(outside);
    if (!blog || !projects) throw new Error("Missing Dock items");
    setBounds(blog, 0);
    setBounds(projects, 86);

    await act(async () => blog.focus());
    expect(document.activeElement).toBe(blog);
    expect(motionMock.values[0]?.get()).toBe(33);

    await act(async () => projects.focus());
    expect(document.activeElement).toBe(projects);
    expect(motionMock.values[0]?.get()).toBe(119);

    await act(async () => outside.focus());
    expect(document.activeElement).toBe(outside);
    expect(motionMock.values[0]?.get()).toBe(Number.POSITIVE_INFINITY);
    expect(document.querySelector(".dock [data-active-dot]")).toBeNull();
  });
});
