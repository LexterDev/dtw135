# Escape Room NES — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una aplicación web tipo videojuego NES con 5 niveles consecutivos que cubren Geolocation, Canvas, Camera, y Web Workers.

**Architecture:** `index.html` contiene 5 `<section>` con clase `.level-screen`, solo una visible a la vez. `game.js` gestiona el estado global y las transiciones. Cada nivel tiene su propio archivo JS. Workers son archivos externos en `/workers/`.

**Tech Stack:** HTML5, CSS3, Bootstrap 5 CDN, JavaScript vanilla ES6, Web Audio API, Web Workers, Google Fonts (Press Start 2P)

---

## Mapa de archivos

| Archivo | Responsabilidad |
|---------|----------------|
| `index.html` | Estructura completa: HUD, 5 secciones, overlays, script tags |
| `css/styles.css` | Sistema de diseño NES: paleta, fuente, todos los componentes |
| `js/game.js` | Estado global, navegación entre niveles, HUD, Stage Clear, victoria |
| `js/audio.js` | Motor de sonido chiptune con Web Audio API |
| `js/level1.js` | Lógica Geolocation API |
| `js/level2.js` | Lógica Canvas API: mapa, marcador, primitivas |
| `js/level3.js` | Lógica MediaDevices: cámara, captura, localStorage |
| `js/level4.js` | Generación 20k datos + comunicación con worker4 |
| `js/level5.js` | Generación 250k datos + worker5 + exportar JSON |
| `workers/worker4.js` | Cálculo de stats (temp/humedad): avg, max, min |
| `workers/worker5.js` | Filtrado de negativos + top10 temp/presión + stats |

---

## IDs críticos (consistencia entre tasks)

```
HUD:        #hud-score  #hud-coins  #hud-world
Overlay SC: #stage-clear-overlay  .sc-world  .sc-pts  #sc-btn-continue
Victoria:   #victory-overlay  #victory-score
Level 1:    #l1-btn-get  #l1-btn-next  #l1-lat  #l1-lng  #l1-alert
Level 2:    #l2-canvas  #l2-btn-draw  #l2-btn-next  #l2-alert
Level 3:    #l3-video  #l3-cam-placeholder  #l3-btn-cam  #l3-btn-capture  #l3-btn-next  #l3-alert  #l3-photo-strip
Level 4:    #l4-btn-process  #l4-btn-next  #l4-progress-wrap  #l4-progress-fill  #l4-progress-label  #l4-stat-card  #l4-alert
            #l4-temp-avg  #l4-temp-max  #l4-temp-min  #l4-hum-avg  #l4-hum-max  #l4-hum-min  #l4-count
Level 5:    #l5-btn-process  #l5-btn-export  #l5-progress-wrap  #l5-progress-fill  #l5-progress-label  #l5-stat-card  #l5-alert
            #l5-top10-temp  #l5-top10-pres  #l5-avg-temp  #l5-avg-hum  #l5-avg-pres  #l5-valid  #l5-filtered
```

---

## Task 1: Scaffold — index.html

**Files:**
- Create: `index.html`
- Create: `css/` (carpeta vacía por ahora)
- Create: `js/` (carpeta vacía por ahora)
- Create: `workers/` (carpeta vacía por ahora)

