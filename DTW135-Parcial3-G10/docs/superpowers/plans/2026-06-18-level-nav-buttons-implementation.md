# Level Navigation Button Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visible, always-on bar of 5 numbered buttons below the HUD that lets anyone jump directly to any level, reusing the existing `goToLevel(n)` tutor override instead of duplicating navigation logic.

**Architecture:** Wrap the existing `#hud` and a new `#level-nav` bar in a single `position:fixed` container `#top-bar`, so the browser stacks them in normal flow without manual offset math. `js/game.js` gets two small additions: `updateLevelNav()` (called from inside the existing `updateHUD()`) paints each button's state (current/completed/default), and `initLevelNav()` (called once from the existing `DOMContentLoaded` handler) wires each button's click to `goToLevel(n)`. No existing function signature changes.

**Tech Stack:** Vanilla HTML5/CSS3/JS — same stack as the rest of the project. No new files, no new dependencies.

## Global Constraints

- Vanilla HTML5/CSS3/JS only — no frameworks, no new files, no external libraries (per CLAUDE.md project-wide restriction, still binding).
- The 5 level-nav buttons are NEVER `disabled` — all 5 must be clickable at all times, regardless of progress (per `docs/superpowers/specs/2026-06-18-level-nav-buttons-design.md` section 1).
- Clicking a level-nav button must ONLY navigate (call `goToLevel(n)`) — it must never set `completed`/`unlocked`/`score` on any level, and must never change `gameState.totalScore` or `gameState.coins`.
- Do not modify `goToLevel`, `showLevel`, `completeLevel`, or `goToNextLevel` — the button bar is a new caller of the existing `goToLevel(n)`, not a new code path.
- Exact approved values (from the spec): button size ~28×28px; states `.is-current` (red `#E52521`), `.is-completed` (green `#43B047`), default (gray `#2c2c2c`/`#aaa`/border `#555`); `.level-screen` padding-top goes from `52px` to `92px`.
- No automated test framework exists in this project — verify manually in the browser, consistent with every prior task in this codebase's plans.

---

## Task 1: Level navigation bar — markup, styles, and wiring

**Files:**
- Modify: `index.html:53-67` (wrap HUD in `#top-bar`, add `#level-nav` markup)
- Modify: `css/styles.css:11-29` (split `.nes-hud` positioning into `#top-bar`, add `.level-nav`/`.level-nav-btn` rules), `css/styles.css:31-37` (`.level-screen` padding-top)
- Modify: `js/game.js:26-33` (`updateHUD` calls new `updateLevelNav`), `js/game.js:96-101` (`DOMContentLoaded` calls new `initLevelNav`)
- Modify: `README.md:31-47` (document the button bar as the primary access method)

**Interfaces:**
- Consumes: `window.goToLevel(n)` (already defined in `js/game.js`, unchanged signature: `function(n)`, validates `1 <= n <= 5` internally, calls `showLevel(n)`). Consumes `gameState.current` and `gameState.levels[n-1].completed` (both already exist, unchanged shape).
- Produces: `updateLevelNav()` — no params, no return, reads `gameState` and writes `classList` on `.level-nav-btn` elements. Called only from `updateHUD()`. `initLevelNav()` — no params, no return, attaches click listeners. Called only once, from the `DOMContentLoaded` handler. Neither function is called from any other file in this plan.

- [ ] **Step 1: Wrap the HUD and add the level-nav markup in `index.html`**

Find this block (lines 53-67):
```html
  <!-- HUD fijo en la parte superior -->
  <div id="hud" class="nes-hud">
    <div class="hud-col">
      <span class="hud-label">JUGADOR</span>
      <span id="hud-score" class="hud-value">000000</span>
    </div>
    <div class="hud-col hud-center">
      <span id="hud-coins">🪙×00</span>
      <span id="hud-world">W1-1</span>
    </div>
    <div class="hud-col hud-right">
      <span class="hud-label">VIDAS</span>
      <span class="hud-value">♥♥♥</span>
    </div>
  </div>
```

