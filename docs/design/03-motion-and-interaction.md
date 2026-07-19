# Motion and interaction spec

## 1. Motion principles

Motion must explain:

- where the visitor came from
- what object changed state
- what is currently selected
- where the selected content will open

Avoid continuous ambient motion that competes with reading. The main movements should follow direct user input. Approved exception: the boot screen's typewriter loop (section 4) - no reading content competes with it, and it stops under reduced motion.

## 2. State model

Recommended top-level states:

```ts
type ExperienceState =
  | { name: 'boot' }
  | { name: 'entering' }
  | { name: 'desktop'; activeApp: AppId | null }
  | { name: 'switcher'; selectedApp: AppId; originApp: AppId | null }
  | { name: 'opening-app'; selectedApp: AppId };
```

Transitions:

```text
boot -> entering
entering -> desktop
desktop -> switcher
switcher -> switcher (rotate selection)
switcher -> opening-app
opening-app -> desktop(activeApp)
switcher -> desktop(originApp) on cancel
desktop -> boot via the Dock power control (deliberate replay of the entrance)
```

Do not model the boot account as an authenticated user session.

## 3. Reference timing

The following values combine the Figma motion spec with the approved App Switcher study.

| Event | Duration | Easing / behavior |
| --- | ---: | --- |
| Boot account press | 120 ms | ease-out, scale 0.98 -> 1 |
| Enter monitor | 900 ms | `cubic-bezier(.22, 1, .36, 1)` |
| Desktop windows appear | 420 ms | low-bounce spring or ease-out approximation |
| Home windows recede for switcher | 280 ms | ease-in-out |
| Resting Dock begins expansion | 220 ms | ease-out |
| Reel raises/unfolds | 520-650 ms | `cubic-bezier(.16, 1, .3, 1)` |
| Rotate one app | 460 ms | critically damped spring; no overshoot beyond one item |
| Open selected app | 420 ms | reel folds toward Dock while destination rises |
| Close switcher | 320 ms | ease-in-out |
| Reduced-motion state change | 180 ms | opacity crossfade only |

Durations are targets, not independent delays. Overlap related phases so the interface feels like one causal movement.

## 4. Boot interaction

Input:

- pointer click/tap on the account target
- `Enter` or `Space` when the account target is focused

Idle animation:

- The account name types itself, rests, erases, and retypes in a loop with a blinking caret.
- The unit remains a single button; pressing letter keys does not edit anything.
- The accessible name stays stable (e.g. `Enter DonghyeokOS as Donghyeok`); the animating text is hidden from assistive technology.
- Under `prefers-reduced-motion: reduce`, show the static name with no loop and no blinking caret.

Sequence:

1. Account target compresses slightly for 120 ms.
2. Desk props lose emphasis.
3. Monitor viewport expands toward the browser viewport.
4. Orange `D` remains centered as a spatial anchor.
5. Desktop background resolves.
6. Windows enter with small vertical offsets and stagger no greater than 80 ms.

If the visitor has `prefers-reduced-motion: reduce`, replace the zoom with a 180 ms crossfade from the desk to the desktop.

## 5. Opening the App Switcher

Inputs:

- click/tap the launcher-style switcher control in the Dock (the canonical entry)
- optional keyboard shortcuts, but only ones the browser can actually capture

Browser limitation:

`Command+Tab` is reserved by the operating system and never reaches the web page. Do not advertise it in helper copy; advertise the arrow-key contract instead. The Dock launcher control is mandatory.

Sequence:

1. Capture the currently active app as `originApp`.
2. Lock background pointer interaction.
3. Move focus into the switcher.
4. Recede Home windows and the resting Dock.
5. Fade in the frosted veil below the menu bar.
6. Change the menu bar active label to `App Switcher`.
7. Expand the selected Dock Item into the lower switcher control.
8. Raise and unfold the continuous reel from the Dock's visual origin.
9. Announce the selected app to assistive technology.

The reel must not simply fade into an unrelated location. Its motion should preserve the Dock-to-switcher relationship.

## 6. Rotating the reel

Inputs:

- `ArrowLeft` / `ArrowRight`
- previous/next buttons
- horizontal drag or swipe on the reel
- optional trackpad horizontal wheel while the pointer is over the reel

Rules:

