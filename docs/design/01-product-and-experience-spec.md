# Product and experience spec

## 1. Product definition

DonghyeokOS is the public home for Donghyeok's personal domain. It connects a small set of public destinations through an expressive, developer-oriented desktop metaphor.

The product should communicate:

- Donghyeok is a developer who writes to understand and builds useful systems.
- The site is personal and crafted, not a generic portfolio template.
- The interface rewards exploration without hiding essential navigation.
- Motion explains spatial relationships and state changes.
- The visual language is warm, bright, calm, and tactile.

Suggested one-line description:

> A warm personal desktop on the internet.

## 2. Experience principles

### 2.1 macOS-flavored, with original assets

macOS supplies familiar concepts - a desktop, menu bar, windows, Dock, app switching, keyboard shortcuts - and macOS-flavored chrome such as traffic-light dots, glass materials, and a floating Dock is embraced as part of the charm. The boundary is assets, not vibes: do not use Apple's proprietary fonts, icons, wallpapers, or branding.

### 2.2 The content remains the point

The visitor should quickly understand who Donghyeok is and where to find writing and projects. Decorative motion must never make Blog, Projects, Now, or Contact harder to reach.

### 2.3 One signature interaction

The expanding cylindrical App Switcher is the signature. It should be used once, with a clear system role. Do not repeat cylinders inside Projects or use them as generic cards.

### 2.4 Bright and restrained

The base is cream and white. Liquid Glass appears in windows, the menu bar, Dock, and switcher control. Avoid a screen full of overlapping blur panels.

### 2.5 Truthful interaction

The login screen is not authentication. It must say `CLICK OR PRESS ENTER`, respond instantly, and never request a password.

The account name pill may play a looping typewriter animation: the name types itself, rests, erases, and retypes with a visible caret. This is theater, not an input - there is no editable field, the whole unit remains one button with a stable accessible name, and reduced motion replaces the loop with the static name.

## 3. Public information architecture

The initial public app model is:

| App | Purpose | Initial behavior |
| --- | --- | --- |
| Blog | Public writing | Opens a DonghyeokOS Blog window with links to the public Blog destination |
| Projects | Selected work and experiments | Opens a readable project window or gallery |
| Now | Current interests and activity | Opens a compact Now window or page |
| Contact | Public contact paths | Opens a small contact window or destination |

Home is not an app. The desktop itself is the Home state: it has no Dock item and no App Switcher entry, and closing the switcher or an app window returns to it.

All four app windows use functional traffic-light controls: red closes the app, and green maximizes the window to the full browser viewport or restores it to its previous size. Yellow remains decorative until a minimize behavior is explicitly approved.

Finance is intentionally absent. It must not appear in labels, navigation arrays, source maps, screenshots, analytics event names, prefetch manifests, or hidden DOM.

The exact public URLs are not defined in this repository yet. Keep destinations configurable rather than embedding guessed domains.

## 4. Canonical narrative flow

```text
Physical desk
  -> monitor account prompt
  -> camera enters monitor
  -> DonghyeokOS Home
  -> Dock expands into App Switcher
  -> visitor selects an app
  -> switcher folds away and selected content opens
```

The visitor must be able to skip or accelerate non-essential animation after the first visit. Persisting `hasEntered` locally is acceptable, but do not make it an authentication state.

## 5. Screen specifications

The desktop Figma reference size is `1440 x 1024`. The values below describe the reference composition, not inflexible CSS coordinates for every viewport.

### 5.1 Boot / Login

Figma node: `12:6`

Purpose: establish the physical-to-digital transition and make entry feel intentional.

Required composition:

- Bright cream wall and desk
- A large dark monitor centered on the desk
- Minimal framed artwork behind the monitor
- Small plant and simple desk objects
- Monitor account content:
  - circular orange `D` avatar
  - account name `Donghyeok`
  - helper copy `CLICK OR PRESS ENTER`
- Small environmental label near the lower edge: `DONGHYEOK.NET - BOOT SEQUENCE`

Behavior:

- The entire account target is clickable.
- `Enter` and `Space` trigger entry while the target is focused.
- There is no text input and no password. The account name may auto-type and erase in the looping typewriter animation described in 2.5; it is never an editable field.
- Show a visible focus ring before keyboard activation.

Do not place the cylinder, Dock, desktop windows, Blog content, or Finance content on this screen.

### 5.2 Entering DonghyeokOS

Figma node: `12:9`

Purpose: explain how the physical monitor becomes the digital desktop.

Required composition:

- The dark monitor viewport expands toward the browser viewport.
- Concentric soft rings or tunnel edges preserve a visible source and destination.
- The orange `D` monogram remains centered long enough to anchor the transition.
- The progress bar must be driven by real loading (assets, fonts, data). If nothing meaningful is loading, keep the transition short rather than animating a fake bar.

