const CONFIG = {
  version: '1.0.0',
  canvasSize: 512,
  canvasMaxSize: 1024,
  defaultDuration: 1.5,
  durationRange: [0.5, 5],
  defaultSpeed: 1.0,
  speedRange: [0.5, 2],
  defaultFps: 24,
  fpsOptions: [12, 24, 30, 60],
  maxFileSizeMB: 10,
  acceptedTypes: ['image/png', 'image/jpeg'],
  minResolution: 64,
  maxResolution: 4096,
  gifOptions: {
    workers: 2,
    quality: 10,
    workerScript: 'lib/gif.worker.js'
  }
};

// Devuelve el primer valor numérico válido: si value no es un número finito, usa fallback
function numOr(value, fallback) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}