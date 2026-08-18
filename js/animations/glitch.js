class GlitchAnimation extends BaseAnimation {
  hash(n) {
    const x = Math.sin(n) * 43758.5453;
    return x - Math.floor(x);
  }

  getFrame(t) {
    t = this._t(t);
    const amount = numOr(this.config.amount, 0.5);
    const blocks = Math.max(2, Math.min(12, parseInt(this.config.blocks, 10) || 6));

    const slices = [];
    let covered = 0;
    for (let i = 0; i < blocks && covered < 0.97; i++) {
      const r0 = this.hash(t * (blocks * 7.31) + i * 101.7 + 0.37);
      const y = covered + r0 * 0.08;
      const h = 0.03 + this.hash(t * 13.7 + i * 53.3) * 0.1;
      const dx = (this.hash(t * 29.9 + i * 17.2) - 0.5) * amount * 2 * 26;
      const skew = (this.hash(t * 41.7 + i * 3.9 + 7) - 0.5) * 0.06 * amount;
      const alpha = 0.55 + 0.45 * this.hash(t * 61.3 + i * 89.1);
      slices.push({ y, h, dx, skew, alpha });
      covered = y + h;
    }

    const jitter = (this.hash(t * 97.1) - 0.5) * amount * 14;
    const rotation = (this.hash(t * 6.3) - 0.5) * 0.02 * amount;
    const scaleY = 1 + (this.hash(t * 21.7 + 5) - 0.5) * 0.01 * amount;

    return {
      x: jitter, y: 0, rotation, scaleX: 1, scaleY, skewX: 0, skewY: 0,
      slices
    };
  }
}

registerAnimation(
  'glitch',
  'Glitch CRT',
  'Cortes y desplazamientos aleatorios deterministas estilo señal rota',
  GlitchAnimation,
  [
    { key: 'amount', label: 'Cantidad', type: 'slider', min: 0.1, max: 1, step: 0.05 },
    { key: 'blocks', label: 'Franjas', type: 'slider', min: 2, max: 12, step: 1 }
  ]
);