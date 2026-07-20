"use client";

import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import {
  WebGLReel,
  preloadReelAssets,
  type WebGLReelHandle,
} from "@/src/components/WebGLReel";
import { Dock } from "@/src/components/desktop/Dock";
import {
  experienceReducer,
  initialExperienceState,
} from "@/src/app/experience-machine";
import {
  getPublicApp,
  isPublicAppId,
  publicApps,
  type PublicAppId,
} from "@/src/content/public-apps";
import {
  contactLinks,
  contactProfile,
  homeNowItems,
  nowItems,
  projects,
  recentPosts,
} from "@/src/content/site-content";

const ENTERED_KEY = "donghyeok-os:entered";
const REEL_CYCLE_COUNT = 15;
const REEL_CENTER_CYCLE = Math.floor(REEL_CYCLE_COUNT / 2);
const REEL_DRAG_ACTIVATION_DISTANCE = 6;
const REEL_WHEEL_IDLE_DELAY = 140;
const REEL_WHEEL_ACCUMULATION_DECAY = 0.72;
const REEL_WHEEL_REARM_DELAY = 180;
const REEL_WHEEL_REARM_MIN_DELTA = 8;
const REEL_WHEEL_REARM_ACCELERATION = 1.8;

function getNearestReelIndex(currentIndex: number, selectedIndex: number) {
  const cycle = Math.round((currentIndex - selectedIndex) / publicApps.length);
  return cycle * publicApps.length + selectedIndex;
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function useSystemTime() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const update = () => setTime(formatTime(new Date()));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return time;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function useViewportScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const root = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const previous = {
      rootOverflow: root.style.overflow,
      rootOverscrollBehavior: root.style.overscrollBehavior,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyRight: body.style.right,
      bodyLeft: body.style.left,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
    };

    body.dataset.scrollLocked = "true";
    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.right = "0";
    body.style.left = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      delete body.dataset.scrollLocked;
      root.style.overflow = previous.rootOverflow;
      root.style.overscrollBehavior = previous.rootOverscrollBehavior;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.right = previous.bodyRight;
      body.style.left = previous.bodyLeft;
      body.style.width = previous.bodyWidth;
      body.style.overflow = previous.bodyOverflow;
      body.style.overscrollBehavior = previous.bodyOverscrollBehavior;
      if (scrollY > 0) window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

function TrafficLights({
  onClose,
  onMaximize,
  isMaximized = false,
  closeLabel = "Close window",
  maximizeLabel = "Maximize window",
}: {
  onClose?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  closeLabel?: string;
  maximizeLabel?: string;
} = {}) {
  const isInteractive = Boolean(onClose || onMaximize);

  return (
    <span
      className="traffic-lights"
      aria-hidden={isInteractive ? undefined : true}
    >
      {onClose ? (
        <button
          type="button"
          className="traffic-light-button traffic-light-close"
          onClick={onClose}
          aria-label={closeLabel}
        />
      ) : (
        <span />
      )}
      <span aria-hidden="true" />
      {onMaximize ? (
        <button
          type="button"
          className="traffic-light-button traffic-light-maximize"
          onClick={onMaximize}
          aria-label={maximizeLabel}
          aria-pressed={isMaximized}
        />
      ) : (
        <span aria-hidden="true" />
      )}
    </span>
  );
}

function BootDesk({ onEnter }: { onEnter: () => void }) {
  const coarsePointer = useMediaQuery("(pointer: coarse)");

  return (
    <motion.main
      className="boot-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="boot-art boot-art-left" aria-hidden="true">
        <span />
      </div>
      <div className="boot-art boot-art-right" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="boot-lamp" aria-hidden="true">
        <span />
      </div>
      <div className="boot-plant" aria-hidden="true">
        <i />
        <i />
        <i />
        <span />
      </div>
      <div className="desk-surface" aria-hidden="true" />
      <div className="monitor-wrap">
        <button
          className="monitor"
          type="button"
          onClick={onEnter}
          aria-label="Enter DonghyeokOS as Donghyeok"
        >
          <span className="monitor-screen">
            <span className="login-account">
              <span className="login-avatar" aria-hidden="true">
                D
              </span>
              <span className="login-name-static">Donghyeok</span>
              <span className="login-name-animated" aria-hidden="true">
                <span>Donghyeok</span>
              </span>
              <span className="login-helper">
                {coarsePointer ? "TAP TO ENTER" : "CLICK OR PRESS ENTER"}
              </span>
            </span>
          </span>
          <span className="monitor-chin">
            <span aria-hidden="true">D</span>
          </span>
        </button>
        <div className="monitor-stand" aria-hidden="true" />
      </div>
      <p className="boot-label">DONGHYEOK.NET — BOOT SEQUENCE</p>
    </motion.main>
  );
}

function EntryTransition() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="entry-transition"
      initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.12, borderRadius: 28 }}
      animate={{ opacity: 1, scale: 1, borderRadius: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: reduceMotion ? 0.18 : 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
      role="status"
      aria-live="polite"
      aria-label="Entering DonghyeokOS"
    >
      <div className="entry-ring entry-ring-one" aria-hidden="true" />
      <div className="entry-ring entry-ring-two" aria-hidden="true" />
      <span aria-hidden="true">D</span>
    </motion.div>
  );
}

