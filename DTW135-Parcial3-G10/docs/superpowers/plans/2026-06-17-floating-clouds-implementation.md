# Floating Background Clouds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 2 pixel-art NES-style clouds per level screen (10 total across the 5 levels) that drift slowly left-to-right in an infinite loop behind the dialog/content, using a single reusable SVG `<symbol>` and 2 reusable CSS classes for depth (size/speed) variation.

**Architecture:** One `<symbol id="cloud-a">` defined once as a sibling of the already-existing `#hero-idle` symbol in `index.html`. Each of the 5 `<section class="level-screen">` gets 2 identical `<svg class="cloud-sprite cloud-far"><use href="#cloud-a"></use></svg>` / `cloud-near` lines inserted right after its opening tag. Two new CSS classes plus one `@keyframes` are appended to `css/styles.css`. No JavaScript, no new files, no behavior change.

**Tech Stack:** HTML5 (inline SVG `<symbol>`/`<use>`), CSS3 (`@keyframes`, absolute positioning). Same stack as the rest of the project — no new dependencies.

## Global Constraints

- Vanilla HTML5/CSS3 only — no frameworks, no JS changes, no new files (per CLAUDE.md project-wide restriction, still binding).
- Purely visual: `gameState`, `completeLevel`, `goToNextLevel`, and every `js/*.js` file are untouched and must still work exactly as before.
- The cloud shape is a SINGLE `<symbol id="cloud-a">` defined ONCE — never duplicate its 10 `<rect>` elements per level.
- Exact approved values (from `docs/superpowers/specs/2026-06-17-floating-clouds-design.md`): `.cloud-far` is `90px × 34px`, `top: 60px`, `animation: cloudDrift 42s linear infinite`; `.cloud-near` is `150px × 56px`, `top: 115px`, `animation: cloudDrift 24s linear infinite`; `@keyframes cloudDrift` goes from `left: -20%` to `left: 120%`, linear (no easing/steps).
- `.cloud-sprite` must NOT set a `z-index` — it relies on default stacking order (auto) to render behind `.level-screen::after` (scanlines, `z-index: 10`) and `.screen-body` (`z-index: 20`), both already defined and must not be touched.
- No automated test framework exists in this project (static vanilla-JS browser app, verified manually/visually) — this plan's task uses manual browser verification instead of unit tests, consistent with every prior task in this codebase.

---

## Task 1: Cloud symbol, per-level markup, and CSS

**Files:**
- Modify: `index.html:38` (insert `<symbol id="cloud-a">` right after the existing `</symbol>` that closes `#hero-idle`, still inside the same `<svg style="display:none">` wrapper) and the opening line of each of the 5 `<section id="level-N" class="level-screen"...>` elements (lines 58, 79, 95, 119, 151)
- Modify: `css/styles.css` (append `.cloud-sprite`, `.cloud-far`, `.cloud-near`, `@keyframes cloudDrift` after the last existing rule, `.victory-score` on line 355)

**Interfaces:**
- Consumes: nothing — no JS, no DOM IDs from other files.
- Produces: nothing other files depend on — this is a leaf visual change. The `#cloud-a` symbol ID and `.cloud-sprite`/`.cloud-far`/`.cloud-near` classes are only referenced within these two files.

- [ ] **Step 1: Add the `cloud-a` symbol right after the `hero-idle` symbol in index.html**

`index.html` currently has this (the `#hero-idle` symbol followed by the closing `</svg>`):

```html
      <rect x="2" y="16" width="5" height="2" fill="#5C3A21"/>
      <rect x="9" y="16" width="5" height="2" fill="#5C3A21"/>
    </symbol>
  </svg>
```

Replace it with (adds the new `<symbol>` as a sibling, before the wrapper's closing `</svg>`):

```html
      <rect x="2" y="16" width="5" height="2" fill="#5C3A21"/>
      <rect x="9" y="16" width="5" height="2" fill="#5C3A21"/>
    </symbol>
    <symbol id="cloud-a" viewBox="0 0 24 9">
      <rect x="6" y="0" width="4" height="1" fill="#fff"/>
      <rect x="15" y="0" width="4" height="1" fill="#fff"/>
      <rect x="4" y="1" width="8" height="1" fill="#fff"/>
      <rect x="13" y="1" width="7" height="1" fill="#fff"/>
      <rect x="2" y="2" width="20" height="1" fill="#fff"/>
      <rect x="1" y="3" width="22" height="1" fill="#fff"/>
      <rect x="0" y="4" width="24" height="1" fill="#fff"/>
      <rect x="0" y="5" width="24" height="1" fill="#fff"/>
      <rect x="1" y="6" width="22" height="1" fill="#fff"/>
      <rect x="3" y="7" width="18" height="1" fill="#C9DDF5"/>
    </symbol>
  </svg>
```

- [ ] **Step 2: Insert the 2 cloud elements into each of the 5 level sections**

Each level's `<section>` opening tag is unique text (some have `style="display:none"`, level 1 doesn't), so each replacement below is a safe, unambiguous find-replace. Insert the 2 cloud lines immediately after the section's opening tag, before `<div class="screen-body">`.

