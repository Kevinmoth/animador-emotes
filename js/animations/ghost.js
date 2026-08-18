class GhostAnimation extends BaseAnimation {
  _pose(tp) {
    const sway = numOr(this.config.sway, 0.35);
    const motion = Math.sin(tp * Math.PI * 2);
    return {
      x: motion * sway * 90,
      y: 0,
      rotation: motion * this._rock(tp) * 0.35
    };
  }

  _rock(tp) {
    return numOr(this.config.rock, 1);
  }

  getFrame(t) {
    t = this._t(t);
    const trails = Math.max(1, Math.min(8, parseInt(this.config.trails, 10) || 5));
    const fade = numOr(this.config.fade, 0.65);
    const delay = 0.035;

    const base = this._pose(t);
    const scaleBaseX = numOr(this.config.stretch, 1);

    const layers = [];
    for (let i = 1; i <= trails; i++) {
      const tp = Math.max(0, t - i * delay);
      const p = this._pose(tp);
      const alpha = Math.pow(fade, i) * 0.9;
      const shrink = 1 - i * 0.04;
      layers.push({
        x: p.x + i * 6 * (p.x < 0 ? 1 : -1) * 0.3,
        y: p.y,
        rotation: p.rotation,
        scaleX: scaleBaseX * shrink,
        scaleY: shrink,
        skewX: 0, skewY: 0,
        alpha
      });
    }

    return Object.assign({}, base, {
      scaleX: scaleBaseX, scaleY: 1, skewX: 0, skewY: 0,
      layersBehind: true,
      layers
    });
  }
}

registerAnimation(
  'ghost',
  'Ghost Trail',
  'Estela fantasma de poses anteriores con desvanecimiento',
  GhostAnimation,
  [
    { key: 'trails', label: 'Estelas', type: 'slider', min: 1, max: 8, step: 1 },
    { key: 'sway', label: 'Movimiento', type: 'slider', min: 0.1, max: 0.9, step: 0.05 },
    { key: 'rock', label: 'Balanceo', type: 'slider', min: 0.2, max: 2, step: 0.1 },
    { key: 'fade', label: 'Desvanecido', type: 'slider', min: 0.2, max: 0.9, step: 0.05 }
  ]
);