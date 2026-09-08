# Minimal Home — design QA

final result: passed

## Source and evidence

- Source visual truth: `docs/design/references/minimal-home.png`, the single user-selected generated image.
- Implementation: `http://localhost:5173/` in the Codex in-app browser.
- Final desktop capture: `docs/design/qa/minimal-home/desktop-final.png`.
- Source and final desktop: both 1536 × 1024 pixels; browser CSS viewport 1536 × 1024, devicePixelRatio 1. No density normalization required.
- State: Home, Projects selected, no panel, ordinary motion preference, white theme.
- Additional evidence: `mobile.png` (390 × 844), `mobile-projects.png` (390 × 844), `narrow-mobile.png` (320 × 740), `fallback.png` (320 × 740), all under `docs/design/qa/minimal-home/`.
- Final source and desktop screenshot were opened together in the same comparison tool response. Labels, controls, and small text are readable at this resolution, so a separate region crop was unnecessary.

## Findings and comparison history

1. Initial browser review: [P2] neighboring labels were centered at ninety degrees and disappeared around the silhouette. Moved live text toward the visible arc while keeping the continuous cylinder geometry. The corrected desktop evidence shows Blog and Now fully readable.
2. Initial browser review: [P2] the footer was below the reference viewport, and the central title was too small. Reduced stage whitespace and footer spacing, increased title texture size. `desktop.png` records the corrected composition before the final shadow adjustment.
3. Narrow mobile review: [P2] Contact wrapped alone beside the wordmark at 320px. Added a separate full-width navigation row at 360px and below. `narrow-mobile.png` records all four destinations on that row.
4. Final polish: added a subdued drop shadow to match the reference's grounding. `desktop-final.png` was recaptured after reload and verified at 1536 × 1024 with no horizontal overflow. A transient stale compositor capture after viewport switching was overwritten, not used as evidence.
5. Final paired comparison: no remaining actionable P0/P1/P2 differences. The same introduction, continuous band, initial selection, arrows, CTA, and footer hierarchy are present. P3: the physically generated rim and material remain flatter than the photographic mock, with small differences in curvature, side-label perspective, and title width. These do not obscure selection or change the layout hierarchy.

## Required fidelity surfaces

- Typography: locally available Arial/grotesk sans, regular weights, two-line heading, black title, gray secondary text. No remote font loading. Reference central title is slightly wider; accepted P3 above.
- Spacing/layout: aligned header, introduction at approximately 7.4% inset, centered reel and controls, substantial white space, quiet footer within desktop viewport. Mobile retains readable content and page scrolling.
- Colors/tokens: pure white background, near-black text, neutral gray copy, four grayscale reel surfaces. Values reside in `src/styles/tokens.css`. No cream, pastel, photos, glass, or reflections in the live home.
- Asset fidelity: the reel is an interactive reuse of the project's existing Three.js cylinder geometry, with live text labels. It is not a rasterized mockup. The source contains no other photographic assets to generate. Context-loss fallback intentionally simplifies to a semantic text surface.
- Copy/content: introduction and primary Project description/CTA match the selected concept. Other descriptions and content come from the existing public records. A small keyboard/drag hint is intentionally added for discoverability. Existing Now information is still explicitly marked July 2026, not presented as newly researched biography.

## Interaction checks

- Initial home appears directly with Projects selected.
- Mouse drag rotates to Now without accidentally opening content; previous control returns to Projects.
- Next/previous, wrapping, keyboard ArrowRight and Enter verified. Native button also supports Space.
- Blog, Projects, Now, and Contact panels render their existing content and configured links.
- Native modal semantics remove background from the accessibility tree. Heading receives initial focus; Tab reaches content links; Escape closes and focus returns to the opener.
- Back reopens the previous panel; Forward returns to Home. Direct query URLs are covered by the UI suite.
- Mobile at 390px and 320px checked; long Projects content scrolls inside its panel. Vertical gestures are not captured by the reel; drag cancellation is covered in the UI suite.
- Reduced motion emulated through CDP: arrow selection and Enter opening work. Emulation was reset afterward.
- Forced WebGL context loss through CDP: fallback displayed; next selection and Contact opening remained functional. Reload restored normal rendering afterward.
- Browser console: no app errors. Motion emitted one expected development warning during reduced-motion emulation.

## Automated validation