function MenuBar({ activeLabel }: { activeLabel: string }) {
  const time = useSystemTime();

  return (
    <header className="menu-bar">
      <div className="menu-left">
        <span className="menu-mark" aria-hidden="true">
          ✦
        </span>
        <strong>DonghyeokOS</strong>
        <span className="menu-divider" aria-hidden="true" />
        <span>{activeLabel}</span>
      </div>
      <div className="menu-right" aria-label={`Local time ${time}`}>
        <span aria-hidden="true">⌁</span>
        <span className="status-dot" aria-hidden="true" />
        <time>{time}</time>
      </div>
    </header>
  );
}

function Window({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`os-window ${className}`} aria-label={title}>
      <header className="window-header">
        <TrafficLights />
        <span>{title}</span>
      </header>
      <div className="window-content">{children}</div>
    </section>
  );
}

function DesktopHome({
  onOpenApp,
  onOpenSwitcher,
  onPower,
  launcherRef,
  receded,
}: {
  onOpenApp: (id: PublicAppId) => void;
  onOpenSwitcher: () => void;
  onPower: () => void;
  launcherRef: RefObject<HTMLButtonElement | null>;
  receded: boolean;
}) {
  return (
    <motion.div
      className="desktop-home"
      data-receded={receded || undefined}
      animate={{ scale: receded ? 0.985 : 1, opacity: receded ? 0.16 : 1 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
    >
      <div className="ambient ambient-orange" aria-hidden="true" />
      <div className="ambient ambient-blue" aria-hidden="true" />
      <div className="ambient ambient-green" aria-hidden="true" />
      <div className="desktop-monogram" aria-hidden="true">
        DH
      </div>
      <Window title="about.txt — ~/donghyeok" className="about-window">
        <p>
          Hi, I&apos;m Donghyeok — a developer who writes to understand and builds
          useful systems.
        </p>
        <p>
          This site is my desk on the internet: essays on the blog, experiments
          everywhere else.
        </p>
      </Window>
      <Window title="blog — recent posts" className="blog-window">
        <ol className="recent-posts">
          {recentPosts.map((post) => (
            <li key={post.href}>
              <a href={post.href}>
                <strong>{post.title}</strong>
                <time>{post.date}</time>
              </a>
            </li>
          ))}
        </ol>
      </Window>
      <button
        type="button"
        className="now-note"
        onClick={() => onOpenApp("now")}
        aria-label="Open Now"
      >
        <span>NOW</span>
        {homeNowItems.map((item) => (
          <small key={item}>· {item}</small>
        ))}
      </button>
      <Dock
        onOpenApp={onOpenApp}
        onOpenSwitcher={onOpenSwitcher}
        onPower={onPower}
        launcherRef={launcherRef}
      />
    </motion.div>
  );
}

function AppContent({ appId }: { appId: PublicAppId }) {
  if (appId === "blog") {
    const blogUrl = getPublicApp("blog").href;

    return (
      <div className="blog-app-content">
        <p className="app-intro">
          Essays, field notes, and ordinary days collected on my public blog.
        </p>
        <ol className="blog-app-posts">
          {recentPosts.map((post) => (
            <li key={post.href}>
              <a href={post.href} target="_blank" rel="noreferrer">
                <strong>{post.title}</strong>
                <time>{post.date}</time>
              </a>
            </li>
          ))}
        </ol>
        {blogUrl ? (
          <a
            className="blog-site-link"
            href={blogUrl}
            target="_blank"
            rel="noreferrer"
          >
            OPEN THE FULL BLOG ↗
          </a>
        ) : null}
      </div>
    );
  }

  if (appId === "projects") {
    return (
      <div className="projects-list">
        {projects.map((project) => (
          <article key={project.title}>
            <div>
              <span>{project.status}</span>
              <h2>{project.title}</h2>
              <p>{project.summary}</p>
            </div>
            <footer>
              <ul aria-label={`${project.title} technologies`}>
                {project.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
              {"href" in project && project.href ? (
                <a href={project.href}>VISIT ↗</a>
              ) : null}
            </footer>
          </article>
        ))}
      </div>
    );
  }

  if (appId === "now") {
    return (
      <div className="now-list">
        <p className="app-intro">
          A small, manually maintained snapshot of what has my attention.
        </p>
        <dl>
          {nowItems.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="updated-label">UPDATED JUL 2026</p>
      </div>
    );
  }

  if (appId === "contact") {
    return (
      <div className="contact-content">
        <p className="contact-lead">{contactProfile.introduction}</p>
        <p>{contactProfile.description}</p>
        <div className="contact-links" aria-label="Public contact links">
          {contactLinks.map((link) => (
            <a
              href={link.href}
              key={link.label}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            >
              <span>{link.label}</span>
              <strong>{link.value}</strong>
            </a>
          ))}
        </div>
        <span>{contactProfile.location}</span>
      </div>
    );
  }

  return null;
}

function AppWindow({ appId, onClose }: { appId: PublicAppId; onClose: () => void }) {
  const app = getPublicApp(appId);
  const [isMaximized, setIsMaximized] = useState(false);
  const coarsePointer = useMediaQuery("(pointer: coarse)");

  return (
    <motion.section
      className="app-window"
      initial={{ opacity: 0, y: 34, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      tabIndex={-1}
      aria-labelledby="active-app-title"
      data-maximized={isMaximized || undefined}
    >
      <header className="app-window-header">
        <div>
          <TrafficLights
            onClose={onClose}
            onMaximize={() => setIsMaximized((current) => !current)}
            isMaximized={isMaximized}
            closeLabel={`Close ${app.label}`}
            maximizeLabel={
              isMaximized
                ? `Restore ${app.label} window`
                : `Maximize ${app.label} window`
            }
          />
          <span>{app.label.toLowerCase()} — ~/donghyeok</span>
        </div>
        <span className="app-window-shortcut">
          {coarsePointer ? "TAP × TO CLOSE" : "ESC CLOSE"}
        </span>
      </header>
      <div className="app-window-body">
        <p className="app-eyebrow">{app.preview.eyebrow}</p>
        <h1 id="active-app-title">{app.label}</h1>
        <AppContent appId={appId} />
      </div>
    </motion.section>
  );
}

function AppSwitcher({
  selectedApp,
  onSelect,
  onRotate,
  onOpen,
  onClose,
  dialogRef,
}: {
  selectedApp: PublicAppId;
  onSelect: (id: PublicAppId) => void;
  onRotate: (direction: -1 | 1) => void;
  onOpen: () => void;
  onClose: () => void;
  dialogRef: RefObject<HTMLElement | null>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const selectedIndex = publicApps.findIndex((app) => app.id === selectedApp);
  const selected = getPublicApp(selectedApp);
  const reelItems = Array.from(
    { length: REEL_CYCLE_COUNT },
    () => publicApps,
  ).flat();
  const [visualReelIndex, setVisualReelIndex] = useState(
    REEL_CENTER_CYCLE * publicApps.length + selectedIndex,
  );
  const [webglStatus, setWebglStatus] = useState<
    "pending" | "ready" | "fallback"
  >("pending");
  const accessibleCycleStart =
    Math.floor(visualReelIndex / publicApps.length) * publicApps.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reflectionTrackRef = useRef<HTMLDivElement>(null);
  const webglReelRef = useRef<WebGLReelHandle>(null);
  const activePointerRef = useRef<number | null>(null);
  const dragStartRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const wheelOffsetRef = useRef(0);
  const wheelGestureHandledRef = useRef(false);
  const wheelHandledAtRef = useRef(0);
  const wheelLastDeltaRef = useRef(0);
  const wheelIdleTimerRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const snapFrameRef = useRef<number | null>(null);
  const normalizationTimerRef = useRef<number | null>(null);
  const normalizationFrameRef = useRef<number | null>(null);
  const trackStyle = {
    "--selection-offset": `${-((visualReelIndex + 0.5) / reelItems.length) * 100}%`,
    "--drag-offset": "0px",
    "--reel-item-count": reelItems.length,
    "--reel-track-width": `${reelItems.length * 96}%`,
    "--reel-track-width-mobile": `${reelItems.length * 84}%`,
  } as CSSProperties;
  const handleWebGLReady = useCallback(() => setWebglStatus("ready"), []);
  const handleWebGLUnavailable = useCallback(
    () => setWebglStatus("fallback"),
    [],
  );

  const rotateReel = useCallback((direction: -1 | 1) => {
    setVisualReelIndex((currentIndex) => currentIndex + direction);
    onRotate(direction);
  }, [onRotate]);
  const rotateReelRef = useRef(rotateReel);

  useEffect(() => {
    rotateReelRef.current = rotateReel;
  }, [rotateReel]);

  const selectReel = (appId: PublicAppId) => {
    const targetIndex = publicApps.findIndex((app) => app.id === appId);
    setVisualReelIndex((currentIndex) =>
      getNearestReelIndex(currentIndex, targetIndex),
    );
    onSelect(appId);
  };

  useEffect(() => {
    const handleArrowKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      rotateReel(event.key === "ArrowRight" ? 1 : -1);
    };

    document.addEventListener("keydown", handleArrowKey);
    return () => document.removeEventListener("keydown", handleArrowKey);
  }, [rotateReel]);

  useEffect(() => {
    const currentCycle = Math.floor(visualReelIndex / publicApps.length);
    if (
      currentCycle === REEL_CENTER_CYCLE
      || normalizationTimerRef.current !== null
    ) return;

    normalizationTimerRef.current = window.setTimeout(() => {
      normalizationTimerRef.current = null;
      const stage = stageRef.current;
      if (!stage) return;

      stage.dataset.normalizing = "true";
      setVisualReelIndex((currentIndex) => {
        const selectedWithinCycle =
          ((currentIndex % publicApps.length) + publicApps.length)
          % publicApps.length;
        return REEL_CENTER_CYCLE * publicApps.length + selectedWithinCycle;
      });
      normalizationFrameRef.current = window.requestAnimationFrame(() => {
        normalizationFrameRef.current = window.requestAnimationFrame(() => {
          delete stage.dataset.normalizing;
          normalizationFrameRef.current = null;
        });
      });
    }, 520);
  }, [visualReelIndex]);

  useEffect(
    () => () => {
      if (snapFrameRef.current !== null) {
        window.cancelAnimationFrame(snapFrameRef.current);
      }
      if (normalizationTimerRef.current !== null) {
        window.clearTimeout(normalizationTimerRef.current);
      }
      if (normalizationFrameRef.current !== null) {
        window.cancelAnimationFrame(normalizationFrameRef.current);
      }
    },
    [],
  );

  const getSegmentWidth = useCallback(() => {
    const trackWidth = trackRef.current?.getBoundingClientRect().width ?? 0;
    return trackWidth / (REEL_CYCLE_COUNT * publicApps.length);
  }, []);

  const setTrackDragOffset = useCallback((offset: number) => {
    const value = `${offset}px`;
    trackRef.current?.style.setProperty("--drag-offset", value);
    reflectionTrackRef.current?.style.setProperty("--drag-offset", value);
    webglReelRef.current?.setDragOffset(offset, getSegmentWidth());
  }, [getSegmentWidth]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const snapWheelToCenter = () => {
      snapFrameRef.current = window.requestAnimationFrame(() => {
        snapFrameRef.current = window.requestAnimationFrame(() => {
          delete stage.dataset.dragging;
          setTrackDragOffset(0);
          snapFrameRef.current = null;
        });
      });
    };

    const finishWheelGesture = () => {
      wheelIdleTimerRef.current = null;
      wheelGestureHandledRef.current = false;
      wheelHandledAtRef.current = 0;
      wheelLastDeltaRef.current = 0;
      wheelOffsetRef.current = 0;
      if (stage.dataset.dragging) snapWheelToCenter();
    };

    const scheduleWheelGestureEnd = () => {
      if (wheelIdleTimerRef.current !== null) {
        window.clearTimeout(wheelIdleTimerRef.current);
      }
      wheelIdleTimerRef.current = window.setTimeout(
        finishWheelGesture,
        REEL_WHEEL_IDLE_DELAY,
      );
    };

    const handleWheel = (event: WheelEvent) => {
      if (
        event.ctrlKey
        || Math.abs(event.deltaX) <= Math.abs(event.deltaY)
      ) return;

      event.preventDefault();
      const deltaMultiplier = event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? stage.clientWidth
          : 1;
      const wheelDelta = event.deltaX * deltaMultiplier;

      if (wheelGestureHandledRef.current) {
        const previousDelta = wheelLastDeltaRef.current;
        const rearmReady = Date.now() - wheelHandledAtRef.current
          >= REEL_WHEEL_REARM_DELAY;
        const directionChanged = Math.abs(wheelDelta) >= REEL_WHEEL_REARM_MIN_DELTA
          && Math.sign(wheelDelta) !== Math.sign(previousDelta);
        const magnitudeIncreased = Math.abs(wheelDelta)
          >= Math.max(
            REEL_WHEEL_REARM_MIN_DELTA,
            Math.abs(previousDelta) * REEL_WHEEL_REARM_ACCELERATION,
          );
        wheelLastDeltaRef.current = wheelDelta;

        if (!rearmReady || (!directionChanged && !magnitudeIncreased)) {
          scheduleWheelGestureEnd();
          return;
        }

        wheelGestureHandledRef.current = false;
        wheelOffsetRef.current = 0;
        if (wheelIdleTimerRef.current !== null) {
          window.clearTimeout(wheelIdleTimerRef.current);
          wheelIdleTimerRef.current = null;
        }
      }

      if (snapFrameRef.current !== null) {
        window.cancelAnimationFrame(snapFrameRef.current);
        snapFrameRef.current = null;
      }

      const segmentWidth = getSegmentWidth();
      if (!segmentWidth) return;

      const maxOffset = segmentWidth * 1.12;
      const offset = Math.max(
        -maxOffset,
        Math.min(
          maxOffset,
          wheelOffsetRef.current * REEL_WHEEL_ACCUMULATION_DECAY
            - wheelDelta,
        ),
      );

      wheelOffsetRef.current = offset;
      stage.dataset.dragging = "true";
      setTrackDragOffset(offset);

      const threshold = Math.min(88, Math.max(44, segmentWidth * 0.14));
      if (Math.abs(offset) >= threshold) {
        const direction = offset < 0 ? 1 : -1;
        wheelGestureHandledRef.current = true;
        wheelHandledAtRef.current = Date.now();
        wheelLastDeltaRef.current = wheelDelta;
        wheelOffsetRef.current = 0;
        flushSync(() => rotateReelRef.current(direction));
        setTrackDragOffset(offset + direction * segmentWidth);
        snapWheelToCenter();
      }

      scheduleWheelGestureEnd();
    };

    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", handleWheel);
      if (wheelIdleTimerRef.current !== null) {
        window.clearTimeout(wheelIdleTimerRef.current);
        wheelIdleTimerRef.current = null;
      }
      wheelOffsetRef.current = 0;
      wheelGestureHandledRef.current = false;
      wheelHandledAtRef.current = 0;
      wheelLastDeltaRef.current = 0;
    };
  }, [getSegmentWidth, setTrackDragOffset]);

  const updateReelTilt = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const pointerX = Math.max(
      -1,
      Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
    );
    const pointerY = Math.max(
      -1,
      Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
    );

    webglReelRef.current?.setPointer(pointerX, pointerY);

    stage.style.setProperty("--reel-rotate-x", `${(-pointerY * 2.6).toFixed(2)}deg`);
    stage.style.setProperty("--reel-rotate-y", `${(pointerX * 3.2).toFixed(2)}deg`);
    stage.style.setProperty(
      "--reel-reflection-x",
      `${(-pointerX * 12).toFixed(2)}px`,
    );
    stage.style.setProperty(
      "--reel-reflection-y",
      `${(pointerY * 4).toFixed(2)}px`,
    );
    stage.style.setProperty(
      "--reel-reflection-skew",
      `${(-pointerX * 1.4).toFixed(2)}deg`,
    );
    stage.style.setProperty(
      "--reel-reflection-opacity",
      (0.36 + pointerY * 0.04).toFixed(3),
    );
    stage.style.setProperty("--reel-shadow-x", `${(pointerX * 10).toFixed(2)}px`);
  };

  const resetReelTilt = () => {
    const stage = stageRef.current;
    if (!stage) return;
    webglReelRef.current?.resetPointer();
    [
      "--reel-rotate-x",
      "--reel-rotate-y",
      "--reel-reflection-x",
      "--reel-reflection-y",
      "--reel-reflection-skew",
      "--reel-reflection-opacity",
      "--reel-shadow-x",
    ].forEach((property) => stage.style.removeProperty(property));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (snapFrameRef.current !== null) {
      window.cancelAnimationFrame(snapFrameRef.current);
      snapFrameRef.current = null;
    }

    activePointerRef.current = event.pointerId;
    dragStartRef.current = event.clientX;
    dragOffsetRef.current = 0;
    suppressClickRef.current = false;
    setTrackDragOffset(0);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    updateReelTilt(event);
    if (activePointerRef.current !== event.pointerId) return;
    const segmentWidth = getSegmentWidth();
    if (!segmentWidth || !trackRef.current) return;

    const rawOffset = event.clientX - dragStartRef.current;
    if (
      Math.abs(rawOffset) > REEL_DRAG_ACTIVATION_DISTANCE
      && !event.currentTarget.hasPointerCapture?.(event.pointerId)
    ) {
      event.currentTarget.dataset.dragging = "true";
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    const maxOffset = segmentWidth * 1.12;
    const offset = Math.max(-maxOffset, Math.min(maxOffset, rawOffset));
    dragOffsetRef.current = offset;
    setTrackDragOffset(offset);
  };

  const finishPointer = (
    event: ReactPointerEvent<HTMLDivElement>,
    cancelled = false,
  ) => {
    if (activePointerRef.current !== event.pointerId) return;

    const stage = stageRef.current;
    const track = trackRef.current;
    const offset = dragOffsetRef.current;
    const segmentWidth = getSegmentWidth();
    activePointerRef.current = null;

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!stage || !track || !segmentWidth) return;

    const threshold = Math.min(88, Math.max(44, segmentWidth * 0.14));
    const direction = !cancelled && Math.abs(offset) >= threshold
      ? (offset < 0 ? 1 : -1)
      : null;

    suppressClickRef.current = Math.abs(offset) > REEL_DRAG_ACTIVATION_DISTANCE;
    if (direction) {
      if (event.pointerType === "touch") navigator.vibrate?.(8);
      flushSync(() => rotateReel(direction));
      const continuityOffset = offset + direction * segmentWidth;
      setTrackDragOffset(continuityOffset);
    }

    snapFrameRef.current = window.requestAnimationFrame(() => {
      snapFrameRef.current = window.requestAnimationFrame(() => {
        delete stage.dataset.dragging;
        setTrackDragOffset(0);
        snapFrameRef.current = null;
      });
    });
  };

  return (
    <motion.section
      className="switcher-shell"
      role="dialog"
      aria-modal="true"
      aria-label="App Switcher"
      ref={dialogRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="switcher-veil" aria-hidden="true" />
      <p className="switcher-helper">
        {coarsePointer ? (
          <>SWIPE &nbsp;·&nbsp; TAP TO OPEN</>
        ) : (
          <>← → CHOOSE AN APP &nbsp;·&nbsp; ENTER OPEN &nbsp;·&nbsp; ESC BACK TO DESKTOP</>
        )}
      </p>
      <motion.div
        className="reel-stage"
        ref={stageRef}
        data-webgl-ready={webglStatus === "ready" || undefined}
        initial={{ opacity: 0, y: 74, scaleY: 0.78 }}
        animate={
          webglStatus === "pending"
            ? { opacity: 0, y: 74, scaleY: 0.78 }
            : { opacity: 1, y: 0, scaleY: 1 }
        }
        exit={{ opacity: 0, y: 46, scaleY: 0.86 }}
        transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={(event) => {
          resetReelTilt();
          finishPointer(event, true);
        }}
        onPointerLeave={() => {
          if (activePointerRef.current === null) resetReelTilt();
        }}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;
          suppressClickRef.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <WebGLReel
          ref={webglReelRef}
          apps={publicApps}
          visualIndex={visualReelIndex}
          reducedMotion={Boolean(prefersReducedMotion)}
          onReady={handleWebGLReady}
          onUnavailable={handleWebGLUnavailable}
        />
        <div className="reel-shadow" aria-hidden="true" />
        <div className="reel-reflection" aria-hidden="true">
          <div
            className="reel-reflection-track"
            ref={reflectionTrackRef}
            style={trackStyle}
          >
            {reelItems.map((app, reelIndex) => {
              const isSelected =
                reelIndex === visualReelIndex && app.id === selectedApp;
              return (
                <span
                  className="reel-reflection-segment"
                  data-tone={app.tone}
                  data-selected={isSelected || undefined}
                  key={`reflection-${app.id}-${reelIndex}`}
                  style={{
                    "--reel-image": `url("${app.reelImage}")`,
                  } as CSSProperties}
                >
                  <strong>{app.label}</strong>
                </span>
              );
            })}
          </div>
        </div>
        <div className="reel-mask">
          <div
            className="reel-track"
            ref={trackRef}
            role="listbox"
            aria-label="Applications"
            aria-activedescendant={`app-${selectedApp}`}
            style={trackStyle}
            data-visual-index={visualReelIndex}
          >
            {reelItems.map((app, reelIndex) => {
              const index = reelIndex % publicApps.length;
              const rawDistance = Math.abs(index - selectedIndex);
              const distance = Math.min(rawDistance, publicApps.length - rawDistance);
              const isAccessibleCycle =
                reelIndex >= accessibleCycleStart
                && reelIndex < accessibleCycleStart + publicApps.length;
              const isSelected = isAccessibleCycle && app.id === selectedApp;
              return (
                <button
                  type="button"
                  role={isAccessibleCycle ? "option" : undefined}
                  aria-label={isAccessibleCycle ? app.label : undefined}
                  aria-selected={isAccessibleCycle ? isSelected : undefined}
                  aria-hidden={!isAccessibleCycle || undefined}
                  tabIndex={isAccessibleCycle && isSelected ? 0 : -1}
                  id={isAccessibleCycle ? `app-${app.id}` : undefined}
                  className="reel-segment"
                  data-tone={app.tone}
                  data-distance={Math.min(distance, 2)}
                  key={`${app.id}-${reelIndex}`}
                  style={{
                    "--reel-image": `url("${app.reelImage}")`,
                  } as CSSProperties}
                  onClick={() => (isSelected ? onOpen() : selectReel(app.id))}
                >
                  <strong>{app.label}</strong>
                </button>
              );
            })}
          </div>
        </div>
        <div className="reel-rim reel-rim-top" aria-hidden="true" />
        <div className="reel-rim reel-rim-bottom" aria-hidden="true" />
      </motion.div>
      <div className="switcher-tether" aria-hidden="true" />
      <div className="switcher-controls" data-tone={selected.tone}>
        <span className="selected-glyph" data-tone={selected.tone} aria-hidden="true">
          {selected.glyph}
        </span>
        <div className="selected-meta" aria-live="polite">
          <strong>{selected.label}</strong>
          <span>APP {String(selectedIndex + 1).padStart(2, "0")} OF 04</span>
        </div>
        <div className="switcher-arrow-group">
          <button
            className="arrow-control"
            type="button"
            onClick={() => rotateReel(-1)}
            aria-label="Previous app"
          >
            ←
          </button>
          <button
            className="arrow-control"
            type="button"
            onClick={() => rotateReel(1)}
            aria-label="Next app"
          >
            →
          </button>
        </div>
        <span className="control-divider" aria-hidden="true" />
        <button type="button" className="open-control" onClick={onOpen}>
          {coarsePointer ? "OPEN" : "↳ OPEN"}
        </button>
        <button type="button" className="close-control" onClick={onClose}>
          {coarsePointer ? "CLOSE" : "ESC CLOSE"}
        </button>
      </div>
    </motion.section>
  );
}

function OpeningApp({ appId }: { appId: PublicAppId }) {
  const app = getPublicApp(appId);
  return (
    <motion.div
      className="opening-app"
      initial={{ opacity: 0, y: 60, scale: 0.72 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 1.04 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      data-tone={app.tone}
      role="status"
      aria-label={`Opening ${app.label}`}
    >
      <span>{app.glyph}</span>
      <strong>{app.label}</strong>
    </motion.div>
  );
}

export default function DonghyeokOS() {
  const [state, dispatch] = useReducer(experienceReducer, initialExperienceState);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const switcherRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const isSwitcher = state.name === "switcher";
  const selectedSwitcherApp = state.name === "switcher" ? state.selectedApp : null;
  const activeApp = state.name === "desktop" ? state.activeApp : null;
  const isAppOpen = state.name === "opening-app" || Boolean(activeApp);
  const shouldLockScroll = isSwitcher || isAppOpen;

  useViewportScrollLock(shouldLockScroll);

  const routeApp = useCallback(() => {
    const value = new URLSearchParams(window.location.search).get("app");
    return isPublicAppId(value) && getPublicApp(value).kind === "internal"
      ? value
      : null;
  }, []);

  const closeApp = useCallback(() => {
    window.history.pushState({}, "", "/");
    dispatch({ type: "NAVIGATE", appId: null });
  }, []);

  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(() =>
        preloadReelAssets(publicApps),
      );
      return () => window.cancelIdleCallback(handle);
    }
    const timer = window.setTimeout(() => preloadReelAssets(publicApps), 400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const directApp = routeApp();
    if (directApp || window.sessionStorage.getItem(ENTERED_KEY) === "true") {
      dispatch({ type: "SKIP_BOOT", activeApp: directApp });
    }

    const onPopState = () => dispatch({ type: "NAVIGATE", appId: routeApp() });
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [routeApp]);

  useEffect(() => {
    if (state.name !== "entering") return;
    const timer = window.setTimeout(
      () => {
        window.sessionStorage.setItem(ENTERED_KEY, "true");
        dispatch({ type: "ENTERED" });
      },
      reducedMotion ? 180 : 900,
    );
    return () => window.clearTimeout(timer);
  }, [state.name, reducedMotion]);

  useEffect(() => {
    if (state.name !== "boot") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      dispatch({ type: "ENTER" });
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [state.name]);

  useEffect(() => {
    if (state.name !== "opening-app") return;
    const app = getPublicApp(state.selectedApp);
    const timer = window.setTimeout(
      () => {
        if (app.kind === "external" && app.href) {
          window.location.assign(app.href);
          return;
        }
        const params = new URLSearchParams(window.location.search);
        params.set("app", app.id);
        window.history.pushState({}, "", `/?${params.toString()}`);
        dispatch({ type: "APP_OPENED" });
      },
      reducedMotion ? 180 : 360,
    );
    return () => window.clearTimeout(timer);
  }, [state, reducedMotion]);

  useEffect(() => {
    if (!isSwitcher || !selectedSwitcherApp) return;
    window.setTimeout(() => {
      switcherRef.current?.querySelector<HTMLElement>("[aria-selected='true']")?.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dispatch({ type: "CANCEL_SWITCHER" });
        window.setTimeout(() => launcherRef.current?.focus(), 0);
      } else if (
        event.key === "Enter" &&
        document.activeElement?.getAttribute("role") === "option"
      ) {
        event.preventDefault();
        dispatch({ type: "OPEN_SELECTED" });
      } else if (event.key === "Tab" && switcherRef.current) {
        const focusable = Array.from(
          switcherRef.current.querySelectorAll<HTMLElement>(
            "button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])",
          ),
        ).filter((element) => element.offsetParent !== null);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSwitcher, selectedSwitcherApp]);

  useEffect(() => {
    if (!activeApp) return;
    const focusTimer = window.setTimeout(() => {
      document.querySelector<HTMLElement>(".app-window")?.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeApp();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeApp, closeApp]);

  const activeLabel = useMemo(() => {
    if (state.name === "switcher") return "App Switcher";
    if (state.name === "opening-app") return getPublicApp(state.selectedApp).label;
    if (state.name === "desktop" && state.activeApp) {
      return getPublicApp(state.activeApp).label;
    }
    return "Home";
  }, [state]);

  const powerOff = () => {
    window.sessionStorage.removeItem(ENTERED_KEY);
    window.history.replaceState({}, "", "/");
    dispatch({ type: "POWER_OFF" });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="experience-root"
        data-state={state.name}
        data-scroll-locked={shouldLockScroll || undefined}
        data-app-open={isAppOpen || undefined}
      >
      <AnimatePresence mode="wait">
        {state.name === "boot" ? (
          <BootDesk key="boot" onEnter={() => dispatch({ type: "ENTER" })} />
        ) : null}
        {state.name === "entering" ? <EntryTransition key="entering" /> : null}
      </AnimatePresence>

      {state.name !== "boot" && state.name !== "entering" ? (
        <main className="desktop-shell">
          <MenuBar activeLabel={activeLabel} />
          <div
            className="desktop-surface"
            inert={isSwitcher ? true : undefined}
            aria-hidden={isSwitcher || undefined}
          >
            <DesktopHome
              onOpenApp={(appId) => dispatch({ type: "OPEN_APP", appId })}
              onOpenSwitcher={() => dispatch({ type: "OPEN_SWITCHER" })}
              onPower={powerOff}
              launcherRef={launcherRef}
              receded={isSwitcher}
            />
            <AnimatePresence>
              {activeApp ? (
                <AppWindow key={activeApp} appId={activeApp} onClose={closeApp} />
              ) : null}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {state.name === "switcher" ? (
              <AppSwitcher
                key="switcher"
                selectedApp={state.selectedApp}
                onSelect={(appId) => dispatch({ type: "SELECT_APP", appId })}
                onRotate={(direction) => dispatch({ type: "ROTATE", direction })}
                onOpen={() => dispatch({ type: "OPEN_SELECTED" })}
                onClose={() => {
                  dispatch({ type: "CANCEL_SWITCHER" });
                  window.setTimeout(() => launcherRef.current?.focus(), 0);
                }}
                dialogRef={switcherRef}
              />
            ) : null}
            {state.name === "opening-app" ? (
              <OpeningApp key="opening" appId={state.selectedApp} />
            ) : null}
          </AnimatePresence>
        </main>
      ) : null}
      </div>
    </MotionConfig>
  );
}
