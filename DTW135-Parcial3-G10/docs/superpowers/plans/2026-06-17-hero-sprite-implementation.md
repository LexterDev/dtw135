# Hero Sprite Portrait Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static emoji portrait (📡🗺📷⚙⚡) in each of the 5 level dialog boxes with a single reusable SVG pixel-art hero sprite that idles with a 2-frame NES-style animation.

**Architecture:** One `<symbol id="hero-idle">` defined once (hidden) right after `<body>` in `index.html`, referenced via `<svg class="hero-sprite"><use href="#hero-idle"></use></svg>` in all 5 `.portrait` divs. Two existing CSS rules are resized and one new rule + one new `@keyframes` are added in `css/styles.css`. No JavaScript, no new files, no behavior change.

**Tech Stack:** HTML5 (inline SVG `<symbol>`/`<use>`), CSS3 (`@keyframes`, `shape-rendering: crispEdges`). Same stack as the rest of the project — no new dependencies.

## Global Constraints

- Vanilla HTML5/CSS3 only — no frameworks, no JS changes, no new files (per CLAUDE.md project-wide restriction, still binding).
- This is a purely visual change: `gameState`, `completeLevel`, `goToNextLevel`, and every `js/*.js` file are untouched and must still work exactly as before.
- The sprite is defined ONCE as a `<symbol>` and reused 5× via `<use>` — never duplicate the 23 `<rect>` elements into each level section.
- Exact approved values (from `docs/superpowers/specs/2026-06-17-hero-sprite-design.md`): portrait box `60px × 60px`; inner sprite `46px × 52px`; dialog `padding-left: 70px`; idle animation is a 2-frame snap (`steps(1)`, `0.6s`, `infinite`, translateY 0 ↔ -4px) — no smooth easing.
- No automated test framework exists in this project (static vanilla-JS browser app, verified manually/visually) — this plan's tasks use manual browser verification instead of unit tests, consistent with every prior task in `docs/superpowers/plans/2026-06-17-escape-room-implementation.md`.

---

## Task 1: Hero sprite symbol, portrait markup, and CSS resize

**Files:**
- Modify: `index.html:11-14` (insert hidden symbol block) and 5 occurrences of `<div class="portrait">...</div>` at lines 34, 55, 71, 95, 127
- Modify: `css/styles.css:72` (dialog padding), `css/styles.css:79-89` (`.nes-dialog .portrait` block), and append new `.hero-sprite` rule + `@keyframes idleBob`

**Interfaces:**
- Consumes: nothing — no JS, no DOM IDs from other files.
- Produces: nothing other files depend on — this is a leaf visual change. The `#hero-idle` symbol ID and `.hero-sprite` class are only referenced within these two files.

- [ ] **Step 1: Insert the hidden hero sprite symbol into index.html**

In `index.html`, the file currently opens the body like this:

```html
<body>

  <!-- HUD fijo en la parte superior -->
  <div id="hud" class="nes-hud">
```

Replace that opening (just those 4 lines, keep everything after `<div id="hud"...` unchanged) with:

```html
<body>

  <svg style="display:none" aria-hidden="true">
    <symbol id="hero-idle" viewBox="0 0 16 18">
      <rect x="6" y="0" width="4" height="1" fill="#E52521"/>
      <rect x="4" y="1" width="8" height="1" fill="#E52521"/>
      <rect x="3" y="2" width="10" height="1" fill="#E52521"/>
      <rect x="3" y="3" width="10" height="1" fill="#C81E1E"/>
      <rect x="4" y="4" width="8" height="1" fill="#F4B97A"/>
      <rect x="4" y="5" width="8" height="1" fill="#F4B97A"/>
      <rect x="5" y="5" width="1" height="1" fill="#222"/>
      <rect x="9" y="5" width="1" height="1" fill="#222"/>
      <rect x="3" y="6" width="1" height="1" fill="#F4B97A"/>
      <rect x="4" y="6" width="8" height="1" fill="#6B3E1E"/>
      <rect x="12" y="6" width="1" height="1" fill="#F4B97A"/>
      <rect x="5" y="7" width="6" height="1" fill="#F4B97A"/>
      <rect x="2" y="8" width="1" height="2" fill="#F4B97A"/>
      <rect x="13" y="8" width="1" height="2" fill="#F4B97A"/>
      <rect x="3" y="8" width="10" height="1" fill="#E52521"/>
      <rect x="3" y="9" width="10" height="1" fill="#2A4B8D"/>
      <rect x="5" y="9" width="1" height="4" fill="#E52521"/>
      <rect x="10" y="9" width="1" height="4" fill="#E52521"/>
      <rect x="3" y="10" width="10" height="3" fill="#2A4B8D"/>
      <rect x="3" y="13" width="4" height="3" fill="#2A4B8D"/>
      <rect x="9" y="13" width="4" height="3" fill="#2A4B8D"/>
      <rect x="2" y="16" width="5" height="2" fill="#5C3A21"/>
      <rect x="9" y="16" width="5" height="2" fill="#5C3A21"/>
    </symbol>
  </svg>

  <!-- HUD fijo en la parte superior -->
  <div id="hud" class="nes-hud">
```

