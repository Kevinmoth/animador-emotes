class SquashBounceAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const height = numOr(this.config.height, 150);
    const squash = numOr(this.config.squash, 0.5);
    const decay = numOr(this.config.decay, 0.62);
    const spin = numOr(this.config.spin, 0.5);
    const nBounces = Math.max(1, Math.min(4, parseInt(this.config.bounces, 10) || 3));

    const tFall = 0.18;
    const durImpact = 0.07;
    const durRebound = Math.max(0.05, (1 - tFall - durImpact * nBounces) / nBounces);

    const segments = [];
    segments.push({ type: 'fall', start: 0, end: tFall, h: height });
    let cur = tFall;
    for (let i = 0; i < nBounces; i++) {
      segments.push({ type: 'rebound', start: cur, end: cur + durRebound, h: height * Math.pow(decay, i) });
      cur += durRebound;
      segments.push({ type: 'impact', start: cur, end: cur + durImpact, strength: squash * Math.pow(decay, i) });
      cur += durImpact;
    }
    // reposo final: todo lo posterior a 'cur'

    let seg = segments[segments.length - 1];
    for (const s of segments) {
      if (t >= s.start && t < s.end) { seg = s; break; }
    }

    const p = Math.max(0, Math.min(1, (t - seg.start) / Math.max(1e-6, seg.end - seg.start)));
    let y = 0, scaleX = 1, scaleY = 1, rotation = 0;

    if (seg.type === 'fall') {
      y = -seg.h * (1 - p * p);
      rotation = spin * p * Math.PI;
    } else if (seg.type === 'rebound') {
      const reboundScale = 1 + spin * 0.3;
      scaleX = reboundScale;
      scaleY = reboundScale;
      if (p < 0.5) {
        const q = p / 0.5;
        y = -seg.h * Easing.easeOutCubic(q);
      } else {
        const q = (p - 0.5) / 0.5;
        y = -seg.h * (1 - Easing.easeInCubic(q));
      }
    } else if (seg.type === 'impact') {
      const sq = Math.sin(p * Math.PI);
      scaleY = 1 - seg.strength * sq;
      scaleX = 1 + seg.strength * 0.6 * sq;
    }

    return { x: 0, y, rotation, scaleX, scaleY, skewX: 0, skewY: 0 };
  }
}

registerAnimation(
  'squash',
  'Squash-Bounce',
  'Caída con rebotes decrecientes y deformación squash al impacto',
  SquashBounceAnimation,
  [
    { key: 'height', label: 'Altura de caída', type: 'slider', min: 60, max: 280, step: 10 },
    { key: 'bounces', label: 'Rebotes', type: 'slider', min: 1, max: 4, step: 1 },
    { key: 'squash', label: 'Squash', type: 'slider', min: 0.2, max: 0.85, step: 0.05 },
    { key: 'decay', label: 'Caída rebotes', type: 'slider', min: 0.3, max: 0.9, step: 0.05 },
    { key: 'spin', label: 'Giro en caída', type: 'slider', min: 0, max: 2, step: 0.1 }
  ]
);