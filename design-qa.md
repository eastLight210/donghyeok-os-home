# App Switcher reel design QA

- Source visual truth: `/private/tmp/donghyeokos-design-qa/source-aikawa-desktop.png`
- Source mobile truth: `/private/tmp/donghyeokos-design-qa/source-aikawa-mobile.png`
- Implementation desktop: `/private/tmp/donghyeokos-design-qa/implementation-final-desktop.png`
- Implementation mobile: `/private/tmp/donghyeokos-design-qa/implementation-final-mobile.png`
- Full-view comparison: `/private/tmp/donghyeokos-design-qa/comparison-desktop-final.png`
- Focused reel/control comparison: `/private/tmp/donghyeokos-design-qa/comparison-focused-final.png`
- Mobile comparison: `/private/tmp/donghyeokos-design-qa/comparison-mobile-final.png`
- Viewports: desktop `1280 × 720`; mobile `390 × 844`
- State: App Switcher open with one centered face. Source and implementation use different content and color because DonghyeokOS retains its own typed public-app data and approved tone tokens.

## Full-view comparison evidence

The revised reel preserves the source composition's shallow cylindrical top and bottom arcs, broad centered face, narrow neighboring edges, mirrored floor reflection, and bottom-centered glass controller. DonghyeokOS intentionally retains its cream desktop, `SWITCH` word, menu bar, app colors, and required `OPEN` action.

## Focused comparison evidence

- Typography: DM Serif remains the product display face. The selected title now uses transparent gradient fill, a restrained light stroke, internal highlight, and low-opacity shadow to approach the source's refractive glass lettering without copying its licensed font or WebGL material.
- Spacing and geometry: the center face occupies about 96% of the reel aperture on desktop, leaving only edge slivers. The outer border supplies the cylinder arc; the earlier interior ellipse lines were removed.
- Color and material: app tone tokens remain authoritative. Bounded highlight, edge shading, and screen-blend layers add depth without introducing new saturated colors.
- Reflection: a second non-interactive track mirrors the actual selected tone and title, follows selection and drag offsets, and fades through a vertical mask. It is disabled from interaction and remains decorative.
- Controls: the controller uses a dark translucent fill, bounded blur/saturation, top and side highlights, inset shadows, and nested glass arrow pills. Essential text and accessible button names retain stable contrast.
- Copy and content: no source copy, images, or portfolio content are used. DonghyeokOS labels and app data remain unchanged.

## Interaction and accessibility evidence

- Previous/next controls move one app and update the controller tone and title.
- Pointer drag changed the selected app from `Now` to `Contact` and the mirrored track followed the same drag offset.
- The listbox keeps one unique `aria-selected` option; reflection is `aria-hidden`.
- Reduced-motion behavior and vertical touch scrolling remain intact.
- Browser console errors checked: none observed during the switcher interaction pass.

## Comparison history

1. Pass 1 found two P2 differences: neighboring faces were too wide, and decorative ellipse borders crossed the front face instead of staying on the cylinder edge.
2. The reel track was widened from an 82% to a 96% center-face aperture, side shading was narrowed, and the interior rim elements were removed.
3. Pass 2 confirmed that only narrow neighboring edges remain, the outer silhouette provides the correct curvature, and the selected title/reflection/controller stay synchronized through arrow and drag changes.

## Follow-up polish

- P3: the source uses photographic WebGL textures and a distortion filter. DonghyeokOS intentionally uses semantic app tones and a CSS/DOM reel, so its refraction is quieter and more editorial.
- P3: the controller is wider than the source because DonghyeokOS keeps an explicit `OPEN` action required by its interaction contract.

final result: passed
