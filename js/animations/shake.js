class ShakeAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const intensity = numOr(this.config.intensity, 0.8);
    const frequency = numOr(this.config.frequency, 1.0);

    const max = intensity * 26;
    const decay = Math.exp(-t * 4);
    const amp = max * decay;

    const x = amp * Math.sin(t * frequency * Math.PI * 24);
    const y = amp * Math.cos(t * frequency * Math.PI * 16);
    const rotation = Math.sin(t * 18) * amp * 0.02;

    return { x, y, rotation, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 };
  }
}

registerAnimation(
  'shake',
  'Shake',
  'Vibración con amplitud decreciente (decay exponencial)',
  ShakeAnimation,
  [
    { key: 'intensity', label: 'Intensidad', type: 'slider', min: 0.1, max: 2, step: 0.1 },
    { key: 'frequency', label: 'Frecuencia', type: 'slider', min: 0.5, max: 2, step: 0.1 }
  ]
);