Level 1 — replace:
```html
  <section id="level-1" class="level-screen">
    <div class="screen-body">
```
with:
```html
  <section id="level-1" class="level-screen">
    <svg class="cloud-sprite cloud-far"><use href="#cloud-a"></use></svg>
    <svg class="cloud-sprite cloud-near"><use href="#cloud-a"></use></svg>
    <div class="screen-body">
```

Level 2 — replace:
```html
  <section id="level-2" class="level-screen" style="display:none">
    <div class="screen-body">
```
with:
```html
  <section id="level-2" class="level-screen" style="display:none">
    <svg class="cloud-sprite cloud-far"><use href="#cloud-a"></use></svg>
    <svg class="cloud-sprite cloud-near"><use href="#cloud-a"></use></svg>
    <div class="screen-body">
```

Level 3 — replace:
```html
  <section id="level-3" class="level-screen" style="display:none">
    <div class="screen-body">
```
with:
```html
  <section id="level-3" class="level-screen" style="display:none">
    <svg class="cloud-sprite cloud-far"><use href="#cloud-a"></use></svg>
    <svg class="cloud-sprite cloud-near"><use href="#cloud-a"></use></svg>
    <div class="screen-body">
```

Level 4 — replace:
```html
  <section id="level-4" class="level-screen" style="display:none">
    <div class="screen-body">
```
with:
```html
  <section id="level-4" class="level-screen" style="display:none">
    <svg class="cloud-sprite cloud-far"><use href="#cloud-a"></use></svg>
    <svg class="cloud-sprite cloud-near"><use href="#cloud-a"></use></svg>
    <div class="screen-body">
```

Level 5 — replace:
```html
  <section id="level-5" class="level-screen" style="display:none">
    <div class="screen-body">
```
with:
```html
  <section id="level-5" class="level-screen" style="display:none">
    <svg class="cloud-sprite cloud-far"><use href="#cloud-a"></use></svg>
    <svg class="cloud-sprite cloud-near"><use href="#cloud-a"></use></svg>
    <div class="screen-body">
```

- [ ] **Step 3: Append the cloud CSS to css/styles.css**

`css/styles.css` currently ends with this rule:

```css
.victory-score { font-size: 16px; color: #FBD000; margin-bottom: 24px; }
```

Append (after that line, at the end of the file):

```css

/* ── FLOATING CLOUDS ── */
.cloud-sprite {
  position: absolute;
  shape-rendering: crispEdges;
  pointer-events: none;
}
.cloud-far {
  top: 60px;
  width: 90px;
  height: 34px;
  animation: cloudDrift 42s linear infinite;
}
.cloud-near {
  top: 115px;
  width: 150px;
  height: 56px;
  animation: cloudDrift 24s linear infinite;
}
@keyframes cloudDrift {
  0%   { left: -20%; }
  100% { left: 120%; }
}
```

- [ ] **Step 4: Verify in browser**

Since this project has no automated test suite, verify manually (same convention as every other task in this codebase):

1. Open `http://localhost/dtw135/DTW135-Parcial3-G10/` (start XAMPP's Apache first if it isn't running).
2. Level 1 should show 2 white pixel-art clouds (one smaller near the top, one larger lower down) drifting slowly left-to-right, looping continuously.
3. Open the browser console and run `goToLevel(2)`, `goToLevel(3)`, `goToLevel(4)`, `goToLevel(5)` — confirm the same 2 clouds appear identically in all 5 levels.
4. Confirm the clouds render BEHIND the dialog box, the hero sprite, the alerts, buttons, canvas/video, and progress bars/stat cards — never on top of or interfering with any of them, and that clicking buttons still works normally where a cloud visually overlaps that area.
5. Watch a level for at least 45 seconds (covers a full loop of the slower 42s cloud) to confirm the loop is seamless — the cloud should disappear off the right edge and reappear from the left, not jump or flicker.
6. Check the browser console for errors — there should be none (a missing `#cloud-a` reference would show an empty/invisible cloud, not a console error, so also visually confirm both clouds render, not blank space).
7. Confirm no other visual regression: HUD, hero sprite animation, buttons, canvas, video, progress bars, stat cards all still look and behave as before (this change touches none of their CSS rules).

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: add floating background clouds to all 5 level screens"
```
