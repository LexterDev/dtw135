# Barra de Navegación de Niveles — Spec de Diseño
**Mejora de UI/UX** · DTW135 Parcial 3 · Grupo 10 · 2026-06-18

---

## 1. Contexto

El Escape Room ya tiene dos formas de saltar directamente a cualquier nivel sin completar los anteriores: el parámetro de URL `?nivel=N` y la función de consola `window.goToLevel(n)`. Ambas están pensadas para el docente, pero requieren que sepa de su existencia (no hay ninguna pista visual en pantalla). El docente pidió explícitamente una forma de saltar de nivel mediante botones visibles en la interfaz.

**Alcance explícito:** agrega una barra de navegación visible con 5 botones (uno por nivel), siempre presente en pantalla, que reutiliza la lógica de salto ya existente (`goToLevel(n)`). No cambia las reglas de progreso secuencial del juego normal (los botones "🔒 SIGUIENTE NIVEL" de cada nivel siguen exigiendo completar el nivel actual) — esta barra es un atajo adicional, no un reemplazo del flujo normal.

**Fuera de alcance (decidido explícitamente):**
- Los botones de la barra **nunca** quedan deshabilitados — los 5 son clickeables en todo momento, incluso si el nivel correspondiente no se ha visitado.
- Saltar a un nivel mediante esta barra **no** marca como completados los niveles que se omiten, ni otorga su puntaje. El HUD (puntaje/monedas) solo cambia cuando un nivel se completa jugándolo normalmente.
- No se agregan atajos de teclado ni gestos. Solo clic de botón.
- No reemplaza ni oculta los métodos existentes (`?nivel=N`, `goToLevel(n)` por consola) — los tres métodos conviven.

---

## 2. Diseño Visual

### Ubicación

Una barra nueva, delgada, fija en la parte superior, **justo debajo del HUD actual** (puntaje/mundo/vidas). Para lograr esto sin calcular manualmente la posición exacta en píxeles, el HUD existente (`#hud.nes-hud`) y la nueva barra (`#level-nav`) se envuelven en un contenedor común `#top-bar` que es el único elemento con `position:fixed` — ambos hijos quedan en flujo normal (bloque) y el navegador los apila automáticamente, uno debajo del otro.

### Contenido de la barra

```
NIVEL  [1] [2] [3] [4] [5]
```

- Etiqueta `NIVEL` a la izquierda, mismo estilo que `.hud-label` (texto blanco, mismo tamaño de fuente).
- 5 botones cuadrados (~28×28px), fuente `Press Start 2P`, centrados horizontalmente junto a la etiqueta.
- Fondo de la barra: negro, igual que el HUD. Borde inferior de 3px en rojo (`#E52521`), mismo lenguaje visual que el borde del HUD.

### Estados visuales de cada botón (vía clase modificadora, sin usar `disabled`)

| Estado | Clase CSS | Estilo | Significado |
|---|---|---|---|
| Nivel actual en pantalla | `.is-current` | fondo `#E52521` (rojo), texto blanco | "estás aquí" |
| Nivel ya completado (y no es el actual) | `.is-completed` | fondo `#43B047` (verde), texto blanco | "ya superado" |
| Ninguna de las anteriores (default) | *(sin clase extra)* | fondo `#2c2c2c`, texto `#aaa`, borde `#555` | "no visitado, pero accesible" |

Un botón puede tener como máximo un estado a la vez (si es el actual, manda `.is-current` aunque también esté completado).

### Accesibilidad

Cada botón lleva `title="Saltar al nivel N"` (tooltip nativo del navegador al pasar el mouse).

### Ajuste de layout existente

`.level-screen` aumenta su `padding-top` de `52px` a `92px` (estimado para acomodar la altura combinada del HUD + la nueva barra). Es un valor estimado a partir de la altura actual del HUD; si al probar en el navegador el contenido queda ligeramente tapado o con demasiado espacio, se ajusta ese valor — mismo enfoque iterativo que se usó para otros ajustes de píxeles en este proyecto.

