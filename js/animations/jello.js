class JelloAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const stiffness = numOr(this.config.stiffness, 1.0);
    const damping = numOr(this.config.damping, 1.0);
    const intensity = numOr(this.config.intensity, 1.0);

    // Oscilación con decaimiento exponencial (settling)
    const oscillation = Math.sin(t * Math.PI * 6 * stiffness) * Math.exp(-t * 5 * damping);

    const scaleX = 1 + oscillation * intensity * 0.12;
    const scaleY = 1 - oscillation * intensity * 0.12;
    const rotation = Math.sin(t * Math.PI * 4 * stiffness) * oscillation * 0.15;

    return { x: 0, y: 0, rotation, scaleX, scaleY, skewX: oscillation * 0.1, skewY: 0 };
  }
}

registerAnimation(
  'jello',
  'Jello',
  'Deformación elástica con oscilación y settling',
  JelloAnimation,
  [
    { key: 'intensity', label: 'Intensidad', type: 'slider', min: 0.2, max: 2, step: 0.1 },
    { key: 'stiffness', label: 'Rigidez', type: 'slider', min: 0.5, max: 2, step: 0.1 },
    { key: 'damping', label: 'Damping', type: 'slider', min: 0.5, max: 2, step: 0.1 }
  ]
);