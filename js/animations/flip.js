class FlipAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const axis = this.config.axis || 'horizontal';
    const flips = parseInt(this.config.flips, 10) || 1;

    const progress = t * flips;
    const seg = progress - Math.floor(progress);
    const flipProgress = Easing.easeInOutCubic(seg);
    const angle = flipProgress * Math.PI;

    const cos = Math.cos(angle);
    const scale = Math.abs(cos);
    const skew = Math.sin(angle) * 0.25;

    let scaleX = 1, scaleY = 1, skewX = 0, skewY = 0;

    if (axis === 'horizontal') {
      scaleX = scale;
      skewX = skew * (cos < 0 ? -1 : 1);
    } else {
      scaleY = scale;
      skewY = skew * (cos < 0 ? -1 : 1);
    }

    return { x: 0, y: 0, rotation: 0, scaleX, scaleY, skewX, skewY };
  }
}

registerAnimation(
  'flip',
  'Flip',
  'Volteo 3D simulado en 2D (skew + scale)',
  FlipAnimation,
  [
    {
      key: 'axis', label: 'Eje', type: 'select',
      options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }]
    },
    { key: 'flips', label: 'Nº de volteos', type: 'slider', min: 1, max: 3, step: 1 }
  ]
);