- `npm test`: 10 passed (state, public content contract, UI behavior).
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed.
- `npm run build`: passed. Existing Three.js chunk-size and Vinext route-classification notices remain advisory.
- `git diff --check`: passed.

## Follow-up polish / limits

- P3: optional further refinement of cylinder material shading and curved title treatment.
- Chromium browser verified; actual Safari and Firefox were not run.
- Social image updated to the verified rendered homepage. Existing favicon identity retained.
- Local implementation only; no commit, push, or production deployment in this task.

## Follow-up: physical reel material

User feedback supersedes the earlier acceptance of flatter material. Replaced unlit faces with MeshPhysicalMaterial lit by a PMREM studio environment; introduced rounded upper/lower edge geometry, an illuminated inner shell, and curved text geometry instead of tangent planes. Strengthened the soft grounding shadow and allowed 16px extra control clearance.

Verified rendered Projects at 1536 × 1024 in `docs/design/qa/minimal-home/material-desktop.png`, mobile at 390 × 844 in `material-mobile.png`, and drag rotation into Now. The greater opening depth, broad surface highlights, and visible rim resolve the earlier flatness note. Surrounding monochrome typography/content are unchanged. Browser error log is empty. Tests (10), TypeScript, lint, and production build pass. Social image refreshed from the new desktop capture.

final result: passed

## Follow-up: title/panel synchronization

Removed camera-relative title angle clamping, angle-dependent scale, and explicit visibility thresholds. Curved title geometry is built once and attached to the same rotating group as the panels. Browser inspection of a held partial drag (`docs/design/qa/minimal-home/attached-labels-drag.png`), completion into Now, and reverse rotation confirmed that labels stay on their own panels. Neighboring titles now naturally disappear around the silhouette. Browser console had no errors. Unit tests (10), TypeScript and lint passed.

## Follow-up: pointer play

Added bounded mouse hover pitch/roll and stronger vertical pulling, with damped return. The entire physical assembly tilts as one unit. Corrected the projected-height calculation after a held downward pull exposed clipping; `docs/design/qa/minimal-home/pull-down.png` records the corrected complete silhouette. The assembly scales down within its existing slot only when required by tilt. Browser verified held pull, release without opening content, return to rest, horizontal drag into Now, and reduced-motion stillness. No browser errors. Tests now 11 passing, including vertical mouse pull, cancellation on blur and subsequent normal click. TypeScript, lint and build passed. Mobile vertical intent remains covered by the existing gesture test.

## Follow-up: blog loading verification — September 8

Verified Blog loading behavior on desktop (1536 × 1024) and mobile (390 × 844) viewports:

- Same-origin proxy: `/api/blog-feed` proxies upstream with `cache-control: no-store` without server-side caching.
- Intent prefetch & request deduplication: prefetching is triggered on Blog reel selection, pointer hover, and keyboard focus. Holding the same-origin response using real RSS payload verified that closing and reopening while a request was pending reused the single in-flight request.
- Memory caching & freshness: feed data is cached in browser memory across modal close/reopen cycles during the active session (60s freshness). Reopening with cached data renders immediately with no skeleton.
- Background refresh resilience: quiet background refresh runs when stale or on focus; a simulated failed background refresh preserved both readable posts without rendering an error status.
- Navigation & focus restoration: direct `/?app=blog` URL, keyboard selection and Enter, navigation focus prefetch, Back/Forward history transitions, and Escape modal close with opener focus restoration all passed.
- Mobile & accessibility: verified on 390 × 844 with no horizontal modal overflow. Reduced-motion mode displays the static accessible skeleton (`role="status"`, `aria-label="Loading latest posts"`).
- Layout shift honesty: cold loading does not guarantee zero layout shift because the static skeleton renders 3 estimated rows whereas the live feed currently has 2 posts, and title wrapping varies across viewports.
- Visual inspection: reviewed temporary local captures (`/tmp/blog-loading-desktop-cold.png`, `/tmp/blog-loading-desktop-ready.png`, `/tmp/blog-loading-mobile-cold.png`, `/tmp/blog-loading-mobile-ready.png`), confirming cold skeleton and populated post states on desktop and mobile without retaining permanent screenshot artifacts.
- Automated validation: 25 tests, TypeScript, and lint passed. Final production build succeeded with Vite >500kB chunk advisory and Vinext unknown route-classification notice. Local verification only; no deployment.
