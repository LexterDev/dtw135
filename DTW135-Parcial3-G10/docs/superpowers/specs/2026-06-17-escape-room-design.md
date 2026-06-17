# Escape Room JS — "La Cámara de los Cinco Desafíos"
**Spec de diseño** · DTW135 Parcial 3 · Grupo 10 · 2026-06-17

---

## 1. Contexto

Aplicación web tipo videojuego NES que implementa 5 niveles consecutivos con APIs nativas del navegador. El usuario debe superar cada nivel en orden para "recuperar el acceso" a un sistema ficticio de ciudad inteligente.

**Stack permitido:** HTML5, CSS3, Bootstrap, JavaScript vanilla  
**Prohibido:** Frameworks, Backend, BD, librerías externas de Canvas/Mapas

---

## 2. Estilo Visual

### Paleta de color (NES Overworld)

| Token        | Hex       | Uso                                      |
|--------------|-----------|------------------------------------------|
| Sky Blue     | `#5C94FC` | Fondo de cada pantalla de nivel          |
| Mario Red    | `#E52521` | Botones primarios, HUD border, acentos   |
| Coin Yellow  | `#FBD000` | Valores de datos, score, acentos         |
| Pipe Green   | `#43B047` | Éxito, botones completado, canvas        |
| NES Black    | `#000000` | Fondos de dialog, cards, overlays        |
| White        | `#FFFFFF` | Texto, borders de dialog                 |
| Shadow Red   | `#8B0000` | Sombra de botones primarios              |
| Locked Grey  | `#2C2C2C` | Elementos bloqueados/deshabilitados      |

### Tipografía
- **Fuente:** Press Start 2P (Google Fonts — no es librería, solo CSS)
- 14px → títulos de nivel
- 8px → HUD, subtítulos
- 7px → diálogos, texto de cuerpo
- 5–6px → etiquetas, valores de datos, micro-texto

### Efectos globales
- **Scanlines:** overlay CSS con `repeating-linear-gradient` en cada pantalla, `pointer-events:none`
- **Sombra pixel en botones:** `border-bottom` + `border-right` de 3–4px en tono más oscuro
- **Cursor parpadeante:** bloque `█` con animación CSS `blink` en cajas de diálogo

---

## 3. Arquitectura

### Estructura de archivos

```
index.html
css/
  styles.css          ← paleta, fuente, componentes globales
js/
  game.js             ← estado global, control de niveles, transiciones, HUD
  audio.js            ← motor de sonido chiptune (Web Audio API)
  level1.js           ← Geolocation API
  level2.js           ← Canvas API
  level3.js           ← MediaDevices / Camera
  level4.js           ← Web Worker 20 000 registros
  level5.js           ← Web Worker 250 000 registros
workers/
  worker4.js          ← procesamiento nivel 4
  worker5.js          ← procesamiento nivel 5
docs/
  Examen_Parcial_3_DTW135_2026.pdf
  superpowers/specs/
    2026-06-17-escape-room-design.md
```

### Estado global (`game.js`)

```js
const gameState = {
  current: 1,
  totalScore: 0,
  geo: { lat: null, lng: null },   // llenado en nivel 1, usado en nivel 2
  levels: [
    { id: 1, unlocked: true,  completed: false, score: 0 },
    { id: 2, unlocked: false, completed: false, score: 0 },
    { id: 3, unlocked: false, completed: false, score: 0 },
    { id: 4, unlocked: false, completed: false, score: 0 },
    { id: 5, unlocked: false, completed: false, score: 0 },
  ]
}
```

**API pública de `game.js`:**
- `completeLevel(n)` — marca nivel completado, desbloquea siguiente, dispara Stage Clear
- `goToLevel(n)` — salta directo a cualquier nivel (expuesto en `window` para el tutor)
- `updateHUD()` — sincroniza score/mundo/monedas en pantalla

### Comunicación entre módulos
- `level1.js` escribe `gameState.geo.lat` / `gameState.geo.lng`
- `level2.js` lee esos valores para colocar el marcador en el canvas
- `level4.js` y `level5.js` crean sus Workers, envían datos con `postMessage`, reciben resultados y llaman `completeLevel()`
- `audio.js` expone `Audio.play(event)` con eventos: `click`, `complete`, `error`, `stageClear`, `locked`

---

## 4. Navegación y Transiciones

### Estructura de pantallas
`index.html` contiene 5 secciones `<section id="level-N">` ocultas con `display:none`. Solo una está visible a la vez. `game.js` maneja cuál mostrar.

### Flujo Stage Clear (transición al completar un nivel)
1. Usuario presiona "Siguiente Nivel"
2. `audio.play('stageClear')` — fanfare 8-bit
3. Pantalla actual hace fade a negro (CSS transition 400ms)
4. Se muestra overlay "STAGE CLEAR!" con puntos ganados (1200ms)
5. Overlay hace fade out
6. Entra la pantalla del siguiente nivel con fade in (400ms)

