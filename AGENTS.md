# AGENTS.md

## Repository

This is Donghyeok's personal home, implemented with React, TypeScript, Vinext/Vite, Motion, and Three.js. Use npm and the existing stack. Production uses the existing Cloudflare Workers configuration; do not scaffold another framework.

Validation: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Current approved design

The user approved a monochrome minimal redesign on September 5, 2026. Read `docs/design/05-minimal-home.md` and its reference image before visual work. This supersedes older OS instructions in `docs/design/01` through `04` and the previous Figma desktop frames.

- Pure white background, black sans-serif type, gray secondary text.
- The continuous application reel is visible on arrival, initially selecting Projects.
- No login, boot transition, wallpaper, widgets, Dock, power button, glass panels, reel photographs/reflections, or traffic-light controls.
- Blog, Projects, Now, Contact are the single typed public app list. Home is the root page, not an app.
- Content opens in readable native modal panels with ordinary Close controls, direct query URLs, and Back/Forward support.
- Preserve the public/private boundary: Finance must not appear in client code, public data, navigation, hidden DOM, or metadata.
- Existing public content and destination URLs remain authoritative; never invent posts, projects, or newer biography claims.
- Never copy external inspiration code/assets or use Apple's proprietary fonts, symbols, wallpapers, or logos.

## Architecture

- One discriminated state union owns home/content and the selected reel offset.
- `src/styles/tokens.css` owns color, spacing, motion, and z-index tokens.
- Reuse the existing cylinder geometry; the approved screenshot must never replace live UI.
- Keep DOM navigation and fallback usable when WebGL is unavailable.
- Preserve keyboard operation, modal focus containment/restoration, vertical touch scrolling, and reduced-motion behavior.
- Test changed behavior and visually check desktop/mobile before handing off.

## Git

Check configured Git email before committing, and follow recent commit style with `feat:`, `fix:`, or `refactor:` headers. Deployment is a separate action from local implementation.
