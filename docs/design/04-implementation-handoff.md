# Implementation handoff

## 1. Repository state

At documentation time, `/Users/kimdonghyeok/Documents/Projects/donghyeok_dotnet/Home` is empty and is not a Git repository.

There is no approved framework, package manager, deployment configuration, or content API yet. Do not present a scaffold choice as an existing project convention.

## 2. Recommended default stack

If the user asks the next agent to begin implementation without choosing a stack, propose this default before installing dependencies:

- Vite
- React
- TypeScript
- CSS Modules or well-structured plain CSS with custom properties
- Motion for React for state transitions and drag/spring behavior
- Vitest and Testing Library
- Playwright for interaction and visual smoke tests
- Cloudflare Pages for static hosting

Why this default:

- The experience is a client-side interactive shell rather than a content-heavy server application.
- Blog already exists as a separate public destination.
- The App Switcher benefits from React state and a mature motion layer.
- Static deployment fits Cloudflare Free and does not require a backend.

Alternative: Astro with a React island if the user prioritizes static HTML and minimal JavaScript. Do not choose Next.js solely because it is common; there is no demonstrated server-rendering requirement yet.

Before scaffolding, confirm:

1. preferred package manager
2. final domain/subdomain
3. public Blog URL
4. whether Projects and Now are local content or external destinations
5. whether the boot sequence should replay on every visit

## 3. Suggested source structure

```text
src/
  app/
    App.tsx
    experience-machine.ts
    routes.ts
  components/
    boot/
      BootDesk.tsx
      LoginAccount.tsx
      MonitorTransition.tsx
    desktop/
      Desktop.tsx
      MenuBar.tsx
      Window.tsx
      Dock.tsx
      DockItem.tsx
    switcher/
      AppSwitcher.tsx
      AppReel.tsx
      AppReelSegment.tsx
      SwitcherControls.tsx
    apps/
      HomeView.tsx
      ProjectsView.tsx
      NowView.tsx
      ContactView.tsx
  content/
    public-apps.ts
    projects.ts
  hooks/
    useReducedMotionPreference.ts
    useRovingSelection.ts
  styles/
    tokens.css
    global.css
    materials.css
    motion.css
  test/
```

Names may change with the selected stack, but preserve boundaries between experience state, desktop chrome, switcher behavior, and content.

## 4. Data model

The public app list should be the single source for Dock and App Switcher ordering. The Dock renders these four items plus the launcher-style switcher control (a system control, not part of this list).

```ts
export type PublicAppId = 'blog' | 'projects' | 'now' | 'contact';

export interface PublicApp {
  id: PublicAppId;
  label: string;
  shortLabel: string;
  tone: 'orange' | 'ink' | 'blue' | 'green';
  glyph: string;
  kind: 'internal' | 'external';
  href?: string;
  preview: {
    eyebrow: string;
    title: string;
    description: string;
  };
}
```

Do not include Finance in this union or array. Avoid a broader private-app model in code shipped to the browser.

Home is not in this list: the desktop itself is the Home state, so there is no Home entry in the Dock or the App Switcher. Projects uses `tone: 'ink'`.

## 5. Experience state ownership

Use one explicit reducer or state machine for top-level experience transitions. Do not spread boot, desktop, and switcher visibility across unrelated booleans such as:

```text
isLoggedIn
isZooming
showDesktop
showSwitcher
isOpeningApp
```

Independent booleans permit impossible states. Prefer the discriminated union in the motion document.

Local component state is appropriate for:

- drag progress
- hover/focus presentation
- window-local content controls
- temporary pointer capture

## 6. CSS token contract

Create `src/styles/tokens.css` from the visual-system document before styling components.

At minimum, expose:

```text
color backgrounds
surface colors
text colors
glass borders
four app accents
spacing scale
window/card/dock radii
hairline stroke
motion durations and easing curves
z-index layers
```

Recommended z-index tokens:

```css
:root {
  --z-desktop-bg: 0;
  --z-window: 10;
  --z-dock: 20;
  --z-switcher-veil: 30;
  --z-switcher-reel: 40;
  --z-switcher-controls: 50;
  --z-menu-bar: 60;
  --z-focus: 100;
}
```

Do not use arbitrary z-index values in individual components.

## 7. Reel implementation strategy

Start with CSS and DOM. WebGL is optional and should be introduced only if the CSS prototype cannot achieve acceptable motion.

Recommended first approach:

1. Render app segments in one horizontally connected strip.
2. Clip the strip to an SVG or CSS `clip-path` matching the shallow cylinder band.
3. Apply distance-based horizontal compression and opacity to segments.
4. Use top/bottom SVG ellipses or pseudo-elements for rims.
5. Render the reflection as a non-interactive mirrored visual layer with a mask and blur.
6. Animate one normalized selection offset.
7. Keep semantic app buttons in the DOM even if a decorative layer uses canvas later.

Possible structure:

```html
<div class="app-reel">
  <div class="app-reel__shadow" aria-hidden="true"></div>
  <div class="app-reel__reflection" aria-hidden="true"></div>
  <div class="app-reel__mask">
    <div class="app-reel__track" role="listbox">...</div>
  </div>
  <div class="app-reel__rim app-reel__rim--top" aria-hidden="true"></div>
  <div class="app-reel__rim app-reel__rim--bottom" aria-hidden="true"></div>
</div>
```

Do not implement each app as an independent glass capsule. The visible faces must read as one continuous wrapped surface.

## 8. Content integration

### Blog