### Acceso del tutor
`window.goToLevel(n)` disponible en consola del navegador para saltar a cualquier nivel sin completar los anteriores. Los niveles completados muestran su estado final.

---

## 5. Diseño por Nivel

### HUD (compartido, en todos los niveles)
```
[ JUGADOR ]  [ 🪙×00  MUNDO 1-1 ]  [ VIDAS ♥♥♥ ]
[ 000000  ]                          [            ]
```
Score y vidas son decorativos. El número de mundo es dinámico (`W1-1` a `W2-2`).

---

### Nivel 1 — El Guardián de la Ubicación (15%) · `W1-1`
**Emoji de retrato:** 📡

**Estado inicial:**
- Dialog: "Sistema bloqueado. Necesito tu ubicación para continuar..."
- LAT: `esperando...` / LNG: `esperando...`
- Botón primario: `▶ OBTENER UBICACIÓN`
- Botón bloqueado: `🔒 SIGUIENTE NIVEL`

**Flujo:**
1. Click en "Obtener Ubicación" → `navigator.geolocation.getCurrentPosition()`
2. Éxito → mostrar lat/lng en amarillo, `alert-success`, habilitar "Siguiente Nivel", llamar `completeLevel(1)`
3. `PERMISSION_DENIED` → `alert-error`: "✖ ERROR: Permiso denegado. Activa la ubicación e intenta de nuevo."
4. `POSITION_UNAVAILABLE` → `alert-error`: "✖ ERROR: Ubicación no disponible."

**Condición para avanzar:** `gameState.geo.lat !== null`

---

### Nivel 2 — El Cartógrafo Perdido (15%) · `W1-2`
**Emoji de retrato:** 🗺

**Canvas:** 100% de ancho del contenedor × 200px de alto, fondo `#1a3a1a`

**Lo que se dibuja al presionar "Dibujar Mapa":**
- **Rectángulos** (edificios) — bloques verdes `#2d6a4f` y `#1b4332` distribuidos en cuadrícula
- **Líneas** (calles) — líneas grises `#888` horizontales y verticales
- **Círculo** (zona especial) — stroke amarillo `#FBD000`, representa una plaza
- **Marcador de posición** — círculo rojo `#E52521` con cruz blanca, coordenadas de `gameState.geo` convertidas a píxeles dentro del canvas

**Conversión lat/lng → píxeles:**  
Se define un bounding box fijo en `level2.js` representando la región de El Salvador:
```js
const BOUNDS = { latMin: 13.0, latMax: 14.5, lngMin: -90.2, lngMax: -87.7 }
```
La lat/lng del usuario se mapea proporcionalmente al tamaño del canvas:
```js
px = (lng - BOUNDS.lngMin) / (BOUNDS.lngMax - BOUNDS.lngMin) * canvas.width
py = (1 - (lat - BOUNDS.latMin) / (BOUNDS.latMax - BOUNDS.latMin)) * canvas.height
```
Si la ubicación cae fuera del bounding box, el marcador se coloca en el centro del canvas.

**Condición para avanzar:** canvas dibujado + marcador colocado

---

### Nivel 3 — La Evidencia del Explorador (20%) · `W1-3`
**Emoji de retrato:** 📷

**Elementos:**
- `<video>` para stream en tiempo real
- `<canvas>` oculto para captura de frame
- Tira de thumbnails de fotos capturadas (máximo 3 visibles)

**Flujo:**
1. `▶ ACTIVAR CÁMARA` → `navigator.mediaDevices.getUserMedia({ video: true })`
2. Éxito → stream asignado a `<video>`, botón `📸 CAPTURAR` se habilita, indicador `● REC` verde
3. `📸 CAPTURAR` → dibuja frame en canvas oculto, obtiene `dataURL`, guarda en `localStorage` con key `escape_photo_N`, agrega thumbnail a la tira
4. Primera captura → `completeLevel(3)`, habilita "Siguiente Nivel"
5. `NotFoundError` → alert-error "Cámara no encontrada"
6. `NotAllowedError` → alert-error "Permiso de cámara denegado"

**Condición para avanzar:** al menos una foto en localStorage

---

### Nivel 4 — El Núcleo de Procesamiento (25%) · `W2-1`
**Emoji de retrato:** ⚙

**Flujo:**
1. `▶ GENERAR Y PROCESAR` → genera array de 20 000 objetos `{ temp, humidity }` con valores aleatorios:
   - `temp`: entre 10°C y 45°C (`Math.random() * 35 + 10`)
   - `humidity`: entre 20% y 95% (`Math.random() * 75 + 20`)
2. `new Worker('workers/worker4.js')` → `worker.postMessage(data)`
3. Worker calcula: promedio/máximo/mínimo de temperatura y humedad
4. Worker envía mensajes de progreso: `{ type: 'progress', value: 0–100 }`
5. Hilo principal actualiza barra de progreso sin bloquearse
6. Worker envía `{ type: 'result', stats }` → se muestra card de Bootstrap con estadísticas
7. `completeLevel(4)` → habilita "Siguiente Nivel"

