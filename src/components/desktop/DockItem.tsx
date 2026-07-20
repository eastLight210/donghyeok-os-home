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

const DOCK_MAX_SCALE = 1.22;
const DOCK_MAX_LIFT = 7;
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
    return { influence: 0, scale: 1, y: 0 };
  }

  const influenceRadius = itemWidth * DOCK_INFLUENCE_WIDTHS;
  const normalizedDistance = Math.min(
    Math.abs(pointerX - itemCenterX) / influenceRadius,
    1,
  );
  const influence = (1 + Math.cos(Math.PI * normalizedDistance)) / 2;

  if (influence <= Number.EPSILON) {
    return { influence: 0, scale: 1, y: 0 };
  }

  return {
    influence,
    scale: 1 + (DOCK_MAX_SCALE - 1) * influence,
    y: -DOCK_MAX_LIFT * influence,
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
  const influence = useTransform(pointerX, (latestPointerX) => {
    const item = itemRef.current;
    if (!item) return 0;

    const bounds = item.getBoundingClientRect();
    const restingWidth = item.offsetWidth || bounds.width;
    return getDockMagnification(
      latestPointerX,
      bounds.left + bounds.width / 2,
      restingWidth,
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
  const style: MotionStyle = reducedMotion
    ? { scale: 1, y: 0 }
    : { scale, y };

  return { itemRef, style };
}

function DockItemContent({
  app,
  style,
}: {
  app: PublicApp;
  style: MotionStyle;
}) {
  return (
    <>
      <motion.span className="dock-item-icon" aria-hidden="true" style={style}>
        {app.glyph}
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
  onOpen: () => void;
}) {
  const { itemRef, style } = useDockItemMagnification<HTMLButtonElement>(
    pointerX,
    reducedMotion,
  );

  return (
    <motion.button
      className="dock-item"
      data-dock-magnify
      data-tone={app.tone}
      type="button"
      onClick={onOpen}
      ref={itemRef}
      aria-label={`Open ${app.label}`}
    >
      <DockItemContent app={app} style={style} />
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
  const { itemRef, style } = useDockItemMagnification<HTMLAnchorElement>(
    pointerX,
    reducedMotion,
  );

  return (
    <motion.a
      className="dock-item"
      data-dock-magnify
      data-tone={app.tone}
      href={app.href}
      ref={itemRef}
      aria-label={`Open ${app.label}`}
    >
      <DockItemContent app={app} style={style} />
    </motion.a>
  );
}

export function DockItem(props: {
  app: PublicApp;
  pointerX: MotionValue<number>;
  reducedMotion: boolean;
  onOpen: () => void;
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
  const { itemRef, style } = useDockItemMagnification<HTMLButtonElement>(
    pointerX,
    reducedMotion,
  );
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
      style={style}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  );
});
