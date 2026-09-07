import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DonghyeokOS from "@/src/components/DonghyeokOS";

vi.mock("motion/react", () => ({ useReducedMotion: () => true }));
const rendererCallbacks = vi.hoisted(() => ({ ready: () => {}, unavailable: () => {} }));
vi.mock("@/src/components/WebGLReel", () => ({ WebGLReel: (props: { onReady: () => void; onUnavailable: () => void }) => {
  rendererCallbacks.ready = props.onReady;
  rendererCallbacks.unavailable = props.onUnavailable;
  return <canvas aria-hidden="true" />;
} }));
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
HTMLDialogElement.prototype.showModal = function () { this.open = true; };
HTMLDialogElement.prototype.close = function () { this.open = false; };
let root: Root;
const button = (label: string) => document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
const click = async (element: HTMLElement) => { await act(async () => { element.focus(); element.click(); }); };
const key = async (element: HTMLElement, value: string) => { await act(async () => { element.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true })); }); };
beforeEach(() => {
  window.history.replaceState({}, "", "/");
  document.body.innerHTML = '<div id="root"></div>';
  root = createRoot(document.getElementById("root")!);
});
afterEach(() => { act(() => root.unmount()); document.body.innerHTML = ""; });

describe("minimal homepage", () => {
  it("advances once per swipe including long momentum, then accepts a fresh swipe without cursor movement", async () => {
    vi.useFakeTimers();
    try {
      await act(async () => root.render(<DonghyeokOS />));
      const wheel = async (deltaX: number, options: WheelEventInit = {}) => {
        const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaX, ...options });
        await act(async () => { document.body.dispatchEvent(event); });
        return event.defaultPrevented;
      };
      expect(await wheel(10)).toBe(true);
      expect(button("Open Projects")).toBeTruthy();
      await wheel(35);
      expect(button("Open Now")).toBeTruthy();
      for (const delta of [100, 90, 80, 70, 60, 45, 30, 20, 10, 5, 3]) {
        await act(async () => vi.advanceTimersByTime(100));
        await wheel(delta);
      }
      expect(button("Open Now")).toBeTruthy();
      // A new impulse interrupts the decayed tail without requiring an idle gap.
      await wheel(50);
      expect(button("Open Contact")).toBeTruthy();
      for (const delta of [70, 60, 50, 40, 25, 15, 8, 4, 2]) {
        await act(async () => vi.advanceTimersByTime(60));
        await wheel(delta);
      }
      expect(button("Open Contact")).toBeTruthy();
      // Reverse immediately, without waiting for idle or moving the cursor.
      await wheel(-50);
      expect(button("Open Now")).toBeTruthy();
      await act(async () => vi.advanceTimersByTime(230));
      await wheel(-3, { deltaMode: 1 });
      expect(button("Open Projects")).toBeTruthy();
      await act(async () => vi.advanceTimersByTime(200));
      expect(await wheel(5, { deltaY: 100 })).toBe(false);
      expect(await wheel(100, { ctrlKey: true })).toBe(false);
      expect(button("Open Projects")).toBeTruthy();
      await click(button("Open Projects"));
      expect(await wheel(100)).toBe(false);
      await click(button("Close content"));
      expect(button("Open Projects")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("accepts light swipes and gradual re-acceleration during a momentum tail", async () => {
    vi.useFakeTimers();
    try {
      await act(async () => root.render(<DonghyeokOS />));
      const send = async (deltas: number[]) => {
        for (const deltaX of deltas) {
          await act(async () => {
            vi.advanceTimersByTime(16);
            document.body.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaX }));
          });
        }
      };
      await send([2, 4, 6]);
      expect(button("Open Now")).toBeTruthy();
      await send([8, 7, 6, 5, 4, 3, 2, 1]);
      expect(button("Open Now")).toBeTruthy();
      await send([2, 3, 4, 6, 8]);
      expect(button("Open Contact")).toBeTruthy();
      await send([7, 5, 3, 2, 1]);
      expect(button("Open Contact")).toBeTruthy();
      await act(async () => vi.advanceTimersByTime(150));
      await send([3, 4, 5]);
      expect(button("Open Blog")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("starts with Projects, rotates and wraps without a login", async () => {
    await act(async () => root.render(<DonghyeokOS />));
    expect(button("Open Projects")).toBeTruthy();
    expect(document.querySelector("dialog")?.open).toBe(false);
    await click(button("Next app"));
    expect(button("Open Now")).toBeTruthy();
    await key(button("Open Now"), "ArrowRight");
    await key(button("Open Contact"), "ArrowRight");
    expect(button("Open Blog")).toBeTruthy();
    await click(button("Previous app"));
    expect(button("Open Contact")).toBeTruthy();
  });
  it("opens content, closes with Escape, restores focus and preserves selection", async () => {
    await act(async () => root.render(<DonghyeokOS />));
    await click(button("Next app"));
    const origin = button("Open Now");
    await click(origin);
    expect(window.location.search).toBe("?app=now");
    const dialog = document.querySelector("dialog")!;
    expect(dialog.open).toBe(true);
    expect(document.activeElement?.id).toBe("panel-title");
    await act(async () => { dialog.dispatchEvent(new Event("cancel", { cancelable: true })); });
    expect(dialog.open).toBe(false);
    expect(window.location.search).toBe("");
    expect(document.activeElement).toBe(origin);
    expect(button("Open Now")).toBeTruthy();
  });
  it("supports direct content URLs and Back/Forward state", async () => {
    window.history.replaceState({}, "", "/?app=projects");
    await act(async () => root.render(<DonghyeokOS />));
    expect(document.querySelector("dialog")?.open).toBe(true);
    expect(document.querySelector("dialog")?.textContent).toContain("TrackPinch");
    await act(async () => { window.history.replaceState({}, "", "/"); window.dispatchEvent(new PopStateEvent("popstate")); });
    expect(document.querySelector("dialog")?.open).toBe(false);
    await act(async () => { window.history.replaceState({}, "", "/?app=blog"); window.dispatchEvent(new PopStateEvent("popstate")); });
    expect(document.querySelector("dialog")?.textContent).toContain("OPEN THE FULL BLOG");
  });
  it("keeps standard modified-link clicks and rejects unknown app URLs", async () => {
    window.history.replaceState({}, "", "/?app=unknown");
    await act(async () => root.render(<DonghyeokOS />));
    expect(document.querySelector("dialog")?.open).toBe(false);
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true });
    let preventedByApp = true;
    const observe = (clickEvent: Event) => { preventedByApp = clickEvent.defaultPrevented; clickEvent.preventDefault(); };
    document.addEventListener("click", observe, { once: true });
    await act(async () => { document.querySelector("nav a")!.dispatchEvent(event); });
    expect(preventedByApp).toBe(false);
    expect(document.querySelector("dialog")?.open).toBe(false);
  });
  it("does not open content after a horizontal drag, and ignores vertical gestures", async () => {
    await act(async () => root.render(<DonghyeokOS />));
    const stage = button("Open Projects");
    const send = async (type: string, x: number, y: number) => {
      const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: x, clientY: y });
      Object.defineProperty(event, "pointerId", { value: 1 });
      await act(async () => { stage.dispatchEvent(event); });
    };
    await send("pointerdown", 100, 20); await send("pointermove", 20, 20); await send("pointerup", 20, 20);
    expect(button("Open Now")).toBeTruthy();
    await act(async () => { stage.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 })); });
    expect(document.querySelector("dialog")?.open).toBe(false);
    await send("pointerdown", 100, 20); await send("pointermove", 95, 100); await send("pointerup", 95, 100);
    expect(button("Open Now")).toBeTruthy();
  });
  it("treats a vertical mouse pull as play, never navigation, and cancels on blur", async () => {
    await act(async () => root.render(<DonghyeokOS />));
    const stage = button("Open Projects");
    const send = async (type: string, y: number) => {
      const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: 100, clientY: y });
      Object.defineProperties(event, { pointerId: { value: 2 }, pointerType: { value: "mouse" } });
      await act(async () => { stage.dispatchEvent(event); });
    };
    await send("pointerdown", 20);
    await send("pointermove", 150);
    await send("pointerup", 150);
    await act(async () => { stage.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 })); });
    expect(button("Open Projects")).toBeTruthy();
    expect(document.querySelector("dialog")?.open).toBe(false);
    await send("pointerdown", 20);
    await send("pointermove", 150);
    await act(async () => { window.dispatchEvent(new Event("blur")); });
    await send("pointerup", 150);
    expect(document.querySelector("dialog")?.open).toBe(false);
    await send("pointerdown", 20);
    await send("pointerup", 20);
    await click(stage);
    expect(document.querySelector("dialog")?.open).toBe(true);
  });

  it("has one explorer tab stop and Enter opens after arrow-button selection", async () => {
    await act(async () => root.render(<DonghyeokOS />));
    expect(button("Previous app").tabIndex).toBe(-1);
    expect(button("Next app").tabIndex).toBe(-1);
    expect(document.querySelector<HTMLAnchorElement>(".explore-link")?.tabIndex).toBe(-1);
    await click(button("Next app"));
    expect(document.activeElement).toBe(button("Open Now"));
    await key(document.activeElement as HTMLElement, "Enter");
    expect(window.location.search).toBe("?app=now");
    expect(document.querySelector("dialog")?.open).toBe(true);
  });

  it("rotates from the page without a click, but leaves fields and open panels alone", async () => {
    await act(async () => root.render(<DonghyeokOS />));
    await key(document.body, "ArrowRight");
    expect(button("Open Now")).toBeTruthy();
    expect(document.activeElement).toBe(button("Open Now"));
    const input = document.createElement("input");
    document.body.append(input);
    await key(input, "ArrowRight");
    expect(button("Open Now")).toBeTruthy();
    input.remove();
    await key(button("Open Now"), "Enter");
    await key(document.querySelector("dialog")!, "ArrowRight");
    expect(window.location.search).toBe("?app=now");
    await click(button("Close content"));
    expect(button("Open Now")).toBeTruthy();
    await key(document.body, "ArrowLeft");
    expect(button("Open Projects")).toBeTruthy();
  });

  it("never shows the flat fallback during loading, but keeps it on WebGL failure", async () => {
    await act(async () => root.render(<DonghyeokOS />));
    expect(button("Open Projects").dataset.renderer).toBe("pending");
    expect(document.querySelector(".reel-fallback")).toBeNull();
    await act(async () => rendererCallbacks.ready());
    expect(button("Open Projects").dataset.renderer).toBe("ready");
    expect(document.querySelector(".reel-fallback")).toBeNull();
    await act(async () => rendererCallbacks.unavailable());
    expect(document.querySelector(".reel-fallback")).not.toBeNull();
    await click(button("Next app"));
    expect(button("Open Now")).toBeTruthy();
  });

});