This is a camera/space transition, not a page spinner.

### 5.3 DonghyeokOS Home

Figma node: `12:12`

Purpose: provide the default public overview and resting navigation state.

Required composition:

- Menu bar: 56 px reference height
- Large, faint orange `DH` monogram in the background
- About window on the left
- Recent Blog window on the right
- Small Now note in the lower-right area
- Compact Liquid Glass Dock centered near the bottom, holding the four public app items plus two system controls after a divider: the launcher (opens the App Switcher) and the power control (returns to the login screen); no Home item and no active-state indicator dots

Canonical About copy:

> Hi, I'm Donghyeok - a developer who writes to understand and builds useful systems.
>
> This site is my desk on the internet: essays on the blog, experiments everywhere else.

Canonical sample post titles in Figma are placeholders for real data integration:

- On writing daily
- Notes from systems class
- Small tools I keep

Do not ship invented dates or articles as real content. Replace them with actual Blog data or clearly mark the surface as a design fixture during development.

### 5.4 App Switcher

Approved Figma node: `26:97`

Purpose: provide a distinctive global app selection state and connect the Dock to the larger cylinder interaction.

Opening state:

- Existing Home windows recede to approximately 16% visual prominence.
- The resting Dock recedes to approximately 12% visual prominence.
- A light frosted veil begins below the menu bar.
- The menu bar remains legible and changes its active label to `App Switcher`.
- No decorative background word sits behind the reel; the photographic band is the sole visual focus.
- Helper copy near the top advertises keys the browser can actually capture, including `← →` to choose, `Enter` to open, and `Esc` to return to the desktop. Do not advertise `CMD TAB`; the operating system reserves it and the page never receives it.

Reel construction:

- One continuous cylinder-shaped band, not three detached capsules
- Reference visible band: approximately 884 x 310 within the 1440 x 1024 frame
- Selected app occupies the broad central face
- Adjacent apps remain visible as compressed side faces
- Current study shows Blog, Projects, and Now as the visible sequence
- Each face uses its app tone; Projects uses ink (the study's blue center face is superseded)
- White editorial text on the tonal faces is an accepted, deliberate contrast exception
- A subtle top rim, bottom rim, curvature shading, reflection band, and soft floor shadow create depth
- The lower reflection remains much lighter than the content band
- Large background typography may partially pass behind the band

Selected app treatment:

- App name is large and editorial
- The selected face is clean: no code or preview card behind the title (the study's terminal card is superseded)
- Selected app metadata is present but subordinate
- Side app labels are readable enough to communicate available rotation, but never compete with the selected item

Expanded Dock control:

- Appears below the reel and remains visually connected by a thin tether
- Contains the selected Dock Item, app name, position such as `APP 02 OF 04`, previous/next controls, and `OPEN`
- Keyboard contract is visible below: rotate, open, close

The switcher is modal in behavior even if it is not rendered in a browser modal element. Background content cannot receive pointer or keyboard actions while the switcher is open.

### 5.5 Projects after selection

The Projects destination is not designed as another cylinder.

Use one of these readable patterns:

- Finder-like gallery with project thumbnails and metadata
- Standard DonghyeokOS window containing a dense project list
- A large selected-project window with a supporting project sidebar

The exact Projects content view is not approved yet. Keep the first implementation small and avoid inventing a complex project database.

## 6. Responsive behavior

### Desktop: 1180 px and wider

- Preserve the complete desk and desktop compositions.
- Keep the App Switcher centered and allow adjacent reel faces to remain visible.
- Cap the desktop canvas so ultra-wide displays do not stretch windows excessively.

### Tablet: 768-1179 px

- Preserve the narrative but simplify the physical desk props.
- Stack or overlap Home windows more tightly.
- Reduce the reel width while retaining one center face and two narrow side previews.
- Do not reduce body text below accessible sizes.

### Mobile: below 768 px

- Use a simplified portrait boot screen.
- Enter a single-column DonghyeokOS Home rather than shrinking the full desktop.
- Use a horizontal app carousel that retains top/bottom curvature cues; a full 3D cylinder is optional.
- Keep Blog, Projects, Now, and Contact reachable through visible controls even when advanced motion is disabled.
- Do not require hover.

## 7. Content and privacy rules

- Blog content is public and may be linked or summarized.
- Project content is public only when explicitly selected for this site.
- Contact content should expose only channels the user has approved.
- Finance is private. Absence from the visible UI is not enough; exclude it from public bundles and data.
- Do not collect credentials, financial data, or private analytics identifiers.

## 8. Design provenance

The continuous reel is interaction inspiration from [Kenichi Aikawa's portfolio](https://aikawakenichi.com/). The implementation must use original code, original content, and DonghyeokOS visual tokens. Do not copy assets, photographs, source code, or exact branded composition.