Replace it with:
```html
  <!-- Barra superior fija: HUD + navegación de niveles -->
  <div id="top-bar">
    <div id="hud" class="nes-hud">
      <div class="hud-col">
        <span class="hud-label">JUGADOR</span>
        <span id="hud-score" class="hud-value">000000</span>
      </div>
      <div class="hud-col hud-center">
        <span id="hud-coins">🪙×00</span>
        <span id="hud-world">W1-1</span>
      </div>
      <div class="hud-col hud-right">
        <span class="hud-label">VIDAS</span>
        <span class="hud-value">♥♥♥</span>
      </div>
    </div>
    <div id="level-nav" class="level-nav">
      <span class="hud-label">NIVEL</span>
      <button class="level-nav-btn" data-level="1" title="Saltar al nivel 1">1</button>
      <button class="level-nav-btn" data-level="2" title="Saltar al nivel 2">2</button>
      <button class="level-nav-btn" data-level="3" title="Saltar al nivel 3">3</button>
      <button class="level-nav-btn" data-level="4" title="Saltar al nivel 4">4</button>
      <button class="level-nav-btn" data-level="5" title="Saltar al nivel 5">5</button>
    </div>
  </div>
```

(Every `id` inside the HUD — `hud-score`, `hud-coins`, `hud-world` — is unchanged, just nested one level deeper. Nothing else in `index.html` moves.)

- [ ] **Step 2: Verify the HTML is well-formed**

Run: `node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const opens=(html.match(/<div/g)||[]).length; const closes=(html.match(/<\/div>/g)||[]).length; console.log('div open:', opens, 'div close:', closes)"`

Expected: the two counts are equal (they were equal before this change — adding `<div id="top-bar">...</div>` keeps them balanced since it wraps existing content with one open+one close tag).

- [ ] **Step 3: Move `.nes-hud` positioning into a new `#top-bar` rule in `css/styles.css`**

Find (lines 11-29):
```css
/* ── HUD ── */
.nes-hud {
  position: fixed;
  top: 0; left: 0; right: 0;
  background: #000;
  border-bottom: 3px solid #E52521;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  z-index: 200;
  font-size: 8px;
}
.hud-col { display: flex; flex-direction: column; }
.hud-center { text-align: center; align-items: center; gap: 2px; }
.hud-right { text-align: right; align-items: flex-end; }
.hud-label { color: #fff; }
.hud-value { color: #FBD000; }
```

Replace with:
```css
/* ── TOP BAR (HUD + navegación de niveles) ── */
#top-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 200;
}
.nes-hud {
  background: #000;
  border-bottom: 3px solid #E52521;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  font-size: 8px;
}
.hud-col { display: flex; flex-direction: column; }
.hud-center { text-align: center; align-items: center; gap: 2px; }
.hud-right { text-align: right; align-items: flex-end; }
.hud-label { color: #fff; }
.hud-value { color: #FBD000; }

/* ── LEVEL NAV ── */
.level-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #000;
  border-bottom: 3px solid #E52521;
  padding: 6px 16px;
}
.level-nav-btn {
  width: 28px;
  height: 28px;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  background: #2c2c2c;
  color: #aaa;
  border: 2px solid #555;
  cursor: pointer;
}
.level-nav-btn.is-current {
  background: #E52521;
  color: #fff;
  border-color: #fff;
}
.level-nav-btn.is-completed {
  background: #43B047;
  color: #fff;
  border-color: #fff;
}
```

- [ ] **Step 4: Bump `.level-screen` padding-top in `css/styles.css`**

Find (lines 31-37):
```css
/* ── LEVEL SCREEN ── */
.level-screen {
  min-height: 100vh;
  background: #5C94FC;
  padding-top: 52px;
  position: relative;
  overflow-x: hidden;
}
```