**Nota UI:** durante el procesamiento, nota visible "● La interfaz sigue activa"

**Condición para avanzar:** card de estadísticas visible con todos los valores

---

### Nivel 5 — El Portal Cuántico (25%) · `W2-2`
**Emoji de retrato:** ⚡

**Flujo:**
1. `▶ GENERAR 250K REGISTROS` → genera array de 250 000 objetos `{ temp, humidity, pressure }` con valores base:
   - `temp`: 10–45°C, `humidity`: 20–95%, `pressure`: 980–1050 hPa
   - Cada campo tiene un 10% de probabilidad independiente de volverse negativo (se multiplica por -1)
   - Resultado: ~25 000 valores negativos distribuidos entre los 3 campos
2. Transferir al worker con `ArrayBuffer` (Transferable) para rendimiento óptimo
3. Worker filtra negativos, luego calcula:
   - Promedio general de los 3 campos
   - Top 10 temperaturas más altas
   - Top 10 presiones más altas
   - Conteo de registros válidos y filtrados
4. Worker envía progreso en etapas (generación → filtrado → cálculo)
5. Resultado → dos listas Top 10 en columnas + card resumen
6. Botón `💾 EXPORTAR JSON` → `Blob` + `URL.createObjectURL` → descarga `resultados-portal.json`
7. `completeLevel(5)` → en lugar de Stage Clear normal, se muestra una **pantalla de victoria final**:
   - Overlay negro con borde dorado
   - Texto "MISIÓN CUMPLIDA" en grande (14px amarillo)
   - Subtexto "ACCESO AL SISTEMA RESTAURADO"
   - Score final total
   - Animación CSS de "★" parpadeantes
   - Botón `▶ JUGAR DE NUEVO` que reinicia `gameState` y vuelve al nivel 1

**Condición para avanzar:** estadísticas mostradas + UI no congelada durante el proceso

---

## 6. Sistema de Sonido (`audio.js`)

Todos los sonidos se generan con `OscillatorNode` + `GainNode` de Web Audio API. Sin archivos externos.

| Evento        | Tipo        | Descripción                                    |
|---------------|-------------|------------------------------------------------|
| `click`       | Sine 880Hz  | Bip corto 80ms al presionar cualquier botón    |
| `error`       | Sawtooth    | Buzz descendente 300Hz→100Hz, 300ms            |
| `complete`    | Square      | 4 notas ascendentes: C5-E5-G5-C6, 100ms cada una |
| `stageClear`  | Square      | Fanfare 8-bit de 8 notas, 600ms total          |
| `locked`      | Sine 200Hz  | Bip grave 150ms al intentar nivel bloqueado    |

`Audio.init()` crea el `AudioContext` en el primer gesto del usuario (requerimiento del navegador).

---

## 7. Componentes CSS Globales (`styles.css`)

- `.nes-screen` — contenedor con fondo sky-blue + scanlines
- `.nes-hud` — barra superior negra con border-bottom rojo
- `.nes-dialog` — caja negra con border blanco + outline negro + portrait absoluto
- `.nes-btn-primary / secondary / success / disabled` — botones pixel con sombra
- `.nes-progress-wrap / fill` — barra de progreso NES
- `.nes-stat-card` — card de estadísticas negra con border blanco
- `.nes-alert-error / success` — mensajes de estado
- `.nes-badge` — etiquetas de estado de nivel
- `.stage-clear-overlay` — overlay fullscreen negro para transición
- `.stage-clear-screen` — contenido STAGE CLEAR! centrado

---

## 8. Puntos de Calificación vs Implementación

| Nivel | Req. examen                          | Implementación                              |
|-------|--------------------------------------|---------------------------------------------|
| 1     | Lat/lng, permisos, errores           | `getCurrentPosition` + manejo de códigos    |
| 2     | Mapa, posición, círculo/línea/rect   | Canvas primitivas + conversión coord        |
| 3     | Video, foto, localStorage, errores   | `getUserMedia` + canvas capture + storage   |
| 4     | 20k datos, Worker, stats, progreso   | `postMessage` + progreso incremental        |
| 5     | 250k datos, filtro, top10, JSON      | `ArrayBuffer` transfer + Blob download      |

---

## 9. Notas de Implementación

- Los workers son archivos `.js` externos (no Blob inline) — necesario para XAMPP
- `AudioContext` se inicializa en el primer click del usuario, no en `DOMContentLoaded`
- Bootstrap se usa únicamente para las stat cards (clase `card`) y la barra de progreso como fallback — el resto es CSS custom NES
- `window.goToLevel(n)` expuesto globalmente para que el tutor revise cualquier nivel
- Datos de `gameState` persisten en memoria de sesión; no se usa localStorage excepto para las fotos del nivel 3