- [ ] **Crear index.html con estructura completa**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>La Cámara de los Cinco Desafíos</title>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>

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

  <!-- ── PANTALLAS DE NIVEL ── -->
  <section id="level-1" class="level-screen">
    <div class="screen-body">
      <h2 class="level-title">EL GUARDIÁN</h2>
      <div class="nes-dialog">
        <div class="portrait">📡</div>
        <span>▶ Sistema bloqueado.<br>Necesito tu ubicación<br>para continuar...<span class="cursor-blink">█</span></span>
      </div>
      <div id="l1-alert" class="nes-alert" style="display:none"></div>
      <div class="data-row">
        LAT: <span id="l1-lat" class="data-pending">esperando...</span><br>
        LNG: <span id="l1-lng" class="data-pending">esperando...</span>
      </div>
      <div class="btn-group-nes">
        <button id="l1-btn-get" class="nes-btn nes-btn-primary">▶ OBTENER UBICACIÓN</button>
      </div>
      <div class="btn-group-nes">
        <button id="l1-btn-next" class="nes-btn nes-btn-disabled" disabled>🔒 SIGUIENTE NIVEL</button>
      </div>
    </div>
  </section>

  <section id="level-2" class="level-screen" style="display:none">
    <div class="screen-body">
      <h2 class="level-title">CARTÓGRAFO</h2>
      <div class="nes-dialog">
        <div class="portrait">🗺</div>
        <span>▶ Dibuja el mapa y<br>marca tu posición<br>en el canvas...<span class="cursor-blink">█</span></span>
      </div>
      <div id="l2-alert" class="nes-alert" style="display:none"></div>
      <canvas id="l2-canvas" class="nes-canvas"></canvas>
      <div class="btn-group-nes">
        <button id="l2-btn-draw" class="nes-btn nes-btn-primary">▶ DIBUJAR MAPA</button>
        <button id="l2-btn-next" class="nes-btn nes-btn-disabled" disabled>🔒 SIGUIENTE NIVEL</button>
      </div>
    </div>
  </section>

  <section id="level-3" class="level-screen" style="display:none">
    <div class="screen-body">
      <h2 class="level-title">EXPLORADOR</h2>
      <div class="nes-dialog">
        <div class="portrait">📷</div>
        <span>▶ Necesito evidencia.<br>Accede a la cámara<br>y captura la escena.<span class="cursor-blink">█</span></span>
      </div>
      <div id="l3-alert" class="nes-alert" style="display:none"></div>
      <div id="l3-cam-placeholder" class="nes-cam-placeholder">
        <span>📷</span>
        <span class="cam-label">SIN ACCESO</span>
      </div>
      <video id="l3-video" class="nes-video" autoplay playsinline style="display:none"></video>
      <div id="l3-photo-strip" class="photo-strip"></div>
      <div class="btn-group-nes">
        <button id="l3-btn-cam" class="nes-btn nes-btn-primary">▶ ACTIVAR CÁMARA</button>
        <button id="l3-btn-capture" class="nes-btn nes-btn-disabled" disabled>📸 CAPTURAR</button>
      </div>
      <div class="btn-group-nes">
        <button id="l3-btn-next" class="nes-btn nes-btn-disabled" disabled>🔒 SIGUIENTE NIVEL</button>
      </div>
    </div>
  </section>

  <section id="level-4" class="level-screen" style="display:none">
    <div class="screen-body">
      <h2 class="level-title">NÚCLEO</h2>
      <div class="nes-dialog">
        <div class="portrait">⚙</div>
        <span>▶ Analiza 20,000<br>lecturas de sensores.<br>Worker en standby.<span class="cursor-blink">█</span></span>
      </div>
      <div id="l4-alert" class="nes-alert" style="display:none"></div>
      <div id="l4-progress-wrap" style="display:none">
        <div id="l4-progress-label" class="progress-label">PROCESANDO... 0%</div>
        <div class="nes-progress-wrap">
          <div id="l4-progress-fill" class="nes-progress-fill" style="width:0%"></div>
        </div>
        <p class="worker-hint">● La interfaz sigue activa mientras el Worker trabaja</p>
      </div>
      <div id="l4-stat-card" class="nes-stat-card" style="display:none">
        <div class="stat-card-title">★ SENSORES ANALIZADOS</div>
        <div class="stat-row"><span>TEMP. PROMEDIO</span><span id="l4-temp-avg" class="stat-val">---</span></div>
        <div class="stat-row"><span>TEMP. MÁXIMA</span><span id="l4-temp-max" class="stat-val">---</span></div>
        <div class="stat-row"><span>TEMP. MÍNIMA</span><span id="l4-temp-min" class="stat-val">---</span></div>
        <div class="stat-row"><span>HUM. PROMEDIO</span><span id="l4-hum-avg" class="stat-val">---</span></div>
        <div class="stat-row"><span>HUM. MÁXIMA</span><span id="l4-hum-max" class="stat-val">---</span></div>
        <div class="stat-row"><span>HUM. MÍNIMA</span><span id="l4-hum-min" class="stat-val">---</span></div>
        <div class="stat-row"><span>REGISTROS</span><span id="l4-count" class="stat-val">---</span></div>
      </div>
      <div class="btn-group-nes">
        <button id="l4-btn-process" class="nes-btn nes-btn-primary">▶ GENERAR Y PROCESAR</button>
        <button id="l4-btn-next" class="nes-btn nes-btn-disabled" disabled>🔒 SIGUIENTE NIVEL</button>
      </div>
    </div>
  </section>

  <section id="level-5" class="level-screen" style="display:none">
    <div class="screen-body">
      <h2 class="level-title">PORTAL</h2>
      <div class="nes-dialog">
        <div class="portrait">⚡</div>
        <span>▶ 250,000 registros.<br>Filtra negativos y<br>calcula el top 10.<span class="cursor-blink">█</span></span>
      </div>
      <div id="l5-alert" class="nes-alert" style="display:none"></div>
      <div id="l5-progress-wrap" style="display:none">
        <div id="l5-progress-label" class="progress-label">PROCESANDO... 0%</div>
        <div class="nes-progress-wrap">
          <div id="l5-progress-fill" class="nes-progress-fill" style="width:0%"></div>
        </div>
        <p class="worker-hint">● Transfiriendo 250k registros al Worker...</p>
      </div>
      <div id="l5-stat-card" class="nes-stat-card" style="display:none">
        <div class="stat-card-title">★ PORTAL CUÁNTICO — RESULTADOS</div>
        <div class="top10-cols">
          <div>
            <div class="top-list-title">🌡 TOP 10 TEMP.</div>
            <div id="l5-top10-temp"></div>
          </div>
          <div>
            <div class="top-list-title">🔴 TOP 10 PRESIÓN</div>
            <div id="l5-top10-pres"></div>
          </div>
        </div>
        <div class="stat-row"><span>PROM. TEMP.</span><span id="l5-avg-temp" class="stat-val">---</span></div>
        <div class="stat-row"><span>PROM. HUM.</span><span id="l5-avg-hum" class="stat-val">---</span></div>
        <div class="stat-row"><span>PROM. PRESIÓN</span><span id="l5-avg-pres" class="stat-val">---</span></div>
        <div class="stat-row"><span>VÁLIDOS</span><span id="l5-valid" class="stat-val">---</span></div>
        <div class="stat-row"><span>FILTRADOS</span><span id="l5-filtered" class="stat-val">---</span></div>
      </div>
      <div class="btn-group-nes">
        <button id="l5-btn-process" class="nes-btn nes-btn-primary">▶ GENERAR 250K</button>
        <button id="l5-btn-export" class="nes-btn nes-btn-secondary" style="display:none">💾 EXPORTAR JSON</button>
        <button id="l5-btn-victory" class="nes-btn nes-btn-success" style="display:none">🏆 MISIÓN CUMPLIDA</button>
      </div>
    </div>
  </section>

  <!-- Stage Clear overlay -->
  <div id="stage-clear-overlay" class="sc-overlay" style="display:none">
    <div class="sc-box">
      <div class="sc-main">STAGE<br>CLEAR!</div>
      <div class="sc-world"></div>
      <div class="sc-pts"></div>
      <button id="sc-btn-continue" class="nes-btn nes-btn-primary">▶ CONTINUAR</button>
    </div>
  </div>

  <!-- Victory overlay -->
  <div id="victory-overlay" class="victory-overlay" style="display:none">
    <div class="victory-box">
      <div class="victory-stars">★ ★ ★</div>
      <div class="victory-main">MISIÓN<br>CUMPLIDA</div>
      <div class="victory-sub">ACCESO AL SISTEMA RESTAURADO</div>
      <div class="victory-score-label">PUNTUACIÓN FINAL</div>
      <div id="victory-score" class="victory-score">000000</div>
      <button id="victory-restart" class="nes-btn nes-btn-primary">▶ JUGAR DE NUEVO</button>
    </div>
  </div>

  <script src="js/audio.js"></script>
  <script src="js/game.js"></script>
  <script src="js/level1.js"></script>
  <script src="js/level2.js"></script>
  <script src="js/level3.js"></script>
  <script src="js/level4.js"></script>
  <script src="js/level5.js"></script>
</body>
</html>
```

- [ ] **Verificar en navegador:** abrir `http://localhost/dtw135/DTW135-Parcial3-G10/` — debe mostrar una pantalla azul con el HUD en negro arriba. Sin JS aún, solo la estructura.

