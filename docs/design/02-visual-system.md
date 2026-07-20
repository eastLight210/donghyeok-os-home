# Visual system

## 1. Visual character

Use these adjectives to evaluate design changes:

- warm
- bright
- editorial
- tactile
- quiet
- precise
- personal

Avoid these failure modes:

- gray enterprise dashboard
- dark cyberpunk terminal
- neon glassmorphism
- verbatim Apple assets (SF fonts, SF Symbols, system wallpapers, Apple logos); macOS-flavored chrome itself is welcome
- playful toy OS with too many bouncing elements
- generic portfolio cards on a gradient background

## 2. Color tokens

These values are read from the approved Figma screens. Use semantic CSS custom properties and keep primitive values behind them.

```css
:root {
  --color-bg-canvas: #f8f0e2;
  --color-bg-canvas-soft: #fffbf3;
  --color-bg-desk: #f0e2c9;
  --color-bg-monitor: #17121d;

  --color-surface-window: rgb(255 255 255 / 76%);
  --color-surface-window-soft: rgb(255 255 255 / 52%);
  --color-surface-glass-rim: #ffffff;
  --color-surface-sticky: #fce6a4;

  --color-text-primary: #2b241f;
  --color-text-secondary: #4e433a;
  --color-text-muted: #8e7a65;
  --color-text-inverse: #ffffff;

  --color-border-glass: rgb(255 255 255 / 76%);
  --color-border-subtle: rgb(43 36 31 / 12%);

  --color-accent-orange: #d98735;
  --color-accent-orange-soft: #f1b76e;
  --color-accent-blue: #79a6bc;
  --color-accent-green: #6f9270;
}
```

Color usage rules:

- Cream is the environment, not just a card background.
- Orange is the identity accent and focus color.
- Blue, green, and ink identify apps; they are not generic status colors.
- Projects is ink everywhere, including its App Switcher reel face; the approved study's blue center face is superseded. Confirm the exact ink primitive in Figma Foundations before implementation.
- Use pure white primarily inside translucent material and for inverse text.
- Avoid new saturated colors until there is a content-driven need.
- The App Switcher may use optical gradients derived from app colors, but all ordinary solid fills should use semantic tokens.

## 3. Typography

### Font families

| Role | Family | Typical use |
| --- | --- | --- |
| Editorial display | DM Serif Display | Monograms, large screen words, app titles, post titles |
| System and body | IBM Plex Mono | Menu bar, controls, copy, metadata, keyboard hints |
| Korean body fallback | IBM Plex Sans KR | Korean prose when mono is too dense |

Do not default to Inter or SF Pro. The contrast between serif display type and mono system type is central to the identity.

### Figma text styles

| Style | Reference |
| --- | --- |
| Display/Monogram | DM Serif Display Regular, 96 px style reference |
| Display/Title | DM Serif Display Regular, 64 px |
| Heading/Window | DM Serif Display Regular, 28 px |
| Heading/Post | DM Serif Display Regular, 24 px |
| Body/Large | IBM Plex Mono Regular, 18 px |
| Body/Base | IBM Plex Mono Regular, 16 px |
| Body/Small | IBM Plex Mono Regular, 14 px |
| Label/Strong | IBM Plex Mono SemiBold, 14/20 |
| Label/Upper | IBM Plex Mono Medium, 12/18, 2 px tracking |
| Korean/Body | IBM Plex Sans KR Regular, 16 px |

Web implementation guidance:

- Load only the weights actually used.
- Prefer self-hosted WOFF2 assets when licensing permits.
- Provide robust fallbacks and reserve layout space to avoid shifting during font load.
- Large DM Serif text may use fluid `clamp()` sizing.
- Uppercase mono labels need generous tracking and should not carry long sentences.
- Body copy should remain at least 16 px on small screens.

## 4. Geometry

```css
:root {
  --radius-card: 20px;
  --radius-window: 28px;
  --radius-dock: 36px;
  --radius-pill: 9999px;
  --stroke-hairline: 1px;
}
```

Geometry rules:

- Windows use 28 px corners and a clear 52 px title/header zone in the desktop reference.
- Dock surfaces use 36 px corners.
- Dock Item icons are rounded squares, not circles.
- The App Switcher reel is a perspective band with shallow top and bottom arcs. Do not substitute three rounded rectangles.
- Circular controls are reserved for directional or system actions.

