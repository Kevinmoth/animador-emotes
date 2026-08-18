class SpinAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const direction = this.config.direction === 'CCW' ? -1 : 1;
    const wobbleEnabled = this.config.wobble !== false;
    const spins = parseFloat(this.config.spins) || 1;

    const eased = Easing.easeOutQuad(t);
    let rotation = spins * 2 * Math.PI * eased * direction;

    if (wobbleEnabled) {
      const wobble = Math.sin(t * Math.PI * 3) * 0.1 * (1 - t);
      rotation += wobble * direction;
    }

    return { x: 0, y: 0, rotation, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 };
  }
}

registerAnimation(
  'spin',
  'Spin 360',
  'Rotación suave con desaceleración y wobble opcional',
  SpinAnimation,
  [
    {
      key: 'direction', label: 'Dirección', type: 'select',
      options: [{ value: 'CW', label: 'Sentido horario' }, { value: 'CCW', label: 'Anti-horario' }]
    },
    { key: 'spins', label: 'Nº de vueltas', type: 'slider', min: 1, max: 3, step: 1 },
    { key: 'wobble', label: 'Wobble', type: 'toggle' }
  ]
);