- [ ] **Commit**
```bash
git add index.html
git commit -m "feat: add HTML scaffold with 5 level sections and overlays"
```

---

## Task 2: NES CSS Design System — css/styles.css

**Files:**
- Create: `css/styles.css`

- [ ] **Crear css/styles.css**

```css
/* ── RESET & BASE ── */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Press Start 2P', monospace;
  background: #000;
  color: #fff;
  min-height: 100vh;
}

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
  font-size: 6px;
}
.hud-col { display: flex; flex-direction: column; }
.hud-center { text-align: center; align-items: center; gap: 2px; }
.hud-right { text-align: right; align-items: flex-end; }
.hud-label { color: #fff; }
.hud-value { color: #FBD000; }

/* ── LEVEL SCREEN ── */
.level-screen {
  min-height: 100vh;
  background: #5C94FC;
  padding-top: 52px;
  position: relative;
}
.level-screen::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 3px,
    rgba(0,0,0,0.13) 3px, rgba(0,0,0,0.13) 4px
  );
  pointer-events: none;
  z-index: 10;
}

.screen-body {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 16px 40px;
  position: relative;
  z-index: 20;
}

/* ── LEVEL TITLE ── */
.level-title {
  font-size: 14px;
  color: #fff;
  text-shadow: 3px 3px #000, -1px -1px #000;
  text-align: center;
  line-height: 1.8;
  margin-bottom: 16px;
}

/* ── DIALOG BOX ── */
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
.cursor-blink {
  display: inline-block;
  animation: blink .8s infinite;
}
@keyframes blink { 0%,100%{ opacity:1 } 50%{ opacity:0 } }

/* ── BUTTONS ── */
.nes-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  border: none;
  cursor: pointer;
  padding: 8px 14px;
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 8px;
  transition: transform .05s;
}
.nes-btn:active { transform: translate(2px,2px); }

.nes-btn-primary {
  background: #E52521;
  color: #fff;
  border-bottom: 4px solid #8B0000;
  border-right: 4px solid #8B0000;
  text-shadow: 1px 1px #000;
}
.nes-btn-secondary {
  background: #000;
  color: #FBD000;
  border: 3px solid #FBD000;
}
.nes-btn-success {
  background: #43B047;
  color: #fff;
  border-bottom: 4px solid #1a5c1a;
  border-right: 4px solid #1a5c1a;
  text-shadow: 1px 1px #000;
}
.nes-btn-disabled {
  background: #2c2c2c;
  color: #555;
  border-bottom: 4px solid #111;
  border-right: 4px solid #111;
  cursor: not-allowed;
}

.btn-group-nes {
  margin-bottom: 6px;
}

/* ── ALERTS ── */
.nes-alert {
  font-size: 6px;
  padding: 8px 12px;
  line-height: 2.2;
  margin-bottom: 12px;
  border: 3px solid;
  background: #000;
}
.nes-alert-error  { border-color: #E52521; color: #E52521; }
.nes-alert-success { border-color: #43B047; color: #43B047; }

/* ── DATA DISPLAY ── */
.data-row {
  font-size: 7px;
  color: #fff;
  text-shadow: 1px 1px #000;
  line-height: 2.6;
  margin-bottom: 14px;
  background: rgba(0,0,0,0.3);
  padding: 8px 12px;
  border-left: 4px solid #FBD000;
}
.data-pending { color: #aaa; }
.data-val     { color: #FBD000; }

/* ── CANVAS ── */
.nes-canvas {
  width: 100%;
  height: 200px;
  display: block;
  border: 4px solid #43B047;
  background: #1a3a1a;
  margin-bottom: 12px;
  image-rendering: pixelated;
}

/* ── CAMERA ── */
.nes-cam-placeholder {
  background: #000;
  border: 3px solid #fff;
  width: 100%;
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 28px;
  margin-bottom: 10px;
}
.cam-label { font-size: 6px; color: #555; }
.nes-video {
  width: 100%;
  max-height: 200px;
  border: 3px solid #43B047;
  display: block;
  margin-bottom: 10px;
}

/* ── PHOTO STRIP ── */
.photo-strip {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.photo-thumb {
  width: 64px;
  height: 48px;
  border: 2px solid #43B047;
  overflow: hidden;
}
.photo-thumb img { width: 100%; height: 100%; object-fit: cover; }

/* ── PROGRESS BAR ── */
.progress-label {
  font-size: 6px;
  color: #fff;
  text-shadow: 1px 1px #000;
  margin-bottom: 6px;
}
.nes-progress-wrap {
  background: #000;
  border: 3px solid #fff;
  padding: 3px;
  margin-bottom: 8px;
}
.nes-progress-fill {
  height: 14px;
  background: #E52521;
  border-right: 3px solid #FBD000;
  transition: width .2s;
}
.worker-hint {
  font-size: 5px;
  color: rgba(255,255,255,0.7);
  text-shadow: 1px 1px #000;
  margin-bottom: 10px;
  line-height: 2;
}

/* ── STAT CARD ── */
.nes-stat-card {
  background: #000;
  border: 4px solid #fff;
  outline: 4px solid #000;
  padding: 12px 14px;
  margin-bottom: 14px;
}
.stat-card-title {
  font-size: 7px;
  color: #FBD000;
  border-bottom: 2px solid #E52521;
  padding-bottom: 6px;
  margin-bottom: 8px;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 6px;
  color: #fff;
  padding: 4px 0;
  border-bottom: 1px solid #1a1a1a;
}
.stat-val { color: #5C94FC; }

/* ── TOP 10 ── */
.top10-cols {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}
.top10-cols > div { flex: 1; }
.top-list-title {
  font-size: 6px;
  color: #FBD000;
  margin-bottom: 6px;
  border-bottom: 1px solid #333;
  padding-bottom: 3px;
}
.top-item {
  display: flex;
  justify-content: space-between;
  font-size: 5px;
  color: #fff;
  padding: 2px 0;
}
.top-item .rank { color: #FBD000; }
.top-item .val  { color: #5C94FC; }

/* ── STAGE CLEAR OVERLAY ── */
.sc-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.92);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity .4s;
}
.sc-box {
  text-align: center;
  border: 4px solid #FBD000;
  padding: 32px 40px;
  background: #000;
}
.sc-main {
  font-size: 24px;
  color: #FBD000;
  text-shadow: 3px 3px #8B0000;
  line-height: 1.6;
  margin-bottom: 16px;
}
.sc-world { font-size: 8px; color: #fff; margin-bottom: 10px; }
.sc-pts   { font-size: 12px; color: #FBD000; margin-bottom: 20px; }

/* ── VICTORY OVERLAY ── */
.victory-overlay {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.victory-box { text-align: center; padding: 32px; }
.victory-stars {
  font-size: 20px;
  color: #FBD000;
  margin-bottom: 16px;
  animation: starPulse 1s infinite;
}
@keyframes starPulse { 0%,100%{ opacity:1 } 50%{ opacity:.5 } }
.victory-main {
  font-size: 20px;
  color: #FBD000;
  text-shadow: 3px 3px #8B0000;
  line-height: 1.6;
  margin-bottom: 14px;
}
.victory-sub  { font-size: 7px; color: #fff; margin-bottom: 20px; line-height: 2; }
.victory-score-label { font-size: 6px; color: #aaa; margin-bottom: 6px; }
.victory-score { font-size: 16px; color: #FBD000; margin-bottom: 24px; }
```