---

## 3. Arquitectura / Integración

### HTML (`index.html`)

Envolver el HUD existente y agregar la barra nueva:

```html
<div id="top-bar">
  <div id="hud" class="nes-hud">
    ... (contenido actual del HUD, sin cambios) ...
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

### CSS (`css/styles.css`)

- Nueva regla `#top-bar`: `position:fixed; top:0; left:0; right:0; z-index:200;` (el `z-index:200` y `position:fixed` se mueven aquí desde `.nes-hud`, que ya no los necesita).
- `.nes-hud` pierde `position:fixed`, `top/left/right` y `z-index` (ahora los hereda del wrapper); conserva fondo, borde, padding y flex tal cual.
- Nueva regla `.level-nav`: `display:flex; align-items:center; justify-content:center; gap:8px; background:#000; border-bottom:3px solid #E52521; padding:6px 16px;`
- Nueva regla `.level-nav-btn`: botón cuadrado ~28×28px, `font-family:'Press Start 2P', monospace`, `font-size:9px`, `border:2px solid #fff`, `cursor:pointer`, fondo/color del estado default (`#2c2c2c` / `#aaa` / borde `#555` reemplazando el borde blanco en este estado).
- `.level-nav-btn.is-current`: fondo `#E52521`, color `#fff`, borde `#fff`.
- `.level-nav-btn.is-completed`: fondo `#43B047`, color `#fff`, borde `#fff`.
- `.level-screen`: `padding-top` de `52px` a `92px`.

### JavaScript (`js/game.js`)

- Nueva función `updateLevelNav()`: recorre los 5 `.level-nav-btn`, calcula su estado (`n === gameState.current` → `is-current`; si no, `gameState.levels[n-1].completed` → `is-completed`; si no, ninguna clase extra) y aplica `classList`.
- Se llama **dentro de `updateHUD()`**, justo después de actualizar el resto del HUD — `updateHUD()` ya se invoca en `showLevel()` (cada cambio de nivel) y en `completeLevel()` (cada vez que se completa uno), así que `updateLevelNav()` queda sincronizada sin tocar más puntos de llamada.
- Nueva función `initLevelNav()`: agrega un listener de `click` a cada uno de los 5 botones que reproduce `Audio.play('click')` y llama a `window.goToLevel(n)` (la misma función ya expuesta para el tutor — no se duplica lógica de navegación). Se invoca una vez desde el `DOMContentLoaded` existente en `game.js`, junto a la inicialización actual.

No se modifica `goToLevel`, `showLevel`, `completeLevel` ni `goToNextLevel` — la barra es puramente una nueva forma de invocar `goToLevel(n)`, que ya existía.

---

## 4. Notas de Implementación

- El wrapper `#top-bar` no debe interferir con el overlay de scanlines (`.level-screen::after`, `position:fixed; z-index:10`) ni con los overlays de Stage Clear/Victoria (`z-index:500/600`) — `#top-bar` mantiene `z-index:200`, igual que el HUD original, así que el orden de apilamiento no cambia.
- Verificar que `#hud` siga siendo encontrado por su `id` donde se usaba (`document.getElementById('hud-score')`, etc. — esos IDs están en los hijos del HUD, no en el wrapper, así que no cambian).
- Condición de "terminado": en cualquier nivel, la barra muestra los 5 botones con el estado correcto (actual en rojo, completados en verde, resto en gris), los 5 son clickeables siempre, y al hacer clic se navega instantáneamente sin afectar el puntaje ni el progreso de los niveles omitidos.
- Verificable manualmente: cargar el juego, completar el nivel 1, confirmar que su botón se pone verde y el del nivel 2 se pone rojo (actual); hacer clic en el botón "5" y confirmar que muestra el nivel 5 sin que el HUD haya otorgado puntaje de los niveles 2-4.
