"use client";

/* Native anchors preserve modified-click and query-based history navigation. */
/* eslint-disable @next/next/no-html-link-for-pages */

import { useCallback, useEffect, useReducer, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { useReducedMotion } from "motion/react";
import { experienceReducer, initialExperienceState, selectedApp } from "@/src/app/experience-machine";
import { getPublicApp, isPublicAppId, publicApps, type PublicAppId } from "@/src/content/public-apps";
import { prefetchBlogPosts } from "@/src/content/blog-feed";
import { WebGLReel, type WebGLReelHandle } from "./WebGLReel";
import AppContent from "./AppContent";

export default function DonghyeokOS() {
  const [state, dispatch] = useReducer(experienceReducer, initialExperienceState);
  const [reelStatus, setReelStatus] = useState("pending");
  const reducedMotion = useReducedMotion();
  const reelRef = useRef<WebGLReelHandle>(null);
  const stageRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const originRef = useRef<HTMLElement | null>(null);
  const pointer = useRef<{ id: number; x: number; y: number; dx: number; dy: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  const app = selectedApp(state.selection);
  const activeApp = state.name === "content" ? state.appId : null;
  useEffect(() => {
    if (app.id === "blog") prefetchBlogPosts();
  }, [app.id]);
  const ready = useCallback(() => setReelStatus("ready"), []);
  const unavailable = useCallback(() => setReelStatus("unavailable"), []);
  const close = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("app");
    window.history.pushState({}, "", url);
    dispatch({ type: "CLOSE" });
  }, []);
  const open = (id: PublicAppId) => {
    originRef.current = document.activeElement as HTMLElement;
    const url = new URL(window.location.href);
    url.searchParams.set("app", id);
    window.history.pushState({}, "", url);
    dispatch({ type: "OPEN_APP", appId: id });
  };
  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: PublicAppId) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    open(id);
  };
  useEffect(() => {
    const sync = () => {
      const value = new URLSearchParams(window.location.search).get("app");
      dispatch({ type: "NAVIGATE", appId: isPublicAppId(value) ? value : null });
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (activeApp && dialog) {
      if (!dialog.open) dialog.showModal();
      const overflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog.querySelector<HTMLElement>("h1")?.focus();
      return () => { document.body.style.overflow = overflow; };
    }
    if (dialog?.open) {
      dialog.close();
      (originRef.current ?? stageRef.current)?.focus();
    }
  }, [activeApp]);

  useEffect(() => {
    const cancelPointer = () => {
      const activePointer = pointer.current;
      pointer.current = null;
      if (activePointer) {
        suppressClick.current = true;
        if (stageRef.current?.hasPointerCapture?.(activePointer.id)) stageRef.current.releasePointerCapture(activePointer.id);
      }
      reelRef.current?.setDragOffset(0, 1);
      reelRef.current?.resetTilt();
    };
    const onVisibility = () => { if (document.hidden) cancelPointer(); };
    window.addEventListener("blur", cancelPointer);
    document.addEventListener("visibilitychange", onVisibility);
    return () => { window.removeEventListener("blur", cancelPointer); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  useEffect(() => {
    if (activeApp) return;
    const onArrowKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, [role='textbox'], [role='slider']"))) return;
      event.preventDefault();
      dispatch({ type: "ROTATE", direction: event.key === "ArrowLeft" ? -1 : 1 });
      stageRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", onArrowKey);
    return () => document.removeEventListener("keydown", onArrowKey);
  }, [activeApp]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || activeApp) return;
    let distance = 0;
    let rotated = false;
    let peak = 0;
    let previous = 0;
    let decayed = false;
    let startedAt = 0;
    let direction = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const reset = () => { clearTimeout(idle); distance = 0; rotated = false; direction = 0; peak = 0; previous = 0; decayed = false; startedAt = 0; };
    const onWheel = (event: WheelEvent) => {
      // Only horizontal gestures belong to the reel; leave page scroll and zoom native.
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || pointer.current) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, [role='textbox'], [role='slider']"))) return;
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      clearTimeout(idle);
      idle = setTimeout(reset, 140);
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientWidth : 1;
      const delta = event.deltaX * unit;
      const magnitude = Math.abs(delta);
      const nextDirection = delta > 0 ? 1 : -1;
      // Wheel events have no finger-up marker. Keep one step latched throughout
      // momentum; a fresh impulse after decay (or a reversal) starts a new swipe.
      const newImpulse = decayed && Date.now() - startedAt >= 120 && magnitude >= Math.max(6, previous + 2, previous * 1.5);
      if (nextDirection !== direction || newImpulse) {
        distance = 0;
        rotated = false;
        peak = 0;
        decayed = false;
        startedAt = Date.now();
      } else if (magnitude <= peak * .5) {
        decayed = true;
      }
      direction = nextDirection;
      previous = magnitude;
      peak = Math.max(peak, magnitude);
      if (rotated) return;
      distance += delta;
      if (Math.abs(distance) < 12) return;
      rotated = true;
      distance = 0;
      dispatch({ type: "ROTATE", direction: nextDirection });
    };
    document.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("blur", reset);
    return () => { reset(); document.removeEventListener("wheel", onWheel); window.removeEventListener("blur", reset); };
  }, [activeApp]);

  const finishDrag = (event: PointerEvent<HTMLButtonElement>, cancelled = false) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    pointer.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    suppressClick.current = start.dragging && Math.max(Math.abs(start.dx), Math.abs(start.dy)) > 6;
    if (!cancelled && start.dragging && Math.abs(start.dx) > 44) dispatch({ type: "ROTATE", direction: start.dx < 0 ? 1 : -1 });
    reelRef.current?.setDragOffset(0, 1);
    reelRef.current?.resetTilt();
  };

  return (
    <div className="home-shell"
      onPointerDownCapture={event => { event.currentTarget.dataset.input = "pointer"; }}
      onKeyDownCapture={event => { event.currentTarget.dataset.input = "keyboard"; }}
    >
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="/">Donghyeok</a>
        <nav aria-label="Main navigation">
          {publicApps.map(item => (
            <a
              key={item.id}
              href={`/?app=${item.id}`}
              onClick={event => navigate(event, item.id)}
              onPointerEnter={() => { if (item.id === "blog") prefetchBlogPosts(); }}
              onFocus={() => { if (item.id === "blog") prefetchBlogPosts(); }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>
      <main id="main">
        <section className="introduction" aria-labelledby="intro-title">
          <h1 id="intro-title">Developer, writing<br />and building.</h1>
          <p>A personal collection of work, notes, and experiments.</p>
        </section>
        <section className="app-explorer" aria-label="Explore applications" onKeyDown={event => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          if (event.key === "Enter") {
            event.preventDefault();
            if (!event.repeat) open(app.id);
          }
        }}>
          <button className="reel-stage" ref={stageRef} type="button" data-renderer={reelStatus} aria-label={`Open ${app.label}`} aria-describedby="reel-help"
            onPointerEnter={() => { if (app.id === "blog") prefetchBlogPosts(); }}
            onFocus={() => { if (app.id === "blog") prefetchBlogPosts(); }}
            onClick={event => { if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; } open(app.id); }}
            onPointerDown={event => {
              if (event.button !== 0 || pointer.current) return;
              suppressClick.current = false;
              pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0, dragging: false };
            }}
            onPointerMove={event => {
              const start = pointer.current;
              if (!start) {
                if (event.pointerType === "mouse" && !event.buttons) {
                  const rect = event.currentTarget.getBoundingClientRect();
                  reelRef.current?.setTilt((event.clientX - rect.left) / rect.width * 2 - 1, (event.clientY - rect.top) / rect.height * 2 - 1);
                }
                return;
              }
              if (start.id !== event.pointerId) return;
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (event.pointerType !== "mouse" && !start.dragging && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { pointer.current = null; suppressClick.current = true; return; }
              if (Math.abs(dx) > 8 || (event.pointerType === "mouse" && Math.abs(dy) > 8)) { start.dragging = true; event.currentTarget.setPointerCapture?.(event.pointerId); }
              start.dx = dx;
              start.dy = dy;
              if (event.pointerType === "mouse") reelRef.current?.setTilt(dx / 300, dy / 160, true);
              if (start.dragging) reelRef.current?.setDragOffset(dx, event.currentTarget.clientWidth * .5);
            }}
            onPointerUp={event => finishDrag(event)} onPointerCancel={event => finishDrag(event, true)}
            onLostPointerCapture={event => { if (pointer.current) finishDrag(event, true); }}
            onPointerLeave={event => { if (pointer.current && !pointer.current.dragging) finishDrag(event, true); if (!pointer.current) reelRef.current?.resetTilt(); }}
            onBlur={() => reelRef.current?.resetTilt()}>
            <WebGLReel apps={publicApps} visualIndex={state.selection} ref={reelRef} reducedMotion={Boolean(reducedMotion)} onReady={ready} onUnavailable={unavailable} />
            {reelStatus === "unavailable" && <span className="reel-fallback" aria-hidden="true"><span>{selectedApp(state.selection - 1).label}</span><strong>{app.label}</strong><span>{selectedApp(state.selection + 1).label}</span></span>}
          </button>
          <div className="reel-controls">
            <p className="reel-position" aria-live="polite" aria-atomic="true"><span className="sr-only">{app.label}, </span>{String(publicApps.indexOf(app) + 1).padStart(2, "0")} / 04</p>
            <div className="reel-arrows">
              <button type="button" tabIndex={-1} aria-label="Previous app" onClick={() => { dispatch({ type: "ROTATE", direction: -1 }); stageRef.current?.focus({ preventScroll: true }); }}>←</button>
              <button type="button" tabIndex={-1} aria-label="Next app" onClick={() => { dispatch({ type: "ROTATE", direction: 1 }); stageRef.current?.focus({ preventScroll: true }); }}>→</button>
            </div>
            <p className="selected-description">{app.id === "projects" ? "Selected tools and experiments." : app.preview.description}</p>
            <a className="explore-link" tabIndex={-1} href={`/?app=${app.id}`}
              onClick={event => navigate(event, app.id)}
              onPointerEnter={() => { if (app.id === "blog") prefetchBlogPosts(); }}
              onFocus={() => { if (app.id === "blog") prefetchBlogPosts(); }}
            >
              Explore {app.label.toLowerCase()} <span aria-hidden="true">↗</span>
            </a>
            <p id="reel-help" className="reel-help">Drag or scroll sideways · Arrow keys to choose · Enter to open</p>
          </div>
        </section>
      </main>
      <footer className="site-footer"><p>Independent work. Always in progress.</p><a href="/?app=contact" onClick={event => navigate(event, "contact")}>Contact <span aria-hidden="true">↗</span></a></footer>
      <dialog className="content-panel" ref={dialogRef} aria-labelledby="panel-title" onCancel={event => { event.preventDefault(); close(); }}>
        {activeApp && <>
          <header className="panel-header"><span>Donghyeok / {getPublicApp(activeApp).label}</span><button type="button" onClick={close} aria-label="Close content">Close</button></header>
          <div className="panel-body"><p className="panel-eyebrow">{getPublicApp(activeApp).preview.eyebrow}</p><h1 id="panel-title" tabIndex={-1}>{getPublicApp(activeApp).label}</h1><AppContent appId={activeApp} /></div>
        </>}
      </dialog>
    </div>
  );
}