- Keep the public Blog URL in configuration.
- If recent posts are shown on Home, fetch them at build time or through a stable public feed.
- Provide a deterministic fallback so Home does not break when the Blog feed is unavailable.
- Do not ship fictional post dates as production data.

### Projects

- Start with a small local typed data file.
- Include only projects approved for public display.
- Each project should have title, summary, status, link, technologies, and optional preview asset.
- The initial Projects window may be a dense list; it does not need another signature interaction.

### Now

- Use short, manually maintained content first.
- Do not build a CMS until editing friction demonstrates a need.

### Contact

- Prefer explicit links over a backend form for the first release.
- Do not expose private addresses or identifiers.

## 9. Routing behavior

Decide app behavior explicitly:

- Internal apps may update the URL using routes or query state.
- External Blog navigation should use a real link and retain standard browser behavior.
- Opening in a new tab must be user-visible and use `rel="noreferrer"` where appropriate.
- Back/forward navigation should not replay the full boot sequence unexpectedly.
- A direct URL to a local app should enter the desktop with that app active, optionally skipping boot.

Suggested route model:

```text
/             boot or home, depending on visit policy
/?app=projects
/?app=now
/?app=contact
```

Real path routes are also acceptable. Choose one model before implementation and test browser history.

## 10. Asset policy

- Create original project preview artwork or use real project screenshots.
- Optimize raster images to AVIF/WebP with responsive sizes.
- Inline only small SVGs that benefit from styling.
- Do not download or reuse photographs from the inspiration site.
- Keep decorative assets out of the critical path.
- Provide explicit width and height to prevent layout shifts.

## 11. Implementation phases

### Phase 1: foundation

- Confirm stack and initialize repository
- Add Git and baseline scripts
- Implement tokens, fonts, global background, and accessibility reset
- Add typed public app data with no Finance entry

Exit condition: static token showcase and app data tests pass.

### Phase 2: static Home

- Build Menu Bar, Window, Dock Item, Dock, and Home composition
- Integrate real or fixture Blog data behind an explicit adapter
- Implement responsive layouts

Exit condition: Home matches Figma at desktop reference size and remains usable at tablet/mobile widths.

### Phase 3: App Switcher behavior

- Add explicit experience state machine
- Implement overlay semantics, focus trapping/inert background, keyboard selection
- Build static continuous reel
- Add drag and spring rotation
- Add Dock expansion relationship
- Add reduced-motion behavior

Exit condition: all interaction acceptance tests in the motion document pass.

### Phase 4: boot narrative

- Build physical desk and monitor login
- Add monitor entry transition
- Add replay/skip policy

Exit condition: keyboard, reduced motion, repeat visit, and direct route behavior are correct.

### Phase 5: polish and deployment

- Cross-browser checks
- Performance audit
- Accessibility audit
- Metadata, icons, analytics decision, and error handling
- Deploy to Cloudflare Pages after `npx wrangler whoami` or the chosen project-local deployment workflow confirms account context

Exit condition: production smoke test passes on the real domain.

## 12. Acceptance criteria

### Visual

- Cream/white visual language matches approved tokens.
- Home retains two main windows, Now note, monogram, menu bar, and resting Dock.
- App Switcher is a continuous band, not detached cards.
- The selected reel face is title-only; the code preview card from the study is not implemented.
- Projects renders in ink tone in both the Dock and the reel.
- Liquid Glass is restrained and readable.
- Deprecated Project Cylinder is not implemented.

### Interaction

- Login responds to click, Enter, and Space without a password.
- Dock offers a launcher-style App Switcher control and a power control (returns to the login screen), separated from the four app items.
- Dock has no Home item and no active-state indicator dots.
- Switcher supports previous, next, open, and close by keyboard.
- Background is inert while the switcher is open.
- Focus returns correctly on close.
- External links behave like real links.

### Accessibility

- All text and controls meet target contrast, except the approved white-on-tone reel face exception (visual system, section 9).
- Focus is always visible.
- App selection is programmatically announced.
- Decorative cylinder layers are ignored by assistive technology.
- Reduced-motion mode avoids zoom, parallax, rotation, and the login typewriter loop.

### Privacy and security

- Finance is absent from public code and data.
- There is no fake credential form.
- No private URLs or secrets are embedded in the client.
- External links are explicitly configured.

### Performance

- Home content renders independently of decorative asset completion.
- Layout shift from fonts and images is controlled.
- Reel drag does not cause continuous React re-rendering.
- The experience remains usable when backdrop blur or advanced motion is unavailable.

## 13. Questions intentionally left open

The next agent should ask before making irreversible implementation choices:

1. Which stack and package manager should be used?
2. What are the exact public URLs for Blog and Contact?
3. Which projects are approved for public display?
4. Should the boot sequence replay on every visit, once per session, or only on explicit replay?
5. Resolved: Blog opens inside a DonghyeokOS window first; its content links to the external public Blog.
6. Is mobile meant to preserve the OS metaphor or become a simpler personal landing page?
7. Is analytics desired, and if so, what privacy boundary is acceptable?

## 14. Do not do these things

- Do not expose Finance, even as a hidden app.
- Do not build real login/authentication for the boot screen.
- Do not place the cylinder on the boot screen.
- Do not replace the resting Dock with a permanent cylinder.
- Do not implement the old Project Cylinder exploration.
- Do not copy the inspiration site's images, code, or typography composition verbatim.
- Do not introduce WebGL before validating the CSS/DOM approach.
- Do not install a framework or animation library without confirming the empty-repository stack decision with the user.
- Do not add Home to the Dock or the App Switcher.
- Do not advertise `CMD TAB` in helper copy; the Dock launcher control is the canonical switcher entry.
