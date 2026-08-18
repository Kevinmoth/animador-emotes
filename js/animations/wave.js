class WaveAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const amplitude = numOr(this.config.amplitude, 100);
    const frequency = numOr(this.config.frequency, 1.0);

    const angle = t * Math.PI * 2 * frequency;
    const x = Math.cos(angle) * amplitude * 0.8;
    const y = Math.sin(angle) * amplitude * 0.5;

    // Rotación que sigue el movimiento (tangente) + inclinación suave
    const rotation = Math.cos(angle) * 0.25;
    const scale = 1 + Math.sin(angle * 2) * 0.06;

    return { x, y, rotation, scaleX: scale, scaleY: scale, skewX: 0, skewY: 0 };
  }
}

registerAnimation(
  'wave',
  'Wave',
  'Movimiento sinusoidal con translación y rotación suave',
  WaveAnimation,
  [
    { key: 'amplitude', label: 'Amplitud', type: 'slider', min: 20, max: 200, step: 10 },
    { key: 'frequency', label: 'Frecuencia', type: 'slider', min: 0.5, max: 3, step: 0.5 }
  ]
);