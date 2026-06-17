# Nubes Flotantes de Fondo — Spec de Diseño
**Mejora visual** · DTW135 Parcial 3 · Grupo 10 · 2026-06-17

---

## 1. Contexto

El Escape Room NES ya tiene el sprite animado del héroe en los diálogos (ver `docs/superpowers/specs/2026-06-17-hero-sprite-design.md`). Esta mejora agrega nubes pixel-art estilo NES flotando lentamente de izquierda a derecha en el fondo de cada una de las 5 pantallas de nivel, reforzando la estética "cielo de Mario Bros".

**Alcance explícito:** puramente visual/CSS, igual que el sprite del héroe. No modifica `gameState`, ningún archivo JS, ni la lógica de ningún nivel.

**Fuera de alcance:**
- Sin generación aleatoria de posiciones/cantidad por JS — son elementos estáticos en el HTML con animación 100% CSS.
- Sin parallax real ligado al scroll (esta app no tiene scroll) — la sensación de profundidad se simula solo con 2 tamaños/velocidades distintos.

---

## 2. Diseño Visual (aprobado vía mockups)

### Forma — Opción A "Clásica NES (2 bultos)"

Grid SVG 24×9, misma técnica que el héroe (`<rect>`, sin imágenes), `shape-rendering: crispEdges`:

| Región | Color |
|---|---|
| Cuerpo de la nube | `#FFFFFF` |
| Sombra inferior (silueta plana de abajo) | `#C9DDF5` (nuevo token — `--cloud-shadow`) |

### Dos profundidades por nivel

| | Lejana (`.cloud-far`) | Cercana (`.cloud-near`) |
|---|---|---|
| Ancho | 90px | 150px |
| Alto | 34px | 56px |
| Posición vertical (`top`) | 60px | 115px |
| Duración del loop | 42s (lenta) | 24s (más rápida) |

(Cercana = más grande y más rápida; lejana = más chica y más lenta — simula profundidad sin parallax real.)

### Animación

```css
@keyframes cloudDrift {
  0%   { left: -20%; }
  100% { left: 120%; }
}
/* aplicado con: animation: cloudDrift <duración> linear infinite; */
```
`linear` (no easing) — movimiento de flotación constante, no un salto NES como el idle del héroe.

---

## 3. Arquitectura / Integración

### Un solo `<symbol>` adicional, reutilizado 10 veces (2 por nivel × 5 niveles)

Se agrega como hermano de `#hero-idle`, dentro del mismo `<svg style="display:none">` ya existente en `index.html` (no se crea un wrapper nuevo):

```html
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
```

### Markup por nivel

Cada uno de los 5 `<section id="level-N" class="level-screen">` recibe, justo después de la etiqueta de apertura y antes de `<div class="screen-body">`, estas 2 líneas (idénticas en los 5 niveles — mismas clases, mismo `<use>`):

```html
<svg class="cloud-sprite cloud-far"><use href="#cloud-a"></use></svg>
<svg class="cloud-sprite cloud-near"><use href="#cloud-a"></use></svg>
```

### CSS nuevo en `css/styles.css`

```css
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

### Capas (z-index)

`.cloud-sprite` no define `z-index` (queda en `auto`). Como `.level-screen::after` (scanlines) ya usa `z-index: 10` y `.screen-body` ya usa `z-index: 20`, las nubes — sin z-index explícito, hijas directas de `.level-screen` (que es `position: relative`) — quedan automáticamente por debajo de ambas en el stacking context, sin tocar ninguna regla existente.

---

## 4. Notas de Implementación

- El `<symbol id="cloud-a">` va UNA sola vez, junto a `#hero-idle` dentro del mismo `<svg style="display:none">` — nunca duplicado por nivel.
- Las clases `.cloud-far` / `.cloud-near` se definen una sola vez en `css/styles.css` y se reutilizan idénticas en los 5 niveles — ningún nivel necesita CSS propio para sus nubes.
- `pointer-events: none` evita que las nubes intercepten clics sobre el diálogo o los botones que puedan quedar debajo en algún viewport.
- Verificación: puramente visual, igual que el sprite del héroe — recargar cualquier nivel (incluso vía `goToLevel(n)`) y confirmar que ambas nubes están flotando de izquierda a derecha en loop, sin tapar el diálogo ni los botones, y que no hay errores en consola.
- Condición de "terminado": los 5 niveles muestran 2 nubes cada uno, flotando en loop continuo, visualmente detrás de todo el contenido interactivo.