- [ ] **Verificar:** recargar la página — debe verse el HUD negro con borde rojo abajo, fondo azul NES, fuente pixel art. Abrir DevTools y verificar que no haya errores de CSS.

- [ ] **Commit**
```bash
git add css/styles.css
git commit -m "feat: add NES design system CSS"
```

---

## Task 3: Game Engine — js/game.js

**Files:**
- Create: `js/game.js`

- [ ] **Crear js/game.js**

```js
const LEVEL_SCORES  = [1500, 1500, 2000, 2500, 2500]
const WORLD_NAMES   = ['W1-1', 'W1-2', 'W1-3', 'W2-1', 'W2-2']
const LEVEL_NAMES   = ['EL GUARDIÁN','EL CARTÓGRAFO','EL EXPLORADOR','EL NÚCLEO','EL PORTAL']

const gameState = {
  current: 1,
  totalScore: 0,
  coins: 0,
  geo: { lat: null, lng: null },
  levels: [
    { id: 1, unlocked: true,  completed: false, score: 0 },
    { id: 2, unlocked: false, completed: false, score: 0 },
    { id: 3, unlocked: false, completed: false, score: 0 },
    { id: 4, unlocked: false, completed: false, score: 0 },
    { id: 5, unlocked: false, completed: false, score: 0 },
  ]
}

function showLevel(n) {
  document.querySelectorAll('.level-screen').forEach(s => s.style.display = 'none')
  document.getElementById(`level-${n}`).style.display = 'block'
  gameState.current = n
  updateHUD()
}

function updateHUD() {
  const n = gameState.current
  document.getElementById('hud-score').textContent =
    String(gameState.totalScore).padStart(6, '0')
  document.getElementById('hud-world').textContent = WORLD_NAMES[n - 1]
  document.getElementById('hud-coins').textContent =
    `🪙×${String(gameState.coins).padStart(2, '0')}`
}

function completeLevel(n) {
  const level = gameState.levels[n - 1]
  if (level.completed) return
  level.completed = true
  level.score = LEVEL_SCORES[n - 1]
  gameState.totalScore += LEVEL_SCORES[n - 1]
  gameState.coins++
  if (n < 5) gameState.levels[n].unlocked = true
  updateHUD()
  Audio.play('complete')
}

function goToNextLevel(n) {
  if (n >= 5) { showVictory(); return; }
  Audio.play('stageClear')
  const overlay = document.getElementById('stage-clear-overlay')
  overlay.querySelector('.sc-world').textContent =
    `${WORLD_NAMES[n - 1]}: ${LEVEL_NAMES[n - 1]}`
  overlay.querySelector('.sc-pts').textContent = `+${LEVEL_SCORES[n - 1]} PTS`
  overlay.style.opacity = '0'
  overlay.style.display = 'flex'
  requestAnimationFrame(() => { overlay.style.opacity = '1' })

  document.getElementById('sc-btn-continue').onclick = () => {
    overlay.style.opacity = '0'
    setTimeout(() => {
      overlay.style.display = 'none'
      showLevel(n + 1)
    }, 400)
  }
}

function showVictory() {
  Audio.play('stageClear')
  const v = document.getElementById('victory-overlay')
  document.getElementById('victory-score').textContent =
    String(gameState.totalScore).padStart(6, '0')
  v.style.display = 'flex'
  document.getElementById('victory-restart').onclick = () => {
    location.reload()
  }
}

function showAlert(elId, success, msg) {
  const el = document.getElementById(elId)
  el.textContent = msg
  el.className = `nes-alert ${success ? 'nes-alert-success' : 'nes-alert-error'}`
  el.style.display = 'block'
}

function enableBtn(id, className = 'nes-btn-primary') {
  const btn = document.getElementById(id)
  btn.disabled = false
  btn.className = `nes-btn ${className}`
}

// Exponer para el tutor
window.goToLevel = function(n) {
  if (n >= 1 && n <= 5) showLevel(n)
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  showLevel(1)
})
```

- [ ] **Verificar en consola del navegador:**
```js
// Debe mostrar el nivel 2 aunque no esté completado el 1
goToLevel(2)
// Debe volver al 1
goToLevel(1)
// El HUD debe actualizarse con cada llamada
```

- [ ] **Commit**
```bash
git add js/game.js
git commit -m "feat: add game engine with state management and level navigation"
```

---

## Task 4: Audio Engine — js/audio.js

**Files:**
- Create: `js/audio.js`

- [ ] **Crear js/audio.js**

