import { useId, type JSX, type ReactNode } from "react";
import type { PublicAppId } from "@/src/content/public-apps";

export type DockIconId = PublicAppId | "launcher" | "power";

const ROUNDED_SQUARE_PATH =
  "M11 0h30a11 11 0 0 1 11 11v30a11 11 0 0 1-11 11H11A11 11 0 0 1 0 41V11A11 11 0 0 1 11 0Z";

type ShineStop = { offset: string; color: string; opacity: string };

const DEFAULT_SHINE_STOPS: ShineStop[] = [
  { offset: "0%", color: "#fff", opacity: ".50" },
  { offset: "32%", color: "#fff", opacity: ".08" },
  { offset: "60%", color: "#fff", opacity: "0" },
  { offset: "88%", color: "#000", opacity: "0" },
  { offset: "100%", color: "#000", opacity: ".14" },
];

const LAUNCHER_SHINE_STOPS: ShineStop[] = [
  { offset: "0%", color: "#fff", opacity: ".65" },
  { offset: "40%", color: "#fff", opacity: ".15" },
  { offset: "70%", color: "#fff", opacity: "0" },
  { offset: "100%", color: "#000", opacity: ".05" },
];

const LAUNCHER_TILE_ORIGINS = [11, 21.5, 32] as const;
const LAUNCHER_TILES: ReadonlyArray<{ from: string; to: string }> = [
  { from: "#8be04a", to: "#4fae22" },
  { from: "#ffd84d", to: "#f5b400" },
  { from: "#ffab40", to: "#f27a00" },
  { from: "#ff6b5e", to: "#e0342b" },
  { from: "#f4f4f6", to: "#c9c9cf" },
  { from: "#ff6ec4", to: "#e0249a" },
  { from: "#b78ef5", to: "#7a3fe0" },
  { from: "#5ec8f5", to: "#1a8fd6" },
  { from: "#4fd8c8", to: "#12a394" },
];