Replace with:
```css
/* ── LEVEL SCREEN ── */
.level-screen {
  min-height: 100vh;
  background: #5C94FC;
  padding-top: 92px;
  position: relative;
  overflow-x: hidden;
}
```

- [ ] **Step 5: Add `updateLevelNav()` and call it from `updateHUD()` in `js/game.js`**

Find (lines 26-33):
```js
function updateHUD() {
  const n = gameState.current
  document.getElementById('hud-score').textContent =
    String(gameState.totalScore).padStart(6, '0')
  document.getElementById('hud-world').textContent = WORLD_NAMES[n - 1]
  document.getElementById('hud-coins').textContent =
    `🪙×${String(gameState.coins).padStart(2, '0')}`
}
```

Replace with:
```js
function updateHUD() {
  const n = gameState.current
  document.getElementById('hud-score').textContent =
    String(gameState.totalScore).padStart(6, '0')
  document.getElementById('hud-world').textContent = WORLD_NAMES[n - 1]
  document.getElementById('hud-coins').textContent =
    `🪙×${String(gameState.coins).padStart(2, '0')}`
  updateLevelNav()
}

function updateLevelNav() {
  document.querySelectorAll('.level-nav-btn').forEach(btn => {
    const n = parseInt(btn.dataset.level, 10)
    btn.classList.remove('is-current', 'is-completed')
    if (n === gameState.current) {
      btn.classList.add('is-current')
    } else if (gameState.levels[n - 1].completed) {
      btn.classList.add('is-completed')
    }
  })
}
```

- [ ] **Step 6: Add `initLevelNav()` and call it from the existing `DOMContentLoaded` handler in `js/game.js`**

Find (lines 96-101):
```js
// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  // Acceso directo opcional vía URL, ej. ?nivel=3 — mismo alcance que goToLevel(n)
  const nivel = parseInt(new URLSearchParams(location.search).get('nivel'), 10)
  showLevel(nivel >= 1 && nivel <= 5 ? nivel : 1)
})
```

Replace with:
```js
function initLevelNav() {
  document.querySelectorAll('.level-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Audio.play('click')
      goToLevel(parseInt(btn.dataset.level, 10))
    })
  })
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  initLevelNav()
  // Acceso directo opcional vía URL, ej. ?nivel=3 — mismo alcance que goToLevel(n)
  const nivel = parseInt(new URLSearchParams(location.search).get('nivel'), 10)
  showLevel(nivel >= 1 && nivel <= 5 ? nivel : 1)
})
```

- [ ] **Step 7: Validate JS syntax**

Run: `node --check js/game.js`
Expected: no output, exit code 0.

- [ ] **Step 8: Simulate the new logic with a Node mock before opening a browser**

Run:
```bash
node -e "
global.window = {};
global.document = {
  _btns: [1,2,3,4,5].map(n => ({ dataset: { level: String(n) }, classList: { set: new Set(), add(c){this.set.add(c)}, remove(...cs){cs.forEach(c=>this.set.delete(c))} }, addEventListener(){} })),
  querySelectorAll(sel) { return sel === '.level-nav-btn' ? global.document._btns : []; },
  getElementById() { return { textContent: '' }; }
};
const WORLD_NAMES = ['W1-1','W1-2','W1-3','W2-1','W2-2'];
const gameState = { current: 2, totalScore: 0, coins: 0, levels: [
  { completed: true }, { completed: false }, { completed: false }, { completed: false }, { completed: false }
]};
function updateLevelNav() {
  document.querySelectorAll('.level-nav-btn').forEach(btn => {
    const n = parseInt(btn.dataset.level, 10);
    btn.classList.remove('is-current', 'is-completed');
    if (n === gameState.current) { btn.classList.add('is-current'); }
    else if (gameState.levels[n - 1].completed) { btn.classList.add('is-completed'); }
  });
}
updateLevelNav();
document._btns.forEach(b => console.log(b.dataset.level, [...b.classList.set]));
"
```

