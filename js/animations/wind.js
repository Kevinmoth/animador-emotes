class WindAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const sway = numOr(this.config.sway, 0.5);
    const drop = numOr(this.config.drop, 1);
    const spin = numOr(this.config.spin, 1);
    const height = numOr(this.config.height, 150);

    const p = Math.min(1, t * Math.max(0.4, drop));
    const y = -height * (1 - Easing.easeInOutQuad(p));

    const wobble = Math.sin(p * Math.PI * 3) * p;
    const x = wobble * sway * 120 * (1 - p * 0.4);

    const rotation = Math.sin(p * Math.PI * 2) * spin * 0.5 * (1 - p * 0.5);

    return { x, y, rotation, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 };
  }
}

registerAnimation(
  'wind',
  'Viento',
  'Hoja que cae flotando con balanceo y giro',
  WindAnimation,
  [
    { key: 'height', label: 'Altura', type: 'slider', min: 80, max: 280, step: 10 },
    { key: 'drop', label: 'Velocidad', type: 'slider', min: 0.5, max: 2, step: 0.1 },
    { key: 'sway', label: 'Balanceo', type: 'slider', min: 0.1, max: 1, step: 0.05 },
    { key: 'spin', label: 'Giro', type: 'slider', min: 0.2, max: 2, step: 0.1 }
  ]
);