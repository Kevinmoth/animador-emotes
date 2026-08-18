class PulseAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const amplitude = numOr(this.config.amplitude, 0.1);
    const repetitions = parseInt(this.config.repetitions, 10) || 3;

    const wave = Math.sin(t * Math.PI * 2 * repetitions) * 0.5 + 0.5;
    const eased = Easing.easeInOutQuad(wave);

    const scale = 1 + eased * amplitude;

    return { x: 0, y: 0, rotation: 0, scaleX: scale, scaleY: scale, skewX: 0, skewY: 0 };
  }
}

registerAnimation(
  'pulse',
  'Pulse',
  'Pulsación de escala 100% → 110% → 100% con ease-in-out',
  PulseAnimation,
  [
    { key: 'amplitude', label: 'Amplitud', type: 'slider', min: 0.02, max: 0.35, step: 0.01 },
    { key: 'repetitions', label: 'Repeticiones', type: 'slider', min: 1, max: 6, step: 1 }
  ]
);