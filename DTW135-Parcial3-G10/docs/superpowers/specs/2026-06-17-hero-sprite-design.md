# Personaje Héroe en los Diálogos — Spec de Diseño
**Mejora visual** · DTW135 Parcial 3 · Grupo 10 · 2026-06-17

---

## 1. Contexto

El Escape Room NES (5 niveles, ya implementado y commiteado) usa un emoji estático (📡🗺📷⚙⚡) como "retrato" en el cuadro de diálogo de cada nivel. Esta mejora reemplaza ese emoji por un personaje pixel-art (estilo héroe NES genérico, sin parecido directo a ninguna marca registrada) que se anima en reposo (idle), dando la sensación de que "el jugador" avanza de nivel en nivel.

**Alcance explícito:** puramente visual/CSS. No modifica `gameState`, `completeLevel`, `goToNextLevel`, ni ningún archivo JS existente. No introduce dependencias ni archivos nuevos — solo cambia `index.html` y `css/styles.css`.

**Fuera de alcance (decidido explícitamente):**
- Sin movimiento por teclado (flechas/espacio) — eso quedó descartado como demasiado complejo para el plazo del examen.
- Sin reacciones a completar nivel, errores, ni apariciones en Stage Clear/Victoria — solo animación idle constante.
- Sin variación de personaje por nivel — el mismo sprite aparece en los 5 niveles.

---

## 2. Diseño Visual (aprobado vía mockups)

### Sprite — grid SVG 16×18

Construido con `<rect>` (técnica de "pixel art" vectorial, sin imágenes externas), grid de 16 columnas × 18 filas, `shape-rendering: crispEdges` para bordes nítidos al escalar.

| Región | Color | Token |
|---|---|---|
| Gorra (corona + visera) | `#E52521` | Mario Red (ya existente) |
| Sombra de visera | `#C81E1E` | nuevo — `--hero-cap-shadow` |
| Piel (cara, manos) | `#F4B97A` | nuevo — `--hero-skin` |
| Ojos | `#222222` | nuevo — `--hero-eyes` |
| Bigote | `#6B3E1E` | nuevo — `--hero-mustache` |
| Camisa/hombros | `#E52521` | Mario Red (ya existente) |
| Overol + tirantes (cuerpo, piernas) | `#2A4B8D` (cuerpo) / `#E52521` (tirantes) | nuevo — `--hero-overalls` |
| Zapatos | `#5C3A21` | nuevo — `--hero-shoes` |

(Los nuevos tokens se documentan aquí porque no existían en la paleta original del proyecto; no reemplazan ningún token existente.)

### Animación idle

2 frames, sin easing (estilo NES auténtico — salto seco entre 2 posiciones, no interpolación suave):

```css
@keyframes idleBob {
  0%, 49%  { transform: translateY(0); }
  50%, 100% { transform: translateY(-4px); }
}
/* aplicado con: animation: idleBob 0.6s steps(1) infinite; */
```

### Tamaño y posición — confirmado vía mockup en contexto

El cuadro de retrato crece de 34×34px a **60×60px** (probado en 3 iteraciones: 34→48→60px, aprobado en la última). El sprite interno se escala a 46×52px dentro del cuadro, manteniendo el offset de posición existente (`top:-3px; left:-3px`, sobresaliendo ligeramente la esquina del diálogo, como ya hacía el emoji).

El padding-left del diálogo (`.nes-dialog`) crece de 44px a **70px** para mantener el mismo espacio entre el retrato agrandado y el texto.

---

## 3. Arquitectura / Integración

### Un solo `<symbol>`, reutilizado 5 veces

Para no duplicar los 23 `<rect>` del sprite en cada uno de los 5 niveles, se define una sola vez como `<symbol>` SVG oculto, justo después de la apertura de `<body>` en `index.html`:

```html
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
```

Cada uno de los 5 `<div class="portrait">...</div>` (uno por nivel) cambia de:
```html
<div class="portrait">📡</div>
```
a:
```html
<div class="portrait"><svg class="hero-sprite"><use href="#hero-idle"></use></svg></div>
```

(Mismo patrón para los otros 4 niveles — solo cambia el contenido interno del `.portrait`, no su clase ni posición.)

### Cambios en `css/styles.css`

- `.nes-dialog`: `padding-left` de `44px` a `70px`.
- `.nes-dialog .portrait`: `width`/`height` de `34px` a `60px`; se elimina `font-size: 18px` (ya no hay texto/emoji dentro, queda muerto).
- Nueva regla `.hero-sprite`: `width:46px; height:52px; shape-rendering:crispEdges; animation: idleBob 0.6s steps(1) infinite;`
- Nuevo `@keyframes idleBob` (ver sección 2).

No se toca ninguna otra regla existente (`.nes-dialog .portrait` mantiene su `background:#E52521`, `border:3px solid #fff`, `display:flex/align-items/justify-content` sin cambios — esos ya posicionan correctamente cualquier contenido interno, sea emoji o SVG).

---

## 4. Notas de Implementación

- El símbolo `<svg style="display:none">` debe ir en el HTML una sola vez (no por nivel) — verificar que las 5 referencias `<use href="#hero-idle">` apunten al mismo id.
- `shape-rendering: crispEdges` es necesario en el `<svg class="hero-sprite">` (no en el `<symbol>`) para que el escalado no difumine los pixeles.
- No requiere verificación con Web Workers/cámara/geolocalización — es un cambio puramente de marcado y estilos, verificable visualmente recargando cualquier nivel (incluyendo vía `goToLevel(n)` en consola).
- Condición de "terminado": los 5 niveles muestran el sprite animado en reposo, a 60×60px, sin que ningún `console.error` aparezca por símbolo no encontrado.
