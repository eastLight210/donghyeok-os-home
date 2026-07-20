"use client";

import { useMotionValue, useReducedMotion } from "motion/react";
import {
  useCallback,
  useRef,
  type FocusEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { publicApps, type PublicAppId } from "@/src/content/public-apps";
import { DockItem, DockSystemControl } from "./DockItem";

function findDockItem(target: EventTarget | null) {
  return target instanceof Element
    ? target.closest<HTMLElement>("[data-dock-magnify]")
    : null;
}

function itemCenterX(item: HTMLElement) {
  const bounds = item.getBoundingClientRect();
  return bounds.left + bounds.width / 2;
}

export function Dock({
  onOpenApp,
  onOpenSwitcher,
  onPower,
  launcherRef,
}: {
  onOpenApp: (id: PublicAppId) => void;
  onOpenSwitcher: () => void;
  onPower: () => void;
  launcherRef: RefObject<HTMLButtonElement | null>;
}) {
  const pointerX = useMotionValue(Number.POSITIVE_INFINITY);
  const reducedMotion = Boolean(useReducedMotion());
  const pointerIsInside = useRef(false);

  const resetOrRestoreKeyboardFocus = useCallback(() => {
    const focusedItem = findDockItem(document.activeElement);
    if (focusedItem?.matches(":focus-visible")) {
      pointerX.set(itemCenterX(focusedItem));
    } else {
      pointerX.set(Number.POSITIVE_INFINITY);
    }
  }, [pointerX]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (reducedMotion || event.pointerType === "touch") {
        pointerX.set(Number.POSITIVE_INFINITY);
        return;
      }

      pointerIsInside.current = true;
      pointerX.set(event.clientX);
    },
    [pointerX, reducedMotion],
  );

  const handlePointerLeave = useCallback(() => {
    pointerIsInside.current = false;
    resetOrRestoreKeyboardFocus();
  }, [resetOrRestoreKeyboardFocus]);

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (reducedMotion || pointerIsInside.current) return;
      const focusedItem = findDockItem(event.target);
      if (focusedItem) pointerX.set(itemCenterX(focusedItem));
    },
    [pointerX, reducedMotion],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (reducedMotion || pointerIsInside.current) return;
      const nextItem = findDockItem(event.relatedTarget);
      pointerX.set(
        nextItem ? itemCenterX(nextItem) : Number.POSITIVE_INFINITY,
      );
    },
    [pointerX, reducedMotion],
  );

  return (
    <nav
      className="dock"
      aria-label="Applications and system controls"
      data-magnification={reducedMotion ? "disabled" : "enabled"}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
    >
      <div className="dock-apps">
        {publicApps.map((app) => (
          <DockItem
            app={app}
            key={app.id}
            onOpen={() => onOpenApp(app.id)}
            pointerX={pointerX}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
      <span className="dock-divider" aria-hidden="true" />
      <div className="dock-system">
        <DockSystemControl
          className="launcher-control"
          onClick={onOpenSwitcher}
          ref={launcherRef}
          aria-label="Open App Switcher"
          pointerX={pointerX}
          reducedMotion={reducedMotion}
        >
          <span aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        </DockSystemControl>
        <DockSystemControl
          className="power-control"
          onClick={onPower}
          aria-label="Return to boot screen"
          pointerX={pointerX}
          reducedMotion={reducedMotion}
        >
          <span aria-hidden="true">⏻</span>
        </DockSystemControl>
      </div>
    </nav>
  );
}
