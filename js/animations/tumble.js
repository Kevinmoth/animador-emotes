class TumbleAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const axis = this.config.axis || 'horizontal';
    const turns = Math.max(1, Math.min(4, parseInt(this.config.turns, 10) || 2));
    const perspective = numOr(this.config.perspective, 0.6);
    const tilt = numOr(this.config.tilt, 0.3);

    const progress = t * turns;
    const seg = progress - Math.floor(progress);
    const angle = Easing.easeInOutQuad(seg) * Math.PI;

    const cos = Math.cos(angle);
    const scale = Math.abs(cos);
    let skew = Math.sin(angle) * perspective * 0.6 * (cos < 0 ? -1 : 1);
    let scaleX = 1, scaleY = 1, skewX = 0, skewY = 0;

    if (axis === 'horizontal') {
      scaleX = scale;
      skewX = skew;
    } else {
      scaleY = scale;
      skewY = skew;
    }

    const rotation = tilt * Math.sin(progress * Math.PI);

    return { x: 0, y: 0, rotation, scaleX, scaleY, skewX, skewY };
  }
}

registerAnimation(
  'tumble',
  'Tumble 3D',
  'Volteo 3D continuo con skew de perspectiva y balanceo de cámara',
  TumbleAnimation,
  [
    {
      key: 'axis', label: 'Eje', type: 'select',
      options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }]
    },
    { key: 'turns', label: 'Vueltas', type: 'slider', min: 1, max: 4, step: 1 },
    { key: 'perspective', label: 'Perspectiva', type: 'slider', min: 0.1, max: 1, step: 0.05 },
    { key: 'tilt', label: 'Balanceo cámara', type: 'slider', min: 0, max: 0.9, step: 0.05 }
  ]
);