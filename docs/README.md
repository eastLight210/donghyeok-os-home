# DonghyeokOS design documentation

This directory is the implementation handoff for the personal home site currently referred to as **DonghyeokOS**.

The intended experience is a warm, cream-colored personal desktop on the web. It begins at a physical desk, enters through a monitor, and becomes a macOS-inspired environment for Donghyeok's public writing and work. The operating-system metaphor is an interaction model, not a literal macOS clone.

## Status

- Design status: direction approved on 2026-07-19; design-review round 1 decisions recorded on 2026-07-19 (items 10-18 below)
- Implementation status: not started
- Repository status when these documents were written: empty directory, no Git repository, no framework selected
- Primary design file: [DonghyeokOS - Personal Home](https://www.figma.com/design/e7BKkfzaGEZqis4pRkkGOy)
- Canonical comparison screen: [App Switcher Study](https://www.figma.com/design/e7BKkfzaGEZqis4pRkkGOy?node-id=26-97)
- Existing Home screen: [DonghyeokOS Home](https://www.figma.com/design/e7BKkfzaGEZqis4pRkkGOy?node-id=12-12)
- Full core flow: [Screens & Flow board](https://www.figma.com/design/e7BKkfzaGEZqis4pRkkGOy?node-id=12-2)

## Final direction

The following decisions are approved and should be treated as the current source of truth:

1. Keep the existing Home desktop.
2. Keep the compact Liquid Glass Dock in its resting state.
3. Use the continuous cylinder as an **App Switcher that expands from the Dock**.
4. Do not use the cylinder as the permanent Dock.
5. Do not use the cylinder as a Projects-only browser.
6. Projects should eventually open as a readable window or Finder-like gallery.
7. The cylinder appears only after the visitor has entered DonghyeokOS; it must not appear on the login screen.
8. The login is a theatrical entrance, not authentication. Do not add a fake password field.
9. Blog is public. Finance is private and must not be linked, rendered, prefetched, or exposed in public application data.
10. The App Switcher opens from a launcher-style control in the Dock (Launchpad-like grid icon). The Dock's power control remains as a separate system control that returns to the login screen. `CMD TAB` cannot be captured by browsers and must not be advertised in helper copy.
11. Home is not an app. It has no Dock item and no App Switcher entry; the desktop itself is the Home state and closing the switcher returns to it. The public app list is Blog, Projects, Now, Contact.
12. Dock items have no active-state indicator dots.
13. Projects uses the ink tone everywhere, including its reel face (the study's blue center face is superseded).
14. The selected reel face is title-only; the code preview card in the study is superseded.
15. White editorial text on the reel's tonal faces is an accepted, deliberate contrast exception.
16. macOS-flavored chrome (traffic lights, glass, Dock) is embraced. Do not use Apple's proprietary assets: SF fonts, SF Symbols, system wallpapers, or logos.
17. The login account name may type and erase in a looping typewriter animation with a caret. It is theater, not an input: no editable field, static name under reduced motion, stable accessible name.
18. The entry progress bar must reflect real loading only; if nothing is loading, shorten the transition instead.
19. Blog opens inside the same DonghyeokOS app-window system as Projects, Now, and Contact; links inside that window may open the public Blog destination.
20. App windows use the red traffic light to close and the green traffic light to maximize or restore. A maximized window covers the full browser viewport.
21. Reel faces use a cohesive set of generated editorial photographs beneath their pastel app tones. These images are decorative, contain no people, readable text, logos, or brands, and share one film-and-glass treatment.
22. The site icon is a cream rounded tile with a dark serif `d` and a small orange status dot, exported as deterministic raster assets for browser tabs and home-screen shortcuts.
23. The decorative `SWITCH` word behind the App Switcher reel is removed; no background lettering should peek around the reel at any viewport size.
24. `Escape` closes every open app window using the same action as its red traffic light; window chrome includes a restrained `ESC CLOSE` hint.
25. On precise-pointer devices, the reel tilts subtly toward the pointer while its reflection and floor shadow shift in response. The effect resets on pointer exit and is disabled under reduced motion.

The Figma screen named `Project Cylinder` is retained only as historical exploration. It is deprecated for implementation.

## Reading order

1. [Product and experience spec](design/01-product-and-experience-spec.md)
2. [Visual system](design/02-visual-system.md)
3. [Motion and interaction](design/03-motion-and-interaction.md)
4. [Implementation handoff](design/04-implementation-handoff.md)

## Source-of-truth hierarchy

When two sources disagree, use this order:

1. Explicit decisions in this directory
2. The `App Switcher Study` and `DonghyeokOS Home` Figma frames
3. Other Figma pages, including Foundations and Components
4. Earlier exploratory images or chat descriptions

Do not use the deprecated `Project Cylinder` frame to override the approved App Switcher direction.

## Figma node map

| Purpose | Node ID |
| --- | --- |
| Core flow board | `12:2` |
| Login | `12:6` |
| Monitor entry transition | `12:9` |
| Home | `12:12` |
| Deprecated Project Cylinder | `12:15` |
| Approved App Switcher study | `26:97` |
| Motion and accessibility spec | `18:2` |
| Foundations | `3:48` |
| Components overview | `6:2` |
| Window component set | `7:18` |
| Dock Item component set | `8:34` |
| Menu Bar component | `9:2` |
| Deprecated Cylinder Panel component set | `10:26` |
| Login Account component | `11:2` |

Figma node IDs are stable references for inspection. Implementation should follow the approved screen behavior, not reproduce every exploratory component merely because it exists in the file.

## Non-goals for the first implementation

- Real authentication or account management
- Public Finance navigation or Finance metadata
- A full browser-window manager with arbitrary dragging, resizing, or z-index persistence
- Use of Apple's proprietary assets (SF fonts, SF Symbols, system wallpapers, logos); the macOS look itself is welcome
- Reuse of source code or assets from aikawakenichi.com
- Dark mode
- WebGL as a requirement
- Mobile parity with the desktop composition

## Quick start for the next agent

Before scaffolding code:

1. Read all four design documents.
2. Inspect the approved Figma Home and App Switcher frames.
3. Confirm the implementation stack with the user if the repository is still empty.
4. Preserve the public/private boundary before creating app navigation data.
5. Build a static Home state before attempting the boot transition or cylinder motion.
6. Make keyboard and reduced-motion behavior part of the architecture, not a cleanup task.

The recommended default stack is recorded in the implementation handoff, but it is not an approved dependency decision until the user confirms it.
