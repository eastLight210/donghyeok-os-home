# Minimal Home

Approved September 5, 2026 after the user selected the [generated reference](references/minimal-home.png) and asked to proceed with implementation. This document supersedes conflicting decisions in the earlier OS design documents and Figma frames.

## Direction

Pure white canvas, black sans-serif typography, gray secondary copy. One continuous monochrome cylindrical application reel is the signature interaction and is visible on arrival. Small wordmark and direct navigation above; an introduction, reel, selection controls, and a quiet footer. No login/boot, wallpaper, widgets, Dock, power control, glass, photographs, reflections, or window traffic lights.

The reference is a visual target, never the rendered interface. UI text, links, controls, and content remain semantic HTML. The reel reuses the existing Three.js cylinder geometry with grayscale materials and runtime text labels. The initial selected app is Projects. A soft shadow defines the band; decorative reflections and pointer parallax are removed.

## Content and navigation

- Single public list: Blog, Projects, Now, Contact. Home is the root page.
- Navigation links open content directly; modified clicks retain native link behavior.
- `/?app=blog|projects|now|contact` opens a readable native dialog with a plain Close button. Existing public content and links are preserved. Blog opens a list of posts and a link to the full public blog.
- Closing removes only the app query parameter. Back/Forward synchronize the panel. Unknown app values show Home.
- Now is a manually maintained snapshot. Updated September 6, 2026 from the user's confirmation that they are attending KAIST for the fall semester; do not invent further biographical updates.
- Public/private exclusion rules from the original spec remain binding.

## Interaction and accessibility

One discriminated state union owns `home` and `content`, with a continuous numerical reel selection preserved across panel changes. Horizontal drag snaps by one entry; arrows wrap through the list. Arrow keys work when focus is within the explorer; Enter/Space on the reel opens its current app. Navigation outside the reel works independently.

A live region announces the selected app and position. The canvas is decorative and its wrapping button has a current accessible name. Native modal dialog semantics make the background inert, contain focus, and handle Escape. Closing returns focus to the opener, or the reel for a direct URL. Panel content scrolls without scrolling the background. Reduced motion makes rotation immediate and removes panel animation. Vertical touch gestures retain page scrolling. If WebGL fails or is lost, a text fallback and all navigation controls remain usable.

## Implementation

Existing npm, React, TypeScript, Vinext, Motion, Three.js, and Cloudflare setup is retained; no new framework or dependencies. `src/styles/tokens.css` owns palette, spacing, motion, and layer values. `src/components/DonghyeokOS.tsx` owns the shell, `AppContent.tsx` the existing content, and `WebGLReel.tsx` the cylinder. Three.js remains lazy-loaded. Idle frames do not redraw the canvas; resources are disposed on unmount.

Desktop reference: 1536 × 1024. Smaller screens retain the same hierarchy with fluid type, scaled reel, and full-height scrollable content panels. Main navigation remains available without gestures.

## Validation

Run `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`. Browser validation must cover reference-size desktop, narrow mobile, selection and wrapping, keyboard opening/closing and focus restoration, direct URLs/history, and reduced motion. Evidence and remaining visual differences live in `design-qa.md`.

## Reel material refinement — September 5

The user asked for greater physical realism because the surrounding UI is minimal. The reel now uses studio image-based lighting, a satin clear-coated material, a thicker rounded metallic rim, a higher viewing angle exposing the inner shell, and text geometrically wrapped onto the cylinder. No photographic textures or mirrored floor reflections are introduced. The controls gain 16px clearance beneath the deeper silhouette. The latest reference implementation captures are `qa/minimal-home/material-desktop.png` and `material-mobile.png`.

## Panel-bound title motion

Titles are fixed in their own panel's local coordinates and share the cylinder group's rotation. Do not clamp title angles toward the camera, resize labels by viewing angle, or toggle their visibility at arbitrary angular thresholds. Depth testing and front-face culling determine natural occlusion. At rest, neighboring titles may be partly hidden around the silhouette; this is intentional physical behavior.

## Pointer play

Mouse hover adds subtle pitch/roll. A held mouse drag may pull vertically for stronger tilt while horizontal displacement still rotates selection. A shared outer transform keeps panels, labels and rims together; the silhouette scales down only as needed to fit the existing canvas while strongly tilted. Damped easing returns it to rest on release, pointer exit, focus loss, cancellation or window blur. Vertical mouse dragging suppresses click-to-open. Touch vertical intent remains page scrolling. Reduced-motion mode suppresses all decorative tilt and drag interpolation.

## Keyboard navigation — September 6

The explorer has one Tab stop: the reel. Left/Right changes the selected app; Enter opens it. Pointer arrow controls and the duplicate Explore link remain usable but are excluded from sequential Tab navigation. Clicking an arrow returns focus to the reel, so subsequent Enter opens the newly selected app. Keyboard focus is indicated by a small contrasting underline beneath the center title, never a rectangle around the canvas or a focus proxy on another control. Pointer interaction hides this indicator. Native modal keyboard focus behavior remains intact.

Keyboard follow-up: at the user's request, remove the center-title focus underline entirely. Left/Right works anywhere on the initialized Home page without clicking or tabbing to the reel first, then moves focus to the reel so Enter opens the selected app. Disable this shortcut while a content panel is open, while editing a field, during IME composition, or with modifier keys. No proxy focus outline or replacement underline on the reel.