## 5. Spacing

The Figma variable scale is based on:

```text
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96
```

Recommended semantic mapping:

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;
}
```

Use the scale for layout, but allow optical exceptions for the cylinder curves, reflections, and transition tunnel.

## 6. Liquid Glass materials

Liquid Glass should be a material system, not a global blur effect.

### Window material

Figma `Glass/Window`:

```text
background blur: 24px
drop shadow: 0 20px 40px -12px rgb(43 36 31 / 12%)
inner highlight: inset 0 1px 1px rgb(255 255 255 / 78%)
fill: rgb(255 255 255 / 76%)
border: 1px solid rgb(255 255 255 / 76%)
```

### Dock material

Figma `Glass/Dock`:

```text
background blur: 28px
drop shadow: 0 16px 32px -10px rgb(43 36 31 / 16%)
inner highlight: inset 0 1px 2px rgb(255 255 255 / 82%)
fill: rgb(255 255 255 / 52%)
border: 1px solid rgb(255 255 255 / 76%)
```

### Monitor elevation

```text
drop shadow: 0 34px 56px -18px rgb(43 36 31 / 22%)
```

Implementation notes:

- Use `backdrop-filter` only on bounded surfaces.
- Always provide an opaque or semi-opaque fallback for unsupported browsers.
- Do not stack multiple 24-28 px backdrop blurs over the same area.
- Keep text on a stable contrast layer rather than relying on the background image.
- Reflections should be subtle and may be removed on lower-power devices.

## 7. Core components

### Menu Bar

Figma component: `9:2`

- Reference height: 56 px
- Left: orange mark, `DonghyeokOS`, divider, active app
- Right: minimal status and time
- The time may be live, but it should not cause hydration mismatch or constant layout movement.
- App launching belongs in the Dock/App Switcher, not in a crowded menu bar.

### Window

Figma component set: `7:18`

- Light is the default desktop variant.
- Dark is reserved for boot or focused system surfaces.
- Window chrome is decorative in the first release; do not imply draggable/resizable behavior unless implemented.
- If traffic-light controls are non-functional, mark them decorative and remove them from the tab order.
- In app windows, red is the close control and green toggles maximize/restore; yellow remains decorative.

### Dock Item

Figma component set: `8:34`

- Tones: Orange, Ink, Blue, Green
- Glyph is editable.
- Each icon must have a programmatic app name and a visible tooltip or label where appropriate.
- There is no active/selected state in the first release; the menu bar communicates the active app. Do not render indicator dots.
- The Dock also holds two system controls after a divider, distinct from app items: the launcher (3x3 grid glyph, opens the App Switcher) and the power control (returns to the login screen).

### Login Account

Figma component: `11:2`

- Account name and helper copy are editable.
- The whole unit is one interaction target.
- It is a boot action, not a form.

### App Switcher Reel

The approved reel is currently a screen-level composition, not a finalized reusable Figma component. Implement it as a dedicated application component with data-driven segments.

Its geometry should include:

- continuous clipped band
- selected central face
- compressed neighboring faces
- top and bottom rim
- curvature shading
- restrained reflection
- soft floor shadow
- expanded Dock control

The Figma `Cylinder Panel` component set (`10:26`) is deprecated and should not shape the implementation.

## 8. Layering reference

From back to front in App Switcher state:

1. Cream desktop background and ambient blobs
2. Recessed Home windows and note
3. Frosted veil below the menu bar
4. Reel reflection and floor shadow
5. Continuous reel content
6. Reel rims and highlights
7. Expanded Dock control and keyboard contract
8. Menu bar

The menu bar must remain readable and should not be blurred by the switcher veil.

## 9. Accessibility contrast

- Primary body text target: WCAG AA, at least 4.5:1.
- Large editorial text target: at least 3:1.
- Muted helper text may be lower emphasis only when non-essential.
- Provide a 2 px orange inner focus ring plus a 2 px cream/white separation ring where needed.
- Test contrast against the resolved composite result of translucent materials, not only token values in isolation.
- Accepted exception: white editorial text on the App Switcher reel's tonal faces may sit below the targets. This is a deliberate stylistic decision; the semantic app buttons keep full accessible names, and the switcher's essential controls (Dock control, keyboard contract, helper copy) still meet the targets.