```js
const Audio = (() => {
  let ctx = null

  function init() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
  }

  function beep(freq, type, duration, vol = 0.25) {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  }

  function seq(notes) {
    notes.forEach(({ freq, type, dur, delay, vol }) => {
      setTimeout(() => beep(freq, type, dur, vol || 0.25), delay)
    })
  }

  const sounds = {
    click: () => beep(880, 'sine', 0.08),

    locked: () => beep(200, 'sine', 0.15),

    error: () => {
      beep(300, 'sawtooth', 0.15, 0.3)
      setTimeout(() => beep(150, 'sawtooth', 0.15, 0.3), 160)
    },

    complete: () => seq([
      { freq: 523, type: 'square', dur: 0.1,  delay: 0 },
      { freq: 659, type: 'square', dur: 0.1,  delay: 110 },
      { freq: 784, type: 'square', dur: 0.1,  delay: 220 },
      { freq: 1047, type: 'square', dur: 0.25, delay: 330 },
    ]),

    stageClear: () => seq([
      { freq: 523,  type: 'square', dur: 0.09, delay: 0 },
      { freq: 659,  type: 'square', dur: 0.09, delay: 100 },
      { freq: 784,  type: 'square', dur: 0.09, delay: 200 },
      { freq: 1047, type: 'square', dur: 0.09, delay: 300 },
      { freq: 784,  type: 'square', dur: 0.09, delay: 400 },
      { freq: 1047, type: 'square', dur: 0.09, delay: 500 },
      { freq: 1175, type: 'square', dur: 0.09, delay: 600 },
      { freq: 1319, type: 'square', dur: 0.25, delay: 700 },
    ]),
  }

  return {
    init,
    play(event) {
      try {
        init()
        if (sounds[event]) sounds[event]()
      } catch(e) {
        console.warn('Audio error:', e)
      }
    }
  }
})()
```

- [ ] **Verificar en consola del navegador** (hacer click en la página primero para desbloquear AudioContext):
```js
Audio.play('click')      // bip corto
Audio.play('complete')   // 4 notas ascendentes
Audio.play('error')      // buzz descendente
Audio.play('stageClear') // fanfare 8 notas
Audio.play('locked')     // bip grave
```

- [ ] **Commit**
```bash
git add js/audio.js
git commit -m "feat: add chiptune audio engine using Web Audio API"
```

---

## Task 5: Nivel 1 — Geolocation (js/level1.js)

**Files:**
- Create: `js/level1.js`

- [ ] **Crear js/level1.js**

```js
function initLevel1() {
  const btnGet  = document.getElementById('l1-btn-get')
  const btnNext = document.getElementById('l1-btn-next')
  const latEl   = document.getElementById('l1-lat')
  const lngEl   = document.getElementById('l1-lng')

  btnGet.addEventListener('click', () => {
    Audio.play('click')
    btnGet.textContent = '⏳ OBTENIENDO...'
    btnGet.disabled = true

    if (!navigator.geolocation) {
      showAlert('l1-alert', false, '✖ ERROR: Geolocalización no soportada en este navegador.')
      Audio.play('error')
      btnGet.textContent = '▶ OBTENER UBICACIÓN'
      btnGet.disabled = false
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gameState.geo.lat = pos.coords.latitude
        gameState.geo.lng = pos.coords.longitude
        latEl.textContent = pos.coords.latitude.toFixed(6) + '°'
        latEl.className = 'data-val'
        lngEl.textContent = pos.coords.longitude.toFixed(6) + '°'
        lngEl.className = 'data-val'
        btnGet.textContent = '✔ UBICACIÓN GUARDADA'
        btnGet.className = 'nes-btn nes-btn-success'
        showAlert('l1-alert', true, '✔ UBICACIÓN OBTENIDA CORRECTAMENTE')
        completeLevel(1)
        enableBtn('l1-btn-next')
      },
      (err) => {
        btnGet.textContent = '▶ REINTENTAR'
        btnGet.disabled = false
        Audio.play('error')
        if (err.code === err.PERMISSION_DENIED) {
          showAlert('l1-alert', false, '✖ ERROR: Permiso denegado. Activa la ubicación e intenta de nuevo.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          showAlert('l1-alert', false, '✖ ERROR: Ubicación no disponible. Intenta de nuevo.')
        } else {
          showAlert('l1-alert', false, '✖ ERROR: Tiempo de espera agotado. Intenta de nuevo.')
        }
      },
      { timeout: 10000, maximumAge: 0 }
    )
  })

  btnNext.addEventListener('click', () => {
    if (!gameState.levels[0].completed) { Audio.play('locked'); return; }
    Audio.play('click')
    goToNextLevel(1)
  })
}

document.addEventListener('DOMContentLoaded', initLevel1)
```

- [ ] **Verificar en navegador:**
  1. Cargar la página → pantalla azul nivel 1, HUD W1-1, score 000000
  2. Click "OBTENER UBICACIÓN" → aceptar permiso → lat/lng aparecen en amarillo
  3. Alerta verde "UBICACIÓN OBTENIDA" aparece
  4. Botón "SIGUIENTE NIVEL" se habilita (rojo)
  5. Click "SIGUIENTE NIVEL" → Stage Clear overlay → click "CONTINUAR" → nivel 2 visible
  6. **Error test:** recargar, denegar permiso → mensaje rojo de permiso denegado

- [ ] **Commit**
```bash
git add js/level1.js
git commit -m "feat: level 1 geolocation with error handling"
```

---

## Task 6: Nivel 2 — Canvas Map (js/level2.js)

**Files:**
- Create: `js/level2.js`

- [ ] **Crear js/level2.js**

