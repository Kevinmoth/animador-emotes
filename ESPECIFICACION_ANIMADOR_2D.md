# ESPECIFICACIÓN TÉCNICA: Animador 2D con Generación de GIF

## 1. DESCRIPCIÓN DEL PROYECTO

Herramienta web que permite cargar imágenes PNG 2D y aplicar animaciones predefinidas sofisticadas, generando archivos GIF animados descargables.

**Objetivo:** Proporcionar un flujo simple (carga → selecciona animación → descarga GIF) pero con animaciones cinematográficamente trabajadas.

---

## 2. REQUERIMIENTOS FUNCIONALES

### 2.1 Interfaz de Usuario

- [x] **Área de carga:** Drag & drop o input file para PNG
- [x] **Validación:** Max 10MB, solo PNG/JPG
- [x] **Preview en tiempo real:** Mostrar imagen cargada
- [x] **Selector de animaciones:** Lista con 8-10 animaciones disponibles
- [x] **Parámetros ajustables:**
  - Duración total (0.5s - 5s)
  - Velocidad (0.5x - 2x)
  - Intensity/amplitud (si aplica)
  - FPS para GIF (12, 24, 30, 60)
- [x] **Preview de animación:** Canvas mostrando preview antes de generar
- [x] **Botón generar:** Inicia proceso de generación
- [x] **Barra de progreso:** Feedback durante generación
- [x] **Descarga automática:** GIF generado

### 2.2 Animaciones Predefinidas

Cada animación debe tener:
- Timing cinematográfico (easing curves)
- Physics realista donde aplique
- Duración configurable
- Parámetros ajustables

**Animaciones a implementar:**

1. **Spin 360** (Rotación)
   - Rotación suave con ease-out
   - Puede tener wobble opcional
   - Parámetro: direction (CW/CCW)

2. **Bounce** (Rebote)
   - Movimiento vertical con physics
   - Damping realista (cada rebote menor)
   - Parámetro: altura del rebote, número de rebounds

3. **Shake** (Temblor)
   - Vibración horizontal/vertical
   - Amplitud decreciente (decay)
   - Parámetro: intensidad, frecuencia

4. **Pulse** (Pulsación)
   - Scale 100% → 110% → 100%
   - Suave con ease-in-out
   - Parámetro: amplitud del pulse, repeticiones

5. **Flip** (Volteo)
   - Rotación 3D simulada en 2D (skew + scale)
   - Giro horizontal o vertical
   - Parámetro: eje, velocidad

6. **Wave** (Onda)
   - Movimiento sinusoidal
   - Translación + rotación suave
   - Parámetro: amplitud, frecuencia

7. **Jello** (Gelatina)
   - Deformación elástica en los bordes
   - Oscilación y settling
   - Parámetro: rigidez, damping

8. **Orbit** (Órbita)
   - Movimiento circular alrededor del centro
   - Con rotación interna
   - Parámetro: radio, velocidad angular

9. **Tilt** (Inclinación)
   - Oscilación de rotación suave (±20°)
   - Movimiento pendular
   - Parámetro: ángulo máximo

10. **Pop** (Explosión)
    - Scale rápido: 0.8 → 1.2 → 1.0
    - Con movimiento outward de partículas (opcional)
    - Parámetro: velocidad, bounce count

---

## 3. REQUERIMIENTOS TÉCNICOS

### 3.1 Stack Recomendado

**Frontend:**
- HTML5 Canvas (rendering)
- JavaScript vanilla o React (interactividad)
- GSAP (animaciones) O Anime.js (alternativa)

**Librerías críticas:**
- `gif.js` - Generación de GIF desde Canvas
- `canvas-capture` O manual frame-by-frame

**Alternativa con WebGL:**
- Pixi.js (mejor rendimiento para animaciones)
- Three.js (si necesitas 3D simulado)

### 3.2 Arquitectura

```
/project
├── index.html          # UI principal
├── css/
│   └── styles.css      # Estilos responsive
├── js/
│   ├── main.js         # Lógica principal
│   ├── animator.js     # Motor de animaciones
│   ├── animations/
│   │   ├── spin.js
│   │   ├── bounce.js
│   │   ├── shake.js
│   │   ├── pulse.js
│   │   ├── flip.js
│   │   ├── wave.js
│   │   ├── jello.js
│   │   ├── orbit.js
│   │   ├── tilt.js
│   │   └── pop.js
│   ├── utils/
│   │   ├── easing.js   # Funciones de easing
│   │   ├── canvas-renderer.js
│   │   └── gif-generator.js
│   └── config.js       # Configuración global
└── lib/
    ├── gif.js
    └── gsap.min.js (opcional)
```

### 3.3 Flujo de Datos