Expected output (level 1 completed, level 2 is current, 3-5 untouched):
```
1 [ 'is-completed' ]
2 [ 'is-current' ]
3 []
4 []
5 []
```

If the output differs, re-check Step 5 before moving on — do not proceed to manual browser verification with a failing simulation.

- [ ] **Step 9: Update README.md to document the button bar**

Find (lines 31-47):
````markdown
## Acceso directo a cualquier nivel (para revisión del docente)

Para que el tutor pueda revisar cualquier nivel sin tener que completar los anteriores, hay dos formas equivalentes de saltar directamente:

**1. Parámetro en la URL** (la más cómoda — no requiere abrir la consola):

```
http://localhost/<ruta-al-proyecto>/?nivel=3
```

Reemplazar `3` por el número de nivel deseado (1 a 5). Si no se incluye el parámetro, el juego inicia normalmente en el Nivel 1.

**2. Consola del navegador:**

```js
goToLevel(3)   // salta directo al nivel 3, sin completar los anteriores
```
````

Replace with:
````markdown
## Acceso directo a cualquier nivel (para revisión del docente)

Para que el tutor pueda revisar cualquier nivel sin tener que completar los anteriores, hay tres formas equivalentes de saltar directamente:

**1. Botones de nivel en la barra superior** (la más visible — no requiere consola ni editar la URL):

Justo debajo del HUD hay una fila `NIVEL [1][2][3][4][5]`, siempre visible en las 5 pantallas. El botón del nivel actual se ve en rojo, los niveles ya completados en verde, y el resto en gris — pero los 5 son clickeables en todo momento. Saltar con estos botones solo cambia de pantalla; no otorga puntaje de los niveles que se omiten.

**2. Parámetro en la URL:**

```
http://localhost/<ruta-al-proyecto>/?nivel=3
```

Reemplazar `3` por el número de nivel deseado (1 a 5). Si no se incluye el parámetro, el juego inicia normalmente en el Nivel 1.

**3. Consola del navegador:**

```js
goToLevel(3)   // salta directo al nivel 3, sin completar los anteriores
```
````

- [ ] **Step 10: Verify in browser**

Since this project has no automated test suite, verify manually:

1. Start Apache in XAMPP if it isn't running, then open `http://localhost/dtw135/DTW135-Parcial3-G10/`.
2. Confirm a new bar reading `NIVEL [1][2][3][4][5]` appears directly below the existing HUD, and that button `1` is red (current) while `2`-`5` are gray.
3. Confirm the dialog text and buttons in Level 1 are not clipped or overlapped by the taller top bar (the `92px` padding-top should clear both bars) — if there's a visible gap or overlap, adjust `.level-screen`'s `padding-top` accordingly.
4. Complete Level 1 (get geolocation, click "SIGUIENTE NIVEL"). Confirm button `1` turns green and button `2` turns red, matching the level you're now on.
5. Click level-nav button `5` directly. Confirm the screen jumps straight to Level 5, the HUD score/coins did NOT increase (levels 2-4 were never marked completed), and buttons `2`, `3`, `4` are still gray (not completed) while `5` is now red (current) and `1` is green (completed).
6. Click level-nav button `1` again. Confirm it jumps back to Level 1, still showing its completed state (green) from earlier, and that the "SIGUIENTE NIVEL" button there is still enabled (per-level state survives navigating away and back).
7. Open the browser console — confirm there are no errors on any of the navigation clicks above.
8. Confirm the existing `?nivel=N` URL parameter and `goToLevel(n)` console command still work unchanged (try `http://localhost/dtw135/DTW135-Parcial3-G10/?nivel=4` directly).

- [ ] **Step 11: Commit**

```bash
git add index.html css/styles.css js/game.js README.md
git commit -m "feat: add visible level-nav button bar to jump to any level"
```