```js
const MAP_BOUNDS = { latMin: 13.0, latMax: 14.5, lngMin: -90.2, lngMax: -87.7 }

function latLngToPixel(lat, lng, W, H) {
  let px = (lng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin) * W
  let py = (1 - (lat - MAP_BOUNDS.latMin) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * H
  px = Math.max(20, Math.min(W - 20, px))
  py = Math.max(20, Math.min(H - 20, py))
  return { px, py }
}

function drawMap(canvas, lat, lng) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height

  // fondo
  ctx.fillStyle = '#1a3a1a'
  ctx.fillRect(0, 0, W, H)

  // líneas (calles)
  ctx.strokeStyle = '#888'
  ctx.lineWidth = 2
  const streets = [
    [W*0.3, 0, W*0.3, H], [W*0.62, 0, W*0.62, H],
    [0, H*0.38, W, H*0.38], [0, H*0.7, W, H*0.7]
  ]
  streets.forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
  })

  // rectángulos (edificios)
  ctx.fillStyle = '#2d6a4f'
  [[10,8,55,28],[70,8,42,28],[10,H*0.44,42,22]].forEach(([x,y,w,h]) => ctx.fillRect(x,y,w,h))
  ctx.fillStyle = '#1b4332'
  [[W*0.34,8,68,24],[W*0.34,H*0.44,50,20],[W*0.66,8,54,34],[W*0.66,H*0.44+4,58,16]].forEach(([x,y,w,h]) => ctx.fillRect(x,y,w,h))

  // círculo (zona especial / plaza)
  ctx.strokeStyle = '#FBD000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(W*0.82, H*0.8, 16, 0, Math.PI * 2)
  ctx.stroke()

  // marcador de posición
  const { px, py } = latLngToPixel(lat, lng, W, H)
  ctx.fillStyle = '#E52521'
  ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(px-14,py); ctx.lineTo(px+14,py); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(px,py-14); ctx.lineTo(px,py+14); ctx.stroke()
  ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'
  ctx.fillText('TÚ', px + 10, py - 5)
}

function initLevel2() {
  const canvas  = document.getElementById('l2-canvas')
  const btnDraw = document.getElementById('l2-btn-draw')
  const btnNext = document.getElementById('l2-btn-next')

  // Ajustar canvas al tamaño real en pantalla
  canvas.width  = canvas.offsetWidth  || 560
  canvas.height = 200

  btnDraw.addEventListener('click', () => {
    Audio.play('click')
    const lat = gameState.geo.lat ?? 13.6929
    const lng = gameState.geo.lng ?? -89.2182
    drawMap(canvas, lat, lng)
    showAlert('l2-alert', true, '✔ MAPA DIBUJADO Y POSICIÓN MARCADA')
    btnDraw.textContent = '✔ MAPA COMPLETADO'
    btnDraw.className = 'nes-btn nes-btn-success'
    btnDraw.disabled = true
    completeLevel(2)
    enableBtn('l2-btn-next')
  })

  btnNext.addEventListener('click', () => {
    if (!gameState.levels[1].completed) { Audio.play('locked'); return; }
    Audio.play('click')
    goToNextLevel(2)
  })
}

document.addEventListener('DOMContentLoaded', initLevel2)
```

- [ ] **Verificar en navegador** (navegar desde nivel 1 o usar `goToLevel(2)` en consola):
  1. Nivel 2 visible → canvas vacío (verde oscuro)
  2. Click "DIBUJAR MAPA" → aparecen calles (líneas grises), edificios (rectángulos verdes), círculo amarillo, marcador rojo con cruz
  3. Alerta verde, botón "MAPA COMPLETADO" verde, "SIGUIENTE NIVEL" habilitado
  4. Click "SIGUIENTE NIVEL" → Stage Clear → nivel 3

- [ ] **Commit**
```bash
git add js/level2.js
git commit -m "feat: level 2 canvas map with streets, buildings, circle and position marker"
```

---

## Task 7: Nivel 3 — Camera (js/level3.js)

**Files:**
- Create: `js/level3.js`

- [ ] **Crear js/level3.js**

```js
function initLevel3() {
  const video       = document.getElementById('l3-video')
  const placeholder = document.getElementById('l3-cam-placeholder')
  const btnCam      = document.getElementById('l3-btn-cam')
  const btnCapture  = document.getElementById('l3-btn-capture')
  const btnNext     = document.getElementById('l3-btn-next')
  const strip       = document.getElementById('l3-photo-strip')
  let photoCount = 0

  btnCam.addEventListener('click', async () => {
    Audio.play('click')
    btnCam.textContent = '⏳ CONECTANDO...'
    btnCam.disabled = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      video.srcObject = stream
      await video.play()
      placeholder.style.display = 'none'
      video.style.display = 'block'
      showAlert('l3-alert', true, '● CÁMARA ACTIVA — VIDEO EN TIEMPO REAL')
      btnCam.textContent = '● CÁMARA ON'
      btnCam.className = 'nes-btn nes-btn-success'
      enableBtn('l3-btn-capture')
    } catch (err) {
      Audio.play('error')
      btnCam.textContent = '▶ REINTENTAR'
      btnCam.disabled = false
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        showAlert('l3-alert', false, '✖ ERROR: Cámara no encontrada en este dispositivo.')
      } else {
        showAlert('l3-alert', false, '✖ ERROR: Permiso de cámara denegado.')
      }
    }
  })

  btnCapture.addEventListener('click', () => {
    Audio.play('click')
    const cv  = document.createElement('canvas')
    cv.width  = video.videoWidth  || 640
    cv.height = video.videoHeight || 480
    cv.getContext('2d').drawImage(video, 0, 0)
    const dataURL = cv.toDataURL('image/jpeg', 0.7)
    photoCount++
    try {
      localStorage.setItem(`escape_photo_${photoCount}`, dataURL)
    } catch (e) {
      console.warn('LocalStorage lleno, foto no guardada:', e)
    }

    const thumb = document.createElement('div')
    thumb.className = 'photo-thumb'
    thumb.innerHTML = `<img src="${dataURL}" alt="foto ${photoCount}">`
    strip.appendChild(thumb)

    showAlert('l3-alert', true, `✔ FOTO ${photoCount} CAPTURADA Y GUARDADA EN MEMORIA`)
    Audio.play('complete')

    if (photoCount === 1) {
      completeLevel(3)
      enableBtn('l3-btn-next')
    }
  })

  btnNext.addEventListener('click', () => {
    if (!gameState.levels[2].completed) { Audio.play('locked'); return; }
    Audio.play('click')
    // Detener stream antes de salir
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop())
    }
    goToNextLevel(3)
  })
}

document.addEventListener('DOMContentLoaded', initLevel3)
```

- [ ] **Verificar en navegador** (`goToLevel(3)` en consola):
  1. Placeholder de cámara visible
  2. Click "ACTIVAR CÁMARA" → aceptar permiso → video en tiempo real
  3. Click "CAPTURAR" → thumbnail aparece en la tira, alerta verde
  4. "SIGUIENTE NIVEL" habilitado
  5. **Error test:** recargar, denegar cámara → mensaje rojo
  6. **LocalStorage test:** en DevTools → Application → Local Storage → ver `escape_photo_1`

- [ ] **Commit**
```bash
git add js/level3.js
git commit -m "feat: level 3 camera access, photo capture and localStorage"
```

---

## Task 8: Worker 4 + Nivel 4 (workers/worker4.js + js/level4.js)

**Files:**
- Create: `workers/worker4.js`
- Create: `js/level4.js`