- One key press moves exactly one app.
- Holding a key may repeat, but rotation must remain readable and interruptible.
- Dragging follows the pointer directly, then snaps to the nearest app.
- Mouse hover adds no more than roughly 3 degrees of two-axis tilt; the reflection and floor shadow shift with it, then settle to neutral on pointer exit.
- Do not hijack normal vertical page scrolling.
- The selected app is always visually and programmatically unique.
- Neighboring items wrap only if the app list is intentionally circular.
- Update `aria-selected` after the visual selection settles or during drag using a stable nearest-item rule.

Visual interpolation by distance from center:

```text
center face:
  opacity 1
  saturation 1
  scale 1
  blur 0

adjacent face:
  opacity 0.65-0.8
  saturation 0.75-0.9
  horizontal compression increases toward the edge
  title scale decreases

far face:
  hidden or clipped
```

Use transform and opacity for animation. Avoid updating layout properties every frame.

## 7. Opening an app

Inputs:

- `Enter`
- click/tap the selected center face
- click/tap `OPEN`

Sequence:

1. Selected face receives a short focus/commit highlight.
2. Adjacent faces lose opacity.
3. Reel folds or scales toward the Dock.
4. Frosted veil clears.
5. Destination window rises from the desktop plane.
6. Menu bar active label updates to the destination.
7. Focus moves to the destination heading or window container.

External destinations such as Blog may navigate after the commit animation begins. Do not delay navigation by more than approximately 300 ms solely for decoration.

An open app window closes with either its red traffic light or `Escape`. Both inputs return to the Home desktop and clear the app URL state; the window header exposes a small `ESC CLOSE` hint.

## 8. Closing the switcher

Inputs:

- `Escape`
- click/tap a clearly labeled close or background area, if implemented
- re-activate the switcher control

Behavior:

- Return to `originApp` without opening the highlighted app.
- Reverse the Dock relationship without replaying the full open duration.
- Restore focus to the element that opened the switcher.
- Re-enable background interaction only after the overlay is no longer intercepting input.

## 9. Focus and semantics

Recommended accessible structure:

```html
<section role="dialog" aria-modal="true" aria-label="App Switcher">
  <div role="listbox" aria-label="Applications" aria-activedescendant="app-projects">
    <button role="option" aria-selected="true" id="app-projects">...</button>
  </div>
</section>
```

Alternative patterns are acceptable if tested, but keep these guarantees:

- Background is inert while open.
- Focus cannot disappear behind the overlay.
- `Escape` closes.
- Every app has an accessible name.
- Current selection is announced.
- Previous and next buttons have explicit labels.
- Decorative reflections and rims are hidden from assistive technology.

## 10. Reduced motion

When `prefers-reduced-motion: reduce` is active:

- Replace monitor zoom, parallax, spring, reel raise, reel rotation, and reflection movement with 180 ms opacity changes.
- Keep the same screens and controls.
- Keep selection changes immediate and understandable.
- Do not autoplay tunnel or camera motion.
- Do not remove focus movement or announcements.

Suggested CSS boundary:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
  }

  [data-motion="decorative"] {
    animation: none !important;
    transition-duration: 180ms !important;
  }
}
```

Do not globally set all transition durations to zero; focus and state feedback still need to be perceptible.

## 11. Performance constraints

- Animate `transform`, `opacity`, and limited filter values.
- Keep backdrop blur surfaces bounded.
- Avoid more than two simultaneously animated blur layers.
- Avoid per-frame React state updates during drag; use motion values, refs, or a dedicated animation loop.
- Use passive pointer tracking where possible.
- Pause animation when the tab is hidden.
- Respect low-power mobile devices by disabling reflection blur and complex perspective.
- The first meaningful Home content should not wait for all decorative assets.

## 12. Interaction acceptance tests

- Boot can be entered entirely by keyboard.
- App Switcher has a visible pointer entry control even when `Meta+Tab` is intercepted.
- Left/right controls move exactly one app.
- `Enter` opens only the selected app.
- `Escape` restores the previous state and focus.
- `Escape` closes an active app window as well as the App Switcher.
- Rapid repeated input never leaves the reel between items.
- Background links cannot be activated while the switcher is open.
- Reduced motion removes large spatial movement.
- Reduced motion disables pointer-driven reel tilt and reflection parallax.
- Screen reader output includes overlay name, selected app, and position.
- Touch drag does not block vertical page scroll outside the reel.
