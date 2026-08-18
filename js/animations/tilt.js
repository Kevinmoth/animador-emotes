class TiltAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const maxAngleRaw = numOr(this.config.maxAngle, 20);
    const maxAngle = (maxAngleRaw * Math.PI) / 180;
    const cycles = parseInt(this.config.cycles, 10) || 1;

    // Movimiento pendular: cos va de 1 → -1 → 1 suavemente
    const pendulum = Math.cos(t * Math.PI * 2 * cycles);
    const eased = Easing.easeInOutQuad((pendulum + 1) / 2);
    const rotation = -maxAngle + eased * maxAngle * 2;

    return { x: 0, y: 0, rotation, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 };
  }
}

registerAnimation(
  'tilt',
  'Tilt',
  'Oscilación pendular de rotación suave',
  TiltAnimation,
  [
    { key: 'maxAngle', label: 'Ángulo máx (°)', type: 'slider', min: 5, max: 45, step: 1 },
    { key: 'cycles', label: 'Ciclos', type: 'slider', min: 1, max: 4, step: 1 }
  ]
);