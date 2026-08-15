import { useId, type JSX, type ReactNode } from "react";
import type { PublicAppId } from "@/src/content/public-apps";

export type DockIconId = PublicAppId | "launcher" | "power";

function IconFrame({
  children,
  from,
  to,
}: {
  children: ReactNode;
  from: string;
  to: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const fillId = `${id}-fill`;
  const shineId = `${id}-shine`;

  return (
    <svg viewBox="0 0 52 52" className="dock-icon-svg" aria-hidden="true">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <linearGradient id={shineId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity=".42" />
          <stop offset="38%" stopColor="#fff" stopOpacity=".08" />
          <stop offset="100%" stopColor="#000" stopOpacity=".12" />
        </linearGradient>
      </defs>
      <rect width="52" height="52" rx="12" fill={`url(#${fillId})`} />
      <rect
        x="1"
        y="1"
        width="50"
        height="50"
        rx="11"
        fill={`url(#${shineId})`}
      />
      {children}
    </svg>
  );
}

function BlogMark() {
  return (
    <IconFrame from="#e39a4a" to="#c46f24">
      <rect x="13" y="11" width="26" height="30" rx="3.5" fill="#fff8ee" />
      <path d="M32 11h7v7l-7-7z" fill="#f1d2a8" />
      <rect x="18" y="20" width="16" height="1.6" rx=".8" fill="#d98735" />
      <rect x="18" y="25" width="16" height="1.6" rx=".8" fill="#e2b57a" />
      <rect x="18" y="30" width="11" height="1.6" rx=".8" fill="#e2b57a" />
    </IconFrame>
  );
}

function ProjectsMark() {
  return (
    <IconFrame from="#4a4550" to="#2a2428">
      <path
        d="M12 22.5c0-1.4 1.1-2.5 2.5-2.5h6.2l2.1-2.4c.4-.4 1-.7 1.6-.7h13.1c1.4 0 2.5 1.1 2.5 2.5v16.1c0 1.4-1.1 2.5-2.5 2.5h-23c-1.4 0-2.5-1.1-2.5-2.5z"
        fill="#f4efe6"
      />
      <path
        d="M12 24.2h28v14.4c0 1.4-1.1 2.5-2.5 2.5h-23c-1.4 0-2.5-1.1-2.5-2.5z"
        fill="#d8cfc0"
      />
      <rect x="20" y="28" width="12" height="7" rx="1.4" fill="#2b241f" opacity=".55" />
    </IconFrame>
  );
}

function NowMark() {
  return (
    <IconFrame from="#86aa84" to="#547856">
      <rect x="13" y="14" width="26" height="25" rx="4" fill="#f4f7f1" />
      <rect x="13" y="14" width="26" height="7" rx="4" fill="#3f5d42" />
      <rect x="13" y="18" width="26" height="3" fill="#3f5d42" />
      <rect x="19" y="12" width="2.4" height="6" rx="1.2" fill="#2d4030" />
      <rect x="30.6" y="12" width="2.4" height="6" rx="1.2" fill="#2d4030" />
      <rect x="18" y="26" width="5" height="5" rx="1" fill="#6f9270" />
      <rect x="25.5" y="26" width="5" height="5" rx="1" fill="#c5d4c4" />
      <rect x="33" y="26" width="5" height="5" rx="1" fill="#c5d4c4" />
    </IconFrame>
  );
}

function ContactMark() {
  return (
    <IconFrame from="#8eb9cb" to="#4f7f96">
      <path
        d="M14 16.5c0-1.9 1.6-3.5 3.5-3.5h17c1.9 0 3.5 1.6 3.5 3.5v12c0 1.9-1.6 3.5-3.5 3.5H24l-6.2 5.1c-.7.6-1.8 0-1.8-.9V32H17.5c-1.9 0-3.5-1.6-3.5-3.5z"
        fill="#f4fbff"
      />
      <circle cx="22" cy="22.5" r="1.6" fill="#4f7f96" />
      <circle cx="26" cy="22.5" r="1.6" fill="#4f7f96" />
      <circle cx="30" cy="22.5" r="1.6" fill="#4f7f96" />
    </IconFrame>
  );
}

function LauncherMark() {
  return (
    <IconFrame from="#f6f3ee" to="#d9d4cc">
      { [16, 26, 36].flatMap((y) =>
        [16, 26, 36].map((x) => (
          <rect
            key={`${x}-${y}`}
            x={x - 3}
            y={y - 3}
            width="6"
            height="6"
            rx="1.6"
            fill="#5c564e"
          />
        )),
      )}
    </IconFrame>
  );
}

function PowerMark() {
  return (
    <IconFrame from="#f6f3ee" to="#d9d4cc">
      <path
        d="M26 14v10"
        fill="none"
        stroke="#5c564e"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M19.2 18.4a9.2 9.2 0 1 0 13.6 0"
        fill="none"
        stroke="#5c564e"
        strokeWidth="3.2"
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