- [ ] **Step 2: Replace the 5 emoji portraits with the sprite reference**

Each level's dialog box has a line like `<div class="portrait">EMOJI</div>`. Replace all 5, one at a time (each is unique text so each is a safe, unambiguous find-replace):

In the Level 1 section (`EL GUARDIÁN`), replace:
```html
        <div class="portrait">📡</div>
```
with:
```html
        <div class="portrait"><svg class="hero-sprite"><use href="#hero-idle"></use></svg></div>
```

In the Level 2 section (`CARTÓGRAFO`), replace:
```html
        <div class="portrait">🗺</div>
```
with:
```html
        <div class="portrait"><svg class="hero-sprite"><use href="#hero-idle"></use></svg></div>
```

In the Level 3 section (`EXPLORADOR`), replace:
```html
        <div class="portrait">📷</div>
```
with:
```html
        <div class="portrait"><svg class="hero-sprite"><use href="#hero-idle"></use></svg></div>
```
(Note: Level 3 also has a *different*, unrelated `<span>📷</span>` inside `#l3-cam-placeholder` a few lines below — that one is NOT a portrait, it's the camera-placeholder icon. Do not touch it.)

In the Level 4 section (`NÚCLEO`), replace:
```html
        <div class="portrait">⚙</div>
```
with:
```html
        <div class="portrait"><svg class="hero-sprite"><use href="#hero-idle"></use></svg></div>
```

In the Level 5 section (`PORTAL`), replace:
```html
        <div class="portrait">⚡</div>
```
with:
```html
        <div class="portrait"><svg class="hero-sprite"><use href="#hero-idle"></use></svg></div>
```

- [ ] **Step 3: Resize the dialog padding in css/styles.css**

Replace:
```css
.nes-dialog {
  background: #000;
  border: 4px solid #fff;
  outline: 4px solid #000;
  padding: 10px 12px 10px 44px;
  font-size: 7px;
  color: #fff;
  line-height: 2.4;
  margin-bottom: 14px;
  position: relative;
}
```
with:
```css
.nes-dialog {
  background: #000;
  border: 4px solid #fff;
  outline: 4px solid #000;
  padding: 10px 12px 10px 70px;
  font-size: 7px;
  color: #fff;
  line-height: 2.4;
  margin-bottom: 14px;
  position: relative;
}
```

- [ ] **Step 4: Resize the portrait box and add the sprite + animation rules**

Replace:
```css
.nes-dialog .portrait {
  position: absolute;
  top: -3px; left: -3px;
  width: 34px; height: 34px;
  background: #E52521;
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
```
with:
```css
.nes-dialog .portrait {
  position: absolute;
  top: -3px; left: -3px;
  width: 60px; height: 60px;
  background: #E52521;
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-sprite {
  width: 46px;
  height: 52px;
  shape-rendering: crispEdges;
  animation: idleBob 0.6s steps(1) infinite;
}
@keyframes idleBob {
  0%, 49%   { transform: translateY(0); }
  50%, 100% { transform: translateY(-4px); }
}
```

(Note: `font-size: 18px` is intentionally dropped — it existed only to size the emoji character, which no longer exists in the markup.)

- [ ] **Step 5: Verify in browser**

Since this project has no automated test suite, verify manually (same convention as every other task in this codebase):

1. Open `http://localhost/dtw135/DTW135-Parcial3-G10/` (start XAMPP's Apache first if it isn't running).
2. Level 1 should show the red/blue pixel-art hero in a 60×60px box at the top-left of the dialog, idling (snapping up/down every 0.3s, not smoothly).
3. Open the browser console and run `goToLevel(2)`, `goToLevel(3)`, `goToLevel(4)`, `goToLevel(5)` — confirm the same animated sprite appears identically in all 5 dialogs, and that the dialog text never overlaps the portrait box.
4. In Level 3, confirm the unrelated 📷 emoji inside the "SIN ACCESO" camera placeholder box is still there (untouched) — only the dialog portrait changed.
5. Check the browser console for errors — there should be none (a missing `#hero-idle` reference would show a broken/blank box, not a console error, so also visually confirm all 5 boxes render the sprite, not an empty box).
6. Confirm no other visual regression: HUD, buttons, canvas, video, progress bars, stat cards all still look and behave as before (this change touches none of their CSS rules).

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: add animated hero sprite portrait to all 5 level dialogs"
```
