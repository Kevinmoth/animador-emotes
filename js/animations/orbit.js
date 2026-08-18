class OrbitAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const radius = numOr(this.config.radius, 150);
    const orbits = parseFloat(this.config.orbits) || 1;
    const spinInternal = this.config.spinInternal !== false;

    const angle = t * Math.PI * 2 * orbits;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    // Rotación interna: la imagen "mira" hacia fuera del círculo
    const rotation = spinInternal ? -angle + Math.PI / 2 : 0;

    return { x, y, rotation, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 };
  }
}

registerAnimation(
  'orbit',
  'Orbit',
  'Movimiento circular alrededor del centro con rotación interna',
  OrbitAnimation,
  [
    { key: 'radius', label: 'Radio', type: 'slider', min: 40, max: 240, step: 10 },
    { key: 'orbits', label: 'Órbitas', type: 'slider', min: 1, max: 3, step: 1 },
    { key: 'spinInternal', label: 'Rotación interna', type: 'toggle' }
  ]
);