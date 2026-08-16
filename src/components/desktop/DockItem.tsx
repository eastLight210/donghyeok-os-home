"use client";

import {
  motion,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import {
  forwardRef,
  useCallback,
  useRef,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import type { PublicApp } from "@/src/content/public-apps";
import { DockIcon } from "./DockIcons";

const DOCK_MAX_SCALE = 1.48;
const DOCK_MAX_LIFT = 14;
const DOCK_INFLUENCE_WIDTHS = 1.5;

export const DOCK_MAGNIFICATION_SPRING = {
  stiffness: 420,
  damping: 32,
  mass: 0.6,
} as const;

export interface DockMagnification {
  influence: number;
  scale: number;
  y: number;
  width: number;
}

function restingMagnification(itemWidth: number): DockMagnification {
  return {
    influence: 0,
    scale: 1,
    y: 0,
    width: Math.max(itemWidth, 0),
  };
}

function readDockRestingWidth(
  item: HTMLElement | null,
  face: HTMLElement | null,
) {
  return face?.offsetWidth || item?.offsetWidth || 0;
}

export interface LaunchOrigin {
  x: number;
  y: number;
}

export function elementLaunchOrigin(element: Element): LaunchOrigin {
  const bounds = element.getBoundingClientRect();
  return {
    x: bounds.left + bounds.width / 2,
    y: bounds.top + bounds.height / 2,
  };
}

export function getDockMagnification(
  pointerX: number,
  itemCenterX: number,
  itemWidth: number,
  reducedMotion = false,
): DockMagnification {
  if (
    reducedMotion
    || !Number.isFinite(pointerX)
    || itemWidth <= 0
  ) {
    return restingMagnification(itemWidth);
  }

  const influenceRadius = itemWidth * DOCK_INFLUENCE_WIDTHS;
  const normalizedDistance = Math.min(
    Math.abs(pointerX - itemCenterX) / influenceRadius,
    1,
  );
  const influence = (1 + Math.cos(Math.PI * normalizedDistance)) / 2;

  if (influence <= Number.EPSILON) {
    return restingMagnification(itemWidth);
  }

  const scale = 1 + (DOCK_MAX_SCALE - 1) * influence;
  return {
    influence,
    scale,
    y: -DOCK_MAX_LIFT * influence,
    width: itemWidth * scale,
  };
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function useDockItemMagnification<T extends HTMLElement>(
  pointerX: MotionValue<number>,
  reducedMotion: boolean,
) {
  const itemRef = useRef<T>(null);
  const faceRef = useRef<HTMLElement>(null);
  const influence = useTransform(pointerX, (latestPointerX) => {
    const item = itemRef.current;
    if (!item) return 0;

    const bounds = item.getBoundingClientRect();
    return getDockMagnification(
      latestPointerX,
      bounds.left + bounds.width / 2,
      readDockRestingWidth(item, faceRef.current),
      reducedMotion,
    ).influence;
  });
  const springInfluence = useSpring(influence, DOCK_MAGNIFICATION_SPRING);
  const scale = useTransform(
    springInfluence,
    [0, 1],
    [1, DOCK_MAX_SCALE],
  );
  const y = useTransform(
    springInfluence,
    [0, 1],
    [0, -DOCK_MAX_LIFT],
  );
  const width = useTransform(springInfluence, (latestInfluence) => {
    const restingWidth = readDockRestingWidth(itemRef.current, faceRef.current);
    if (restingWidth <= 0) return "auto";
    return restingWidth * (1 + (DOCK_MAX_SCALE - 1) * latestInfluence);
  });
  const visualStyle: MotionStyle = reducedMotion
    ? { scale: 1, y: 0 }
    : { scale, y };
  const layoutStyle: MotionStyle = reducedMotion ? {} : { width };

  return { itemRef, faceRef, visualStyle, layoutStyle };
}

function DockItemContent({
  app,
  faceRef,
  style,
}: {
  app: PublicApp;
  faceRef: Ref<HTMLElement>;
  style: MotionStyle;
}) {
  return (
    <>
      <motion.span
        className="dock-item-icon"
        aria-hidden="true"
        ref={faceRef}
        style={style}
      >
        <DockIcon id={app.id} />
      </motion.span>
      <small>{app.label}</small>
    </>
  );
}

function InternalDockItem({
  app,
  pointerX,
  reducedMotion,
  onOpen,
}: {
  app: PublicApp;
  pointerX: MotionValue<number>;
  reducedMotion: boolean;
  onOpen: (origin: LaunchOrigin) => void;
}) {
  const { itemRef, faceRef, visualStyle, layoutStyle } =
    useDockItemMagnification<HTMLButtonElement>(pointerX, reducedMotion);

  return (
    <motion.button
      className="dock-item"
      data-dock-magnify
      data-tone={app.tone}
      type="button"
      onClick={(event) => onOpen(elementLaunchOrigin(event.currentTarget))}
      ref={itemRef}
      style={layoutStyle}
      aria-label={`Open ${app.label}`}
    >
      <DockItemContent app={app} faceRef={faceRef} style={visualStyle} />
    </motion.button>
  );
}

function ExternalDockItem({
  app,
  pointerX,
  reducedMotion,
}: {
  app: PublicApp;
  pointerX: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const { itemRef, faceRef, visualStyle, layoutStyle } =
    useDockItemMagnification<HTMLAnchorElement>(pointerX, reducedMotion);

  return (
    <motion.a
      className="dock-item"
      data-dock-magnify
      data-tone={app.tone}
      href={app.href}
      ref={itemRef}
      style={layoutStyle}
      aria-label={`Open ${app.label}`}
    >
      <DockItemContent app={app} faceRef={faceRef} style={visualStyle} />
    </motion.a>
  );
}

export function DockItem(props: {
  app: PublicApp;
  pointerX: MotionValue<number>;
  reducedMotion: boolean;
  onOpen: (origin: LaunchOrigin) => void;
}) {
  if (props.app.kind === "external" && props.app.href) {
    return <ExternalDockItem {...props} />;
  }

  return <InternalDockItem {...props} />;
}

interface DockSystemControlProps {
  "aria-label": string;
  children: ReactNode;
  className?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  pointerX: MotionValue<number>;
  reducedMotion: boolean;
}

export const DockSystemControl = forwardRef<
  HTMLButtonElement,
  DockSystemControlProps
>(function DockSystemControl(
  {
    "aria-label": ariaLabel,
    children,
    className = "",
    onClick,
    pointerX,
    reducedMotion,
  },
  forwardedRef,
) {
  const { itemRef, faceRef, visualStyle, layoutStyle } =
    useDockItemMagnification<HTMLButtonElement>(pointerX, reducedMotion);
  const setRef = useCallback(
    (node: HTMLButtonElement | null) => {
      itemRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef, itemRef],
  );

  return (
    <motion.button
      className={`system-control ${className}`.trim()}
      data-dock-magnify
      type="button"
      onClick={onClick}
      ref={setRef}
      style={layoutStyle}
      aria-label={ariaLabel}
    >
      <motion.span
        className="system-control-face"
        aria-hidden="true"
        ref={faceRef}
        style={visualStyle}
      >
        {children}
      </motion.span>
    </motion.button>
  );
});
