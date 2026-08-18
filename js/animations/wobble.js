class WobbleAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const distance = numOr(this.config.distance, 140);
    const wobble = numOr(this.config.wobble, 0.6);
    const direction = (this.config.direction || 'left') === 'right' ? 1 : -1;

    const enter = 0.35;
    let x = 0, rotation = 0, scaleX = 1, scaleY = 1;

    if (t < enter) {
      // Entrada acelerada hacia el centro
      const p = t / enter;
      x = direction * distance * (1 - Easing.easeInQuad(p));
      rotation = direction * Easing.easeInQuad(p) * 0.8;
    } else {
      // Wobble magnético: overshoot amortiguado al pegarse
      const q = (t - enter) / (1 - enter);
      const osc = Math.sin(q * Math.PI * 2) * Math.exp(-q * 2.6);
      x = direction * distance * 0.12 * osc;
      rotation = osc * wobble;
      scaleX = 1 + osc * wobble * 0.08;
      scaleY = 1 - osc * wobble * 0.08;
    }

    return { x, y: 0, rotation, scaleX, scaleY, skewX: 0, skewY: 0 };
  }
}

registerAnimation(
  'wobble_magnet',
  'Wobble Magnético',
  'Entrada acelerada al centro con impacto y wobble amortiguado',
  WobbleAnimation,
  [
    { key: 'distance', label: 'Distancia', type: 'slider', min: 40, max: 250, step: 10 },
    { key: 'wobble', label: 'Wobble', type: 'slider', min: 0.1, max: 1.2, step: 0.05 },
    {
      key: 'direction', label: 'Lado', type: 'select',
      options: [{ value: 'left', label: 'Izquierda' }, { value: 'right', label: 'Derecha' }]
    }
  ]
);