function useSafeId() {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

function IconFrame({
  children,
  extraDefs,
  from,
  to,
  shineStops = DEFAULT_SHINE_STOPS,
  innerStroke = "rgb(255 255 255 / 30%)",
  glyphShadow: {
    dy: glyphShadowDy = 1,
    stdDeviation: glyphShadowStdDeviation = 1.2,
    floodOpacity: glyphShadowFloodOpacity = 0.28,
  } = {},
}: {
  children: ReactNode;
  extraDefs?: ReactNode;
  from: string;
  to: string;
  shineStops?: ShineStop[];
  innerStroke?: string;
  glyphShadow?: {
    dy?: number;
    stdDeviation?: number;
    floodOpacity?: number;
  };
}) {
  const id = useSafeId();
  const fillId = `${id}-fill`;
  const shineId = `${id}-shine`;
  const shadowId = `${id}-glyph-shadow`;

  return (
    <svg viewBox="0 0 52 52" className="dock-icon-svg" aria-hidden="true">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <linearGradient id={shineId} x1="0" y1="0" x2="0" y2="1">
          {shineStops.map((stop) => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy={glyphShadowDy}
            stdDeviation={glyphShadowStdDeviation}
            floodColor="#000"
            floodOpacity={glyphShadowFloodOpacity}
          />
        </filter>
        {extraDefs}
      </defs>
      <path d={ROUNDED_SQUARE_PATH} fill={`url(#${fillId})`} />
      <path d={ROUNDED_SQUARE_PATH} fill={`url(#${shineId})`} />
      <path
        d={ROUNDED_SQUARE_PATH}
        fill="none"
        stroke={innerStroke}
        strokeWidth="1"
        transform="translate(26 26) scale(.962) translate(-26 -26)"
      />
      <path
        d={ROUNDED_SQUARE_PATH}
        fill="none"
        stroke="rgb(0 0 0 / 18%)"
        strokeWidth=".5"
      />
      <g filter={`url(#${shadowId})`}>{children}</g>
    </svg>
  );
}

function BlogMark() {
  const sheetId = `${useSafeId()}-sheet`;

  return (
    <IconFrame
      from="#ffb340"
      to="#f07c0a"
      extraDefs={
        <linearGradient id={sheetId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffdf7" />
          <stop offset="100%" stopColor="#f6ead6" />
        </linearGradient>
      }
    >
      <rect x="13" y="11" width="26" height="30" rx="3.5" fill={`url(#${sheetId})`} />
      <path d="M32 11h7v7l-7-7z" fill="#f0b26a" />
      <rect x="18" y="20" width="16" height="1.6" rx=".8" fill="#c96a0e" />
      <rect x="18" y="25" width="16" height="1.6" rx=".8" fill="#eda752" />
      <rect x="18" y="30" width="11" height="1.6" rx=".8" fill="#eda752" />
    </IconFrame>
  );
}

function ProjectsMark() {
  const frontId = `${useSafeId()}-front`;

  return (
    <IconFrame
      from="#4a423a"
      to="#1f1913"
      extraDefs={
        <linearGradient id={frontId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2e8d2" />
          <stop offset="100%" stopColor="#dccbaa" />
        </linearGradient>
      }
    >
      <path
        d="M12 22.5c0-1.4 1.1-2.5 2.5-2.5h6.2l2.1-2.4c.4-.4 1-.7 1.6-.7h13.1c1.4 0 2.5 1.1 2.5 2.5v16.1c0 1.4-1.1 2.5-2.5 2.5h-23c-1.4 0-2.5-1.1-2.5-2.5z"
        fill="#efe7d6"
      />
      <path
        d="M12 24.2h28v14.4c0 1.4-1.1 2.5-2.5 2.5h-23c-1.4 0-2.5-1.1-2.5-2.5z"
        fill={`url(#${frontId})`}
      />
      <line
        x1="12"
        y1="24.2"
        x2="40"
        y2="24.2"
        stroke="#fff"
        strokeOpacity=".4"
        strokeWidth="1"
      />
      <rect x="20" y="28" width="12" height="7" rx="1.4" fill="#2b241f" opacity=".65" />
    </IconFrame>
  );
}

function NowMark() {
  const id = useSafeId();
  const pageId = `${id}-page`;
  const headerId = `${id}-header`;

  return (
    <IconFrame
      from="#7cc24a"
      to="#3f8f2a"
      extraDefs={
        <>
          <linearGradient id={pageId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbfdf6" />
            <stop offset="100%" stopColor="#edf3e2" />
          </linearGradient>
          <linearGradient id={headerId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f7a1f" />
            <stop offset="100%" stopColor="#256618" />
          </linearGradient>
        </>
      }
    >
      <rect x="13" y="14" width="26" height="25" rx="4" fill={`url(#${pageId})`} />
      <rect x="13" y="14" width="26" height="7" rx="4" fill={`url(#${headerId})`} />
      <rect x="13" y="18" width="26" height="3" fill={`url(#${headerId})`} />
      <rect x="19" y="12" width="2.4" height="6" rx="1.2" fill="#33402f" />
      <rect x="30.6" y="12" width="2.4" height="6" rx="1.2" fill="#33402f" />
      <rect x="18" y="26" width="5" height="5" rx="1" fill="#57a04a" />
      <rect x="25.5" y="26" width="5" height="5" rx="1" fill="#cfe3c6" />
      <rect x="33" y="26" width="5" height="5" rx="1" fill="#cfe3c6" />
    </IconFrame>
  );
}

function ContactMark() {
  const bubbleId = `${useSafeId()}-bubble`;

  return (
    <IconFrame
      from="#3fa9f5"
      to="#0b6fd6"
      extraDefs={
        <linearGradient id={bubbleId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e9f3f8" />
        </linearGradient>
      }
    >
      <path
        d="M14 16.5c0-1.9 1.6-3.5 3.5-3.5h17c1.9 0 3.5 1.6 3.5 3.5v12c0 1.9-1.6 3.5-3.5 3.5H24l-6.2 5.1c-.7.6-1.8 0-1.8-.9V32H17.5c-1.9 0-3.5-1.6-3.5-3.5z"
        fill={`url(#${bubbleId})`}
      />
      <circle cx="22" cy="22.5" r="1.6" fill="#0b5fb8" />
      <circle cx="26" cy="22.5" r="1.6" fill="#0b5fb8" />
      <circle cx="30" cy="22.5" r="1.6" fill="#0b5fb8" />
    </IconFrame>
  );
}

function LauncherMark() {
  const id = useSafeId();
  const highlightId = `${id}-tile-shine`;

  return (
    <IconFrame
      from="#fdfdfb"
      to="#eceae6"
      shineStops={LAUNCHER_SHINE_STOPS}
      innerStroke="rgb(255 255 255 / 60%)"
      glyphShadow={{ dy: 0.5, stdDeviation: 0.8, floodOpacity: 0.18 }}
      extraDefs={
        <>
          <linearGradient id={highlightId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity=".45" />
            <stop offset="55%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          {LAUNCHER_TILES.map((tile, index) => (
            <linearGradient
              key={index}
              id={`${id}-tile-${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={tile.from} />
              <stop offset="100%" stopColor={tile.to} />
            </linearGradient>
          ))}
          {LAUNCHER_TILES.map((_, index) => {
            const col = (index % 3) as 0 | 1 | 2;
            const row = Math.floor(index / 3) as 0 | 1 | 2;
            return (
              <clipPath key={`clip-${index}`} id={`${id}-tile-clip-${index}`}>
                <rect
                  x={LAUNCHER_TILE_ORIGINS[col]}
                  y={LAUNCHER_TILE_ORIGINS[row]}
                  width="9"
                  height="9"
                  rx="2.5"
                />
              </clipPath>
            );
          })}
        </>
      }
    >
      {LAUNCHER_TILES.map((_, index) => {
        const col = (index % 3) as 0 | 1 | 2;
        const row = Math.floor(index / 3) as 0 | 1 | 2;
        const x = LAUNCHER_TILE_ORIGINS[col];
        const y = LAUNCHER_TILE_ORIGINS[row];
        return (
          <g key={index} clipPath={`url(#${id}-tile-clip-${index})`}>
            <rect
              x={x}
              y={y}
              width="9"
              height="9"
              rx="2.5"
              fill={`url(#${id}-tile-${index})`}
            />
            <rect
              x={x}
              y={y}
              width="9"
              height="9"
              rx="2.5"
              fill={`url(#${highlightId})`}
            />
            <rect
              x={x}
              y={y + 8.5}
              width="9"
              height="0.5"
              fill="rgb(0 0 0 / 12%)"
            />
          </g>
        );
      })}
    </IconFrame>
  );
}

function PowerMark() {
  return (
    <IconFrame from="#57524c" to="#29241f">
      <path
        d="M26 14v10"
        fill="none"
        stroke="rgb(255 255 255 / 92%)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M19.2 18.4a9.2 9.2 0 1 0 13.6 0"
        fill="none"
        stroke="rgb(255 255 255 / 92%)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </IconFrame>
  );
}

const icons: Record<DockIconId, () => JSX.Element> = {
  blog: BlogMark,
  projects: ProjectsMark,
  now: NowMark,
  contact: ContactMark,
  launcher: LauncherMark,
  power: PowerMark,
};

export function DockIcon({ id }: { id: DockIconId }) {
  const Icon = icons[id];
  return <Icon />;
}
