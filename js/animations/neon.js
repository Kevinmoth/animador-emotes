const NEON_COLORS = {
  cyan: ['#00e5ff', '#00c8ff'],
  pink: ['#ff3df0', '#ff5cf0'],
  green: ['#39ff14', '#00ffa3'],
  gold: ['#ffe600', '#ffb300'],
  white: ['#ffffff', '#d0f0ff']
};

const NEON_COLOR_LABELS = {
  cyan: 'Cian',
  pink: 'Rosa',
  green: 'Verde',
  gold: 'Oro',
  white: 'Blanco'
};

class NeonAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const colorKey = this.config.color || 'cyan';
    const colors = NEON_COLORS[colorKey] || NEON_COLORS.cyan;
    const intensity = numOr(this.config.intensity, 1);
    const pulseFreq = Math.max(0.5, numOr(this.config.pulse, 2));

    const breathe = 0.55 + 0.45 * Math.sin(t * Math.PI * 2 * pulseFreq);
    const spread = 1 + 0.03 * intensity;

    const base = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 };

    return Object.assign({}, base, {
      layers: [
        Object.assign({}, base, {
          scaleX: spread, scaleY: spread,
          alpha: breathe * 0.5,
          tint: colors[0], blur: 34 * intensity, composite: 'lighter'
        }),
        Object.assign({}, base, {
          scaleX: spread * 0.98, scaleY: spread * 0.98,
          alpha: breathe * 0.7,
          tint: colors[1], blur: 18 * intensity, composite: 'lighter'
        }),
        Object.assign({}, base, {
          offsetX: -4, alpha: breathe * 0.85,
          tint: colors[1], composite: 'lighter'
        }),
        Object.assign({}, base, {
          offsetX: 4, alpha: breathe * 0.85,
          tint: colors[0], composite: 'lighter'
        })
      ]
    });
  }
}

registerAnimation(
  'neon',
  'Neon Glow',
  'Resplandor neón pulsante con split RGB (requiere exportación con fondo claro)',
  NeonAnimation,
  [
    {
      key: 'color', label: 'Color', type: 'select',
      options: Object.keys(NEON_COLORS).map(k => ({ value: k, label: NEON_COLOR_LABELS[k] }))
    },
    { key: 'intensity', label: 'Intensidad', type: 'slider', min: 0.4, max: 2, step: 0.1 },
    { key: 'pulse', label: 'Pulsos/s', type: 'slider', min: 0.5, max: 4, step: 0.5 }
  ]
);