# Sri Sushmita — Portfolio Clone

A faithful, responsive clone of [spydyy-portfolio.vercel.app](https://spydyy-portfolio.vercel.app/) — a
Spider-Man-themed single-page portfolio for **Sri Sushmita**, full-stack engineer and AI/ML
undergraduate — rebuilt as an editable React + Vite source project.

The reference site was reverse-engineered from its production bundle (`/assets/index-*.js` +
`/assets/index-*.css`), so the component tree, Tailwind utility set, GSAP timelines and copy are
reproduced exactly rather than approximated.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Animation | GSAP 3.15 + ScrollTrigger, AOS |
| Fonts | Outfit (300–700) + JetBrains Mono (300–500), loaded with `preconnect` |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # -> dist/
npm run preview  # serve the production build
```

## Project layout

```
index.html               app shell (meta, fonts, title)
vite.config.js           react + tailwindcss plugins
src/
  main.jsx               React root
  App.jsx                Navbar > Hero > About > Skills > Projects > Contact
  index.css              Tailwind entry, @theme fonts, keyframes, scrollbar, reduced-motion
  components/
    Navbar.jsx           scroll-aware fixed nav + mobile drawer
    Hero.jsx             hero + cursor spotlight mask + dual scrolling marquee
    About.jsx            about section, hanging webs, tech-stack pills
    Skills.jsx           10-item skill matrix
    Projects.jsx         4 project cards
    Contact.jsx          contact form with success state
public/
  assets/                7 images — 6 from the reference site; web.png is the owner-supplied
                         artwork swap (original preserved at _site/web-original.png)
  favicon.svg
  sde_resume.pdf         placeholder resume (the original's link 404s)
scripts/
  shoot.mjs              Playwright capture of original vs clone
  compare.mjs            pixelmatch + scanline-profile diff between the two
  dom-diff.mjs           field-level DOM/geometry diff between the two
  frozen-diff.mjs        pixel-diff with all animations frozen (the decisive test)
  marquee-diff.mjs       marquee track measurement (group count, widths)
  banddiff.mjs           locates which scanline bands differ
  rowdiff.mjs            locates which scanline bands differ
  interact.mjs           interaction test suite
  make-resume-pdf.mjs    regenerates the placeholder resume PDF
  upstream-check.mjs     compares the live original's bundle + assets with the archived snapshot
  probe.mjs              dumps animated computed state on both pages (opacity/geometry/images)
  hero-clip.mjs          zoomed top-left hero crops + web <img> geometry on both pages
  make-fruit-icon.mjs    rebuilds public/assets/web.png from the archived `_site/fruit-source.png`
                         (the owner-supplied devil-fruit artwork currently shipped as web.png)
  hpreview.mjs           quick hero/marquee screenshots of the running clone
_site/                   raw mirror of the original production build (reference only)
```

## Sections

- **Hero** — two-image reveal: a cursor-following radial mask uncovers the portrait behind the
  Spider-Man mask.
- **Marquee** — dual tilted red/black bands that slow down on hover.
- **About** — hanging web decorations, animated headline and copy, tech-stack pills, and a
  free-hanging profile photo.
- **Skills** — ten skill cards with reveal-on-scroll, hover fills, a rotating background web, and
  a hanging Spider-Man.
- **Projects** — four project cards in a responsive grid, with a standing Spider-Man and a corner
  web.
- **Contact** — form with an inline success state and a hanging Spider-Man.
- **Navbar** — transparent at the top, solid black on scroll, with a working mobile drawer.

## Fidelity

Verified against the live original with Playwright:

- **Pixel-identical (with the original artwork).** With every time-driven animation frozen to the
  same state in both pages, the clone and the original render the same — a controlled diff captures
  **0.00% of pixels on all 13 frames** (6 desktop + 7 mobile, scrolled the full height of the
  page). This is the decisive check: it proves the rendered layout, typography, colour and imagery
  are identical, and that an unfrozen diff never reaches 0 only because of the
  looping animations' phase.
- **Deliberate divergence: the `web.png` icon.** The swirl-pattern web graphic has been replaced
  with the devil-fruit artwork supplied by the portfolio owner (trimmed and composited to 70%
  fill of a transparent 500×500 square by `scripts/make-fruit-icon.mjs`). Only the frames where
  that file renders differ: hero **10.1%** (desktop) / **6.7%** (mobile) and marquee **1.5%** /
  **1.5%**; **every other frame is 0.00%** — the faint decorations that reuse the same file sit
  at 4–12% opacity with `mix-blend-multiply` and stay under the diff threshold. No opacity or
  position was changed for the swap. The original web graphic is preserved at
  `_site/web-original.png`; copying it back over `public/assets/web.png` (and rebuilding)
  restores the reference rendering at 0.00% across all 13 frames.
- **DOM identical** — a field-level diff of every element (tag, class, offset box, computed
  styles, text content) pairs all 300 original nodes with clone nodes. The only differences are
  the deliberate ones listed below, plus the `box-shadow` of `.glow-frame`, which is animated
  continuously and therefore always mid-pulse.
- **Page geometry identical** — desktop `scrollHeight` 4049px, mobile 5433px, matching exactly,
  with identical scroll offsets at every capture step.
- **CSS utility set identical** — the built stylesheet differs from the original's by two rules
  (`.googleapis` and its hash fragment — the Google-Fonts `@import`, which moved to an
  `index.html` `<link>` with `preconnect` so it no longer blocks render) plus nine utilities used
  only by the mobile drawer.
- **No console errors** on either site, desktop or mobile.
- **Font weights 300–700 only.** The original never loads the 800/900 Outfit faces, so its
  `font-black` headings actually render at 700. Adding 900 here would visibly diverge from the
  reference, so it is deliberately omitted.

### Deliberate improvements over the original

These fix outright bugs in the reference implementation without changing its appearance:

- The **About** section now carries `id="about"`; the nav link was previously dead.
- The **mobile menu button** opens a real drawer (the original's is inert). Escape closes it.
- **"Explore Projects"** scrolls to `#projects` instead of doing nothing.
- The success badge renders **✓**; the original renders a stray newline character.
- Form inputs have `id`s so their labels are properly associated.
- Anchored sections get `scroll-margin-top`, so the fixed navbar no longer covers them.
- `prefers-reduced-motion` is respected, and the scroll listener is passive.
- `/sde_resume.pdf` resolves to a real placeholder PDF; the original's link 404s.

### Faithfully reproduced quirks

- The reference has **no footer** — the page ends with the contact section.
- The reference **initialises AOS but uses no `data-aos` attributes**, so it is functionally inert.
  It is kept only for bundle parity.
- The hero's top layer is masked with a radial-gradient spotlight that follows the cursor; on
  mouse-enter the mask punches a 700px hole, on leave it closes back to 50px.
- The marquee track contains **two** copies of the five-item sequence (the reference source uses
  `[...[,,]]`, a sparse array of length 2). Each band then scrolls `x: -50%` over 15s / 20s and
  slows to `timeScale: 0.1` on hover.
- `<main>` wraps only the hero and marquee sections, and its `overflow-hidden` clips the rotated
  `w-[110vw]` marquee bands — matching the original exactly.

## Verification

```bash
npm run build
npx vite preview --port 4173 --strictPort   # in one shell
npm run shots                                # in another
npm run diff
npm run verify:dom
npm run verify:pixels
npm run verify:interact
```

`compare.mjs` writes per-frame diff images to `screenshots/diff-*.png` and reports both the raw
pixel-delta percentage and a scanline luminance profile delta. The profile metric ignores the
intentionally drifting decorations (marquee, rotating webs, glow pulse) and so isolates real
layout drift.

`dom-diff.mjs` is the stronger structural check: it compares every element's tag, class, layout
box, computed styles and text, so it is immune to animation phase.

`frozen-diff.mjs` is the decisive one: it injects the same freeze stylesheet into both pages and
pixel-diffs them. With the original web graphic in place expect `0` for every frame; with the
owner-supplied fruit icon in place (70% fill) expect the documented icon frames (hero ~10.1/6.7%,
marquee ~1.5%) and `0` everywhere else. It also waits for every image to finish decoding and
settles 4s per frame, so no scroll-triggered reveal animation is ever mid-flight when a shot is
taken.

`interact.mjs` exercises the behaviour a pixel diff cannot: nav anchors, the CTA scroll, the
contact form's success state and auto-reset, the resume download, the hero spotlight mask and the
mobile drawer (open / Escape / navigate-away). All 16 checks pass.

Playwright's Chromium browser is required: `npx playwright install chromium`.

## Credits

Original site: [spydyy-portfolio.vercel.app](https://spydyy-portfolio.vercel.app/) — Sri Sushmita.
All imagery, copy and design belong to the original author. This repository exists purely as a
local reproduction for study and development; replace the content and images with your own before
publishing publicly.