```
Input Image (PNG)
    ↓
Validación & Carga en Canvas
    ↓
Seleccionar Animación
    ↓
Ajustar Parámetros (duración, velocidad, etc)
    ↓
Preview en Canvas (tiempo real)
    ↓
Generación de GIF:
    - Loop por cada frame necesario
    - Aplicar transformaciones según keyframe
    - Render a Canvas
    - Capturar frame
    - Agregar a GIF
    ↓
Exportar & Descargar
```

---

## 4. ESPECIFICACIONES TÉCNICAS DETALLADAS

### 4.1 Motor de Animaciones

**Estructura base de una animación:**

```javascript
class Animation {
  constructor(canvas, image, config = {}) {
    this.canvas = canvas;
    this.image = image;
    this.duration = config.duration || 1.5; // segundos
    this.speed = config.speed || 1.0;
    this.intensity = config.intensity || 1.0;
    this.easing = config.easing || 'easeInOutQuad';
  }

  // Retorna transformaciones (translation, rotation, scale, skew) en t [0,1]
  getFrame(t) {
    // t = progress (0 al 1)
    // Retorna: { x, y, rotation, scaleX, scaleY, skew }
  }

  render(ctx, progress) {
    // Limpia canvas
    // Aplica transformaciones según getFrame(progress)
    // Dibuja imagen
  }
}
```

### 4.2 Funciones de Easing

Implementar al menos:
- Linear
- EaseInQuad, EaseOutQuad, EaseInOutQuad
- EaseInCubic, EaseOutCubic, EaseInOutCubic
- EaseOutBounce, EaseOutElastic
- Custom cubic-bezier

### 4.3 Generación de GIF

**Proceso:**

```javascript
async function generateGIF(imageData, animation, config) {
  const fps = config.fps || 24;
  const duration = animation.duration * 1000; // ms
  const frameTime = 1000 / fps;
  const totalFrames = Math.ceil(duration / frameTime);
  
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: canvas.width,
    height: canvas.height,
    workerScript: 'gif.worker.js'
  });

  for (let i = 0; i < totalFrames; i++) {
    const progress = i / totalFrames;
    const canvas = renderFrame(animation, progress);
    gif.addFrame(canvas, { delay: frameTime });
  }

  gif.render(); // Async
  return gif.blob();
}
```

### 4.4 Canvas Setup

```javascript
const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');

// Tamaño: mantener aspecto de imagen
// Recomendado: 512x512 o 1024x1024 (balance calidad/performance)

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // O con fondo:
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function applyTransform(transform) {
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  
  if (transform.rotation) ctx.rotate(transform.rotation);
  if (transform.scaleX || transform.scaleY) {
    ctx.scale(transform.scaleX || 1, transform.scaleY || 1);
  }
  
  ctx.translate(transform.x || 0, transform.y || 0);
}

function drawImage(image) {
  ctx.drawImage(
    image,
    -image.width / 2,
    -image.height / 2
  );
}
```

---

## 5. DETALLES DE IMPLEMENTACIÓN POR ANIMACIÓN

### 5.1 SPIN (Rotación suave)

```javascript
// getFrame(t)
rotation = t * 360 * Math.PI / 180 * direction; // 0 a 2π
easing = easeOutQuad(t); // Desaceleración

// Opcional: wobble
wobble = Math.sin(t * Math.PI * 3) * 0.1; // pequeña oscilación
rotation += wobble;
```

### 5.2 BOUNCE (Rebote con physics)

```javascript
// Simular caída y rebotes decrecientes
const bounceCount = 4;
const bounceEasing = easeOutBounce(t);

// Posición vertical
y = bounceEasing * -200; // max height en pixels
scale = 1 - Math.abs(y) * 0.001; // aplasta al tocar suelo
```

### 5.3 SHAKE (Vibración decay)

```javascript
// Amplitud decreciente exponencial
amplitud = intensity * Math.exp(-t * 5);

// Vibración frecuente
x = amplitud * Math.sin(t * frequency * Math.PI * 20);
y = amplitud * Math.cos(t * frequency * Math.PI * 20);

rotation = Math.sin(t * 20) * amplitud * 0.3;
```

### 5.4 PULSE (Pulsación)

```javascript
const pulseWave = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
scaleX = 1 + pulseWave * intensity * 0.2;
scaleY = scaleX; // uniform scaling

// Ease in-out suave
easing = easeInOutQuad(t);
```

### 5.5 FLIP (Volteo 3D simulado)

```javascript
// Rotación X simulada con skew y scale
const flipProgress = easeInOutCubic(t);
const angle = flipProgress * Math.PI; // 0 a π

rotation = angle; // rotación en Z
scaleY = Math.cos(angle); // simula perspectiva
skewX = Math.sin(angle) * 0.2;
```

