# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This is the home for **DonghyeokOS**, a personal home site styled as a warm, cream-colored desktop on the web (macOS-inspired interaction metaphor, not a clone). **Implementation has not started.** The repo currently contains only design documentation under `docs/`; there is no framework, package manager, build system, or test tooling yet, and the branch has no commits.

There are no build/lint/test commands until a stack is scaffolded. Do not install a framework, package manager, or animation library without confirming the stack decision with the user first. The recommended (but unapproved) default is Vite + React + TypeScript + Motion for React, with Vitest/Testing Library and Playwright, deployed to Cloudflare Pages — see `docs/design/04-implementation-handoff.md` §2 for the rationale and the questions to confirm before scaffolding.

## Design documentation

Read in this order before implementing anything:

1. `docs/README.md` — approved direction, Figma node map, non-goals
2. `docs/design/01-product-and-experience-spec.md` — screens, flows, responsive behavior
3. `docs/design/02-visual-system.md` — color/spacing/typography tokens (values read from Figma)
4. `docs/design/03-motion-and-interaction.md` — state model, transitions, keyboard/reduced-motion contracts
5. `docs/design/04-implementation-handoff.md` — stack, source structure, data model, phases, acceptance criteria

When sources disagree: explicit decisions in `docs/` win, then the approved Figma frames (`App Switcher Study` node `26:97`, `DonghyeokOS Home` node `12:12`), then other Figma pages. The Figma file is [DonghyeokOS - Personal Home](https://www.figma.com/design/e7BKkfzaGEZqis4pRkkGOy).

## Approved direction (binding decisions)

- Keep the existing Home desktop and the compact Liquid Glass Dock in its resting state.
- The continuous cylinder is an **App Switcher that expands from the Dock** — not a permanent Dock, not a Projects browser, and never shown on the login screen. It opens from a launcher-style control in the Dock; the adjacent power control is separate and returns to the login screen. Never advertise `CMD TAB` (browsers cannot capture it). The Figma `Project Cylinder` frame (node `12:15`) is deprecated; do not implement it.
- **Home is not an app**: the desktop itself is the Home state, with no Dock item and no switcher entry. Dock items have no active-state dots. Projects uses ink tone everywhere, including its reel face. The selected reel face is title-only (no preview card), and white text on the reel's tonal faces is an accepted contrast exception.
- The login screen is a theatrical entrance, not authentication: click/Enter/Space to enter, no password field, no fake credential form. The account name may play a looping typewriter animation (theater, not input — static under reduced motion, stable accessible name). `hasEntered` may persist locally but is not an auth state. The entry progress bar must reflect real loading only.
- macOS-flavored chrome (traffic lights, glass, Dock) is embraced; never use Apple's proprietary assets (SF fonts, SF Symbols, wallpapers, logos).
- Projects opens as a readable window or Finder-like gallery (exact view not yet approved — keep it small).
- **Privacy boundary: Blog is public; Finance is private.** Finance must not appear anywhere in shipped code or data — not in navigation arrays, type unions, labels, prefetch manifests, analytics event names, or hidden DOM.
- The reel is interaction inspiration from aikawakenichi.com; never copy that site's code, assets, or typography composition.
- Non-goals for v1: dark mode, real authentication, WebGL as a requirement, mobile parity with the desktop composition, a full window manager.

## Architecture (when implementation begins)

- **One explicit state machine** owns top-level experience state (`boot → entering → desktop → switcher → opening-app`), modeled as a discriminated union — never scattered booleans like `isLoggedIn`/`showSwitcher`. The exact `ExperienceState` type is in `docs/design/03-motion-and-interaction.md` §2. Local component state is fine only for drag progress, hover/focus, and window-local controls.
- **A single typed public app list** (`blog | projects | now | contact` — Home is the desktop state, not an app) is the sole source for Dock and App Switcher ordering (schema in handoff doc §4).
- **CSS token contract first**: create `src/styles/tokens.css` from the visual-system doc before styling components — colors, four app accents, spacing, radii, motion durations/easings, and the z-index scale (`--z-desktop-bg: 0` through `--z-focus: 100`). No arbitrary z-index values in components.
- **Reel built with CSS/DOM first** — one continuous clipped strip with distance-based compression, animating a single normalized selection offset; not detached glass capsules per app. WebGL only if the CSS prototype fails.
- The switcher behaves modally: background inert while open, focus trapped and returned on close, previous/next/open/close all keyboard-operable, decorative layers hidden from assistive technology.
- Keyboard and reduced-motion support are architectural requirements from the start, not cleanup tasks. Reduced-motion mode avoids zoom, parallax, and rotation.
- Keep destination URLs (Blog, Contact) configurable — the real public URLs are not defined in this repo yet. Do not ship the Figma placeholder post titles/dates as real content.
- Implementation proceeds in phases with exit conditions (handoff doc §11): foundation/tokens → static Home → App Switcher → boot narrative → polish/deploy.
