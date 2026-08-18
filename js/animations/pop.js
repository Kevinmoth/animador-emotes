class PopAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const power = numOr(this.config.power, 1.0);
    const overshoot = numOr(this.config.overshoot, 1.2);

    // Fase 1: contracción rápida (0.8)
    // Fase 2: expansión con overshoot (1.2) vía elastic
    // Fase 3: asentamiento a 1.0
    let scale;
    if (t < 0.15) {
      const local = t / 0.15;
      scale = 0.8 + (1 - 0.8) * Easing.easeOutQuad(local);
    } else if (t < 0.55) {
      const local = (t - 0.15) / 0.4;
      scale = 1 + (overshoot - 1) * Easing.easeOutElastic(local);
    } else {
      const local = (t - 0.55) / 0.45;
      scale = overshoot - (overshoot - 1) * Easing.easeInOutQuad(local);
    }

    scale = 0.8 + (scale - 0.8) * (0.6 + power * 0.4);

    // Movimiento outward sutil (partículas opcional simplificado)
    const outward = (t < 0.5) ? (t / 0.5) * 14 : (1 - t) * 14;

    return {
      x: 0,
      y: 0,
      rotation: Math.sin(t * Math.PI * 2) * 0.05 * power,
      scaleX: scale,
      scaleY: scale,
      skewX: 0,
      skewY: 0
    };
  }
}

registerAnimation(
  'pop',
  'Pop',
  'Explosión de escala: 0.8 → 1.2 → 1.0 con overshoot elástico',
  PopAnimation,
  [
    { key: 'power', label: 'Potencia', type: 'slider', min: 0.5, max: 2, step: 0.1 },
    { key: 'overshoot', label: 'Overshoot', type: 'slider', min: 1.05, max: 1.5, step: 0.05 }
  ]
);