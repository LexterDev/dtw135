# La Cámara de los Cinco Desafíos — Escape Room JS

Proyecto de **DTW135 – Desarrollo y Técnicas de Aplicaciones Web**, Universidad de El Salvador, Ciclo I 2026. Parcial 3 — Grupo 10.

Aplicación web tipo "Escape Room" con 5 niveles consecutivos. El usuario debe superar cada nivel en orden para recuperar el acceso a un sistema ficticio de ciudad inteligente.

## Stack y restricciones

- **Permitido:** HTML5, CSS3, Bootstrap, JavaScript vanilla (ES6)
- **Prohibido:** Frameworks, backend, base de datos, librerías externas de Canvas o Mapas
- Todo el código corre en el navegador, sin servidor — el proyecto se sirve desde XAMPP para evitar restricciones de `file://` con la cámara/geolocalización/Web Workers

## Cómo ejecutarlo

1. Copiar/clonar el proyecto dentro de `htdocs` de XAMPP.
2. Iniciar Apache desde el Panel de Control de XAMPP.
3. Abrir `http://localhost/<ruta-al-proyecto>/` en el navegador.

## Los 5 niveles

| Nivel | Mundo | Nombre | API | Peso |
|-------|-------|--------|-----|------|
| 1 | W1-1 | El Guardián de la Ubicación | Geolocation | 15% |
| 2 | W1-2 | El Cartógrafo Perdido | Canvas | 15% |
| 3 | W1-3 | La Evidencia del Explorador | MediaDevices (cámara) | 20% |
| 4 | W2-1 | El Núcleo de Procesamiento | Web Worker (20,000 registros) | 25% |
| 5 | W2-2 | El Portal Cuántico | Web Worker (250,000 registros) | 25% |

Cada nivel debe completarse para desbloquear el siguiente. Al completar un nivel se reproduce una transición "Stage Clear" y se otorgan puntos.

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

Ambos métodos muestran el nivel completo y funcional (incluyendo niveles ya completados, que conservan su estado final visible).

## Estructura del proyecto

```
index.html          Página principal con los 5 niveles
css/styles.css       Estilos personalizados (sistema de diseño NES)
js/
  game.js            Estado global, navegación entre niveles, HUD
  audio.js            Motor de sonido (Web Audio API)
  level1.js .. level5.js   Lógica de cada nivel
workers/
  worker4.js          Procesamiento del Nivel 4 (20k registros)
  worker5.js          Procesamiento del Nivel 5 (250k registros)
docs/                Documentación del examen y specs/planes de diseño
```