### 5.6 WAVE (Onda sinusoidal)

```javascript
// Movimiento circular
const angle = t * Math.PI * 2;
x = Math.cos(angle) * 100;
y = Math.sin(angle) * 100;

// Rotación que sigue el movimiento
rotation = angle * 0.5;

// Escala suave
scale = 1 + Math.sin(t * Math.PI * 2) * 0.1;
```

### 5.7 JELLO (Efecto gelatina)

```javascript
// Combinar deformación + oscilación
const oscillation = Math.sin(t * Math.PI * 4) * Math.exp(-t * 3);

scaleX = 1 + oscillation * intensity * 0.15;
scaleY = 1 - oscillation * intensity * 0.15; // inverse scale

rotation = Math.sin(t * Math.PI * 3) * oscillation * 0.2;
```

---

## 6. ESPECIFICACIONES UI/UX

### 6.1 Responsive Design

- Desktop: Canvas 512px, controles lado derecho
- Mobile: Canvas full-width, controles abajo
- Mínimo: 320px de ancho

### 6.2 Estados

1. **Inicial:** Área de upload vacía
2. **Cargando imagen:** Loading spinner
3. **Imagen cargada:** Preview + opciones animación
4. **Animación seleccionada:** Preview en vivo de animación
5. **Generando GIF:** Barra de progreso
6. **Completado:** Botón descargar activo

### 6.3 Validaciones

- Máximo 10MB
- Solo PNG/JPG/JPEG
- Resolución mínima: 64x64px
- Resolución máxima: 4096x4096px (warning)

---

## 7. CONSIDERACIONES DE PERFORMANCE

### 7.1 Optimizaciones

- **Canvas size:** No mayor a 1024x1024 para GIF rápido
- **FPS reasonable:** Default 24fps (suficiente para smoothness)
- **Web Workers:** Para generación de GIF (no bloquea UI)
- **Lazy loading:** Librerias se cargan on-demand

### 7.2 Benchmarks esperados

- Carga imagen: < 100ms
- Preview animación: 60fps
- Generación GIF (1s, 24fps, 512px): 3-8 segundos

---

## 8. DEPENDENCIAS RECOMENDADAS

```json
{
  "dependencies": {
    "gif.js": "^0.2.0",
    "gsap": "^3.12.0" // Opcional, simplifica animaciones
  },
  "devDependencies": {
    "webpack": "^5.0.0",
    "babel": "^7.0.0"
  }
}
```

**Alternativa sin dependencias:**
- Implementar easing manualmente
- Usar Canvas API puro
- GIF.js como única dependencia externa

---

## 9. PLAN DE IMPLEMENTACIÓN

### Fase 1: Base
- [x] Estructura HTML + CSS
- [x] Sistema de carga de imágenes
- [x] Canvas setup

### Fase 2: Animaciones Core
- [x] Motor de animaciones base
- [x] Funciones de easing
- [x] Implementar 3-4 animaciones básicas (Spin, Bounce, Pulse, Shake)

### Fase 3: Generación GIF
- [x] Integrar gif.js
- [x] Captura frame-by-frame
- [x] Exportar y descargar

### Fase 4: Animaciones Avanzadas
- [x] Implementar resto de animaciones (Flip, Wave, Jello, Orbit, Tilt, Pop)
- [x] Parámetros ajustables por animación

### Fase 5: Polish
- [x] Preview en tiempo real
- [x] Barra de progreso
- [x] Validaciones
- [x] Responsive design
- [x] Optimizaciones de performance

### Fase 6: Testing & Deploy
- [x] Testing en múltiples navegadores
- [x] Optimización final
- [ ] Despliegue

---

## 10. REFERENCIAS Y RECURSOS

### Easing Functions
- https://easings.net/
- https://cubic-bezier.com/

### Canvas & Animation
- MDN Canvas API
- Canvas animation techniques
- RequestAnimationFrame patterns

### GIF Generation
- gif.js documentation
- Canvas-to-blob conversion

### Physics & Math
- Bouncing ball physics
- Harmonic motion (sin/cos waves)
- Damping curves (exponential decay)

---

## 11. NOTAS ADICIONALES

- **Transparencia:** Mantener PNG transparencia en GIF (usar gif.js con render_method 'canvas')
- **Antialiasing:** Canvas suaviza automáticamente, pero considerar context.imageSmoothingEnabled
- **Rotación animada:** Siempre usar radianes internamente (convertir a grados solo para display)
- **Performance:** Si es lento, reducir resolución canvas o FPS
- **Cross-browser:** Probar en Chrome, Firefox, Safari (Canvas debería funcionar en todos)

---

**Versión:** 1.0  
**Fecha:** 2026-08-18  
**Estado:** Especificación Completa