- [ ] **Crear workers/worker4.js**

```js
self.onmessage = function(e) {
  const data = e.data
  const n    = data.length
  let sumTemp = 0, maxTemp = -Infinity, minTemp = Infinity
  let sumHum  = 0, maxHum  = -Infinity, minHum  = Infinity

  for (let i = 0; i < n; i++) {
    const { temp, humidity } = data[i]
    sumTemp += temp
    if (temp > maxTemp) maxTemp = temp
    if (temp < minTemp) minTemp = temp
    sumHum += humidity
    if (humidity > maxHum) maxHum = humidity
    if (humidity < minHum) minHum = humidity

    if (i % 1000 === 0) {
      self.postMessage({ type: 'progress', value: Math.round((i / n) * 100) })
    }
  }

  self.postMessage({
    type: 'result',
    stats: {
      temp: {
        avg: (sumTemp / n).toFixed(2),
        max: maxTemp.toFixed(2),
        min: minTemp.toFixed(2)
      },
      humidity: {
        avg: (sumHum / n).toFixed(2),
        max: maxHum.toFixed(2),
        min: minHum.toFixed(2)
      },
      count: n
    }
  })
}
```

- [ ] **Crear js/level4.js**

```js
function generateSensorData20k() {
  const data = []
  for (let i = 0; i < 20000; i++) {
    data.push({
      temp:     Math.random() * 35 + 10,
      humidity: Math.random() * 75 + 20
    })
  }
  return data
}

function initLevel4() {
  const btnProcess = document.getElementById('l4-btn-process')
  const btnNext    = document.getElementById('l4-btn-next')
  const progWrap   = document.getElementById('l4-progress-wrap')
  const progFill   = document.getElementById('l4-progress-fill')
  const progLabel  = document.getElementById('l4-progress-label')
  const statCard   = document.getElementById('l4-stat-card')

  btnProcess.addEventListener('click', () => {
    Audio.play('click')
    btnProcess.disabled = true
    btnProcess.textContent = '⏳ PROCESANDO...'
    progWrap.style.display = 'block'

    const data   = generateSensorData20k()
    const worker = new Worker('workers/worker4.js')
    worker.postMessage(data)

    worker.onmessage = (e) => {
      if (e.data.type === 'progress') {
        const pct = e.data.value
        progFill.style.width  = pct + '%'
        progLabel.textContent = `PROCESANDO DATOS... ${pct}%`
      } else if (e.data.type === 'result') {
        const { stats } = e.data
        document.getElementById('l4-temp-avg').textContent = stats.temp.avg + '°C'
        document.getElementById('l4-temp-max').textContent = stats.temp.max + '°C'
        document.getElementById('l4-temp-min').textContent = stats.temp.min + '°C'
        document.getElementById('l4-hum-avg').textContent  = stats.humidity.avg + '%'
        document.getElementById('l4-hum-max').textContent  = stats.humidity.max + '%'
        document.getElementById('l4-hum-min').textContent  = stats.humidity.min + '%'
        document.getElementById('l4-count').textContent    = stats.count.toLocaleString()
        progWrap.style.display  = 'none'
        statCard.style.display  = 'block'
        btnProcess.textContent  = '✔ PROCESADO'
        btnProcess.className    = 'nes-btn nes-btn-success'
        showAlert('l4-alert', true, '✔ ANÁLISIS COMPLETADO — ESTADÍSTICAS LISTAS')
        Audio.play('complete')
        completeLevel(4)
        enableBtn('l4-btn-next')
        worker.terminate()
      }
    }

    worker.onerror = (e) => {
      showAlert('l4-alert', false, '✖ ERROR en el Worker: ' + e.message)
      Audio.play('error')
      btnProcess.disabled = false
      btnProcess.textContent = '▶ REINTENTAR'
    }
  })

  btnNext.addEventListener('click', () => {
    if (!gameState.levels[3].completed) { Audio.play('locked'); return; }
    Audio.play('click')
    goToNextLevel(4)
  })
}

document.addEventListener('DOMContentLoaded', initLevel4)
```

- [ ] **Verificar en navegador** (`goToLevel(4)` en consola):
  1. Click "GENERAR Y PROCESAR" → barra de progreso avanza de 0% a 100%
  2. **Durante el progreso:** hacer scroll, mover el mouse, abrir DevTools → la UI no se congela
  3. Al terminar → card de estadísticas con 7 filas de datos
  4. "SIGUIENTE NIVEL" habilitado
  5. En consola verificar: `gameState.levels[3].completed === true`

- [ ] **Commit**
```bash
git add workers/worker4.js js/level4.js
git commit -m "feat: level 4 web worker processes 20k sensor records with progress bar"
```

---

## Task 9: Worker 5 + Nivel 5 (workers/worker5.js + js/level5.js)

**Files:**
- Create: `workers/worker5.js`
- Create: `js/level5.js`

- [ ] **Crear workers/worker5.js**

```js
self.onmessage = function(e) {
  const data  = e.data
  const total = data.length
  const valid = []

  // Fase 1: filtrar negativos (0–50% del progreso)
  for (let i = 0; i < total; i++) {
    const r = data[i]
    if (r.temp >= 0 && r.humidity >= 0 && r.pressure >= 0) {
      valid.push(r)
    }
    if (i % 10000 === 0) {
      self.postMessage({ type: 'progress', value: Math.round((i / total) * 50) })
    }
  }

  // Fase 2: calcular sumas (50–80% del progreso)
  const n = valid.length
  let sumTemp = 0, sumHum = 0, sumPres = 0
  for (let i = 0; i < n; i++) {
    sumTemp += valid[i].temp
    sumHum  += valid[i].humidity
    sumPres += valid[i].pressure
    if (i % 10000 === 0) {
      self.postMessage({ type: 'progress', value: 50 + Math.round((i / n) * 30) })
    }
  }

  // Fase 3: top 10 (80–100%)
  self.postMessage({ type: 'progress', value: 82 })
  const top10Temp = valid.slice().sort((a,b) => b.temp - a.temp)
    .slice(0, 10).map(r => r.temp.toFixed(2))

  self.postMessage({ type: 'progress', value: 92 })
  const top10Pres = valid.slice().sort((a,b) => b.pressure - a.pressure)
    .slice(0, 10).map(r => r.pressure.toFixed(2))

  self.postMessage({ type: 'progress', value: 100 })
  self.postMessage({
    type: 'result',
    stats: {
      avgTemp:       (sumTemp / n).toFixed(2),
      avgHum:        (sumHum  / n).toFixed(2),
      avgPres:       (sumPres / n).toFixed(2),
      top10Temp,
      top10Pres,
      validCount:    n,
      filteredCount: total - n
    }
  })
}
```

- [ ] **Crear js/level5.js**

```js
function generateQuantumData250k() {
  const data = []
  for (let i = 0; i < 250000; i++) {
    let temp     = Math.random() * 35 + 10
    let humidity = Math.random() * 75 + 20
    let pressure = Math.random() * 70 + 980
    if (Math.random() < 0.1) temp     *= -1
    if (Math.random() < 0.1) humidity *= -1
    if (Math.random() < 0.1) pressure *= -1
    data.push({ temp, humidity, pressure })
  }
  return data
}

function renderTop10(containerId, values, unit) {
  const el = document.getElementById(containerId)
  el.innerHTML = values.map((v, i) =>
    `<div class="top-item">
       <span class="rank">#${i+1}</span>
       <span class="val">${v}${unit}</span>
     </div>`
  ).join('')
}

function initLevel5() {
  const btnProcess = document.getElementById('l5-btn-process')
  const btnExport  = document.getElementById('l5-btn-export')
  const progWrap   = document.getElementById('l5-progress-wrap')
  const progFill   = document.getElementById('l5-progress-fill')
  const progLabel  = document.getElementById('l5-progress-label')
  const statCard   = document.getElementById('l5-stat-card')
  let lastResult   = null

  btnProcess.addEventListener('click', () => {
    Audio.play('click')
    btnProcess.disabled = true
    btnProcess.textContent = '⏳ GENERANDO...'
    progWrap.style.display = 'block'

    const data   = generateQuantumData250k()
    btnProcess.textContent = '⏳ PROCESANDO...'
    const worker = new Worker('workers/worker5.js')
    worker.postMessage(data)

    worker.onmessage = (e) => {
      if (e.data.type === 'progress') {
        const pct = e.data.value
        progFill.style.width  = pct + '%'
        progLabel.textContent = `FILTRANDO Y CALCULANDO... ${pct}%`
      } else if (e.data.type === 'result') {
        lastResult = e.data.stats
        const s = lastResult

        renderTop10('l5-top10-temp', s.top10Temp, '°C')
        renderTop10('l5-top10-pres', s.top10Pres, 'hPa')
        document.getElementById('l5-avg-temp').textContent  = s.avgTemp + '°C'
        document.getElementById('l5-avg-hum').textContent   = s.avgHum  + '%'
        document.getElementById('l5-avg-pres').textContent  = s.avgPres + 'hPa'
        document.getElementById('l5-valid').textContent     = s.validCount.toLocaleString()
        document.getElementById('l5-filtered').textContent  = s.filteredCount.toLocaleString()

        progWrap.style.display = 'none'
        statCard.style.display = 'block'
        btnExport.style.display = 'inline-block'
        document.getElementById('l5-btn-victory').style.display = 'inline-block'
        btnProcess.textContent = '✔ PROCESADO'
        btnProcess.className   = 'nes-btn nes-btn-success'
        showAlert('l5-alert', true, '✔ PORTAL CUÁNTICO ACTIVADO — EXPORTA Y COMPLETA LA MISIÓN')
        Audio.play('complete')
        completeLevel(5)
        worker.terminate()
      }
    }

    worker.onerror = (e) => {
      showAlert('l5-alert', false, '✖ ERROR en el Worker: ' + e.message)
      Audio.play('error')
      btnProcess.disabled = false
      btnProcess.textContent = '▶ REINTENTAR'
    }
  })

  document.getElementById('l5-btn-victory').addEventListener('click', () => {
    Audio.play('click')
    showVictory()
  })

  btnExport.addEventListener('click', () => {
    Audio.play('click')
    if (!lastResult) return
    const json = JSON.stringify(lastResult, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'resultados-portal.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
}

document.addEventListener('DOMContentLoaded', initLevel5)
```

- [ ] **Verificar en navegador** (`goToLevel(5)` en consola):
  1. Click "GENERAR 250K" → barra de progreso en 3 fases (filtrado → cálculo → top10)
  2. **Durante el proceso:** mover el mouse, escribir en consola → UI sin congelarse
  3. Al terminar → tabla top 10 temperaturas, tabla top 10 presiones, card de resumen
  4. Click "EXPORTAR JSON" → descarga `resultados-portal.json`
  5. Abrir el JSON descargado → verificar que tiene todas las propiedades: `avgTemp`, `avgHum`, `avgPres`, `top10Temp`, `top10Pres`, `validCount`, `filteredCount`
  6. Click "🏆 MISIÓN CUMPLIDA" → pantalla de victoria aparece con score final

- [ ] **Commit**
```bash
git add workers/worker5.js js/level5.js
git commit -m "feat: level 5 web worker filters 250k records, top10 stats and JSON export"
```

---

## Task 10: Revisión final y .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Crear .gitignore**

```
.superpowers/
```

- [ ] **Verificar flujo completo de inicio a fin:**
  1. Cargar `http://localhost/dtw135/DTW135-Parcial3-G10/` → nivel 1
  2. Obtener ubicación → Stage Clear → nivel 2
  3. Dibujar mapa → Stage Clear → nivel 3
  4. Activar cámara → capturar foto → Stage Clear → nivel 4
  5. Procesar 20k → ver stats → Stage Clear → nivel 5
  6. Procesar 250k → ver top10 → exportar JSON → pantalla de victoria
  7. Click "JUGAR DE NUEVO" → recarga desde nivel 1

- [ ] **Verificar herramienta del tutor:**
```js
// En consola del navegador — debe navegar a cualquier nivel directamente
goToLevel(3)
goToLevel(5)
goToLevel(1)
```

- [ ] **Verificar sonidos en cada interacción:**
  - Botones → bip
  - Nivel completado → 4 notas
  - Stage Clear → fanfare
  - Error → buzz
  - Botón bloqueado → bip grave

- [ ] **Commit final**
```bash
git add .gitignore
git commit -m "chore: add gitignore for superpowers brainstorm files"
```
