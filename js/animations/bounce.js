class BounceAnimation extends BaseAnimation {
  getFrame(t) {
    t = this._t(t);
    const height = numOr(this.config.height, 180);
    const rebounds = parseInt(this.config.rebounds, 10) || 2;

    // Cada rebote usa el easing easeOutBounce en el tramo de tiempo correspondiente
    const seg = Math.min(rebounds, t * rebounds);
    const local = seg - Math.floor(seg);
    const bounceEased = Easing.easeOutBounce(local);

    // Altura relativa: el primer rebote es el alto, los siguientes van bajando
    const decay = Math.pow(1 - 0.45, Math.floor(seg));
    const maxH = height * decay;
    const y = bounceEased * -maxH;

    // Squash & stretch al impactar
    const impact = Math.abs(Math.sin(t * Math.PI * 2 * 1.5));
    const squashStrength = (1 - t * 0.35); // los primeros impactos son más fuertes
    const squash = Math.max(0.7, 1 - impact * 0.14 * squashStrength);

    return {
      x: 0,
      y: y * 0.62,
      rotation: 0,
      scaleX: 1 + (1 - squash) * 1.3,
      scaleY: squash,
      skewX: 0,
      skewY: 0
    };
  }
}

registerAnimation(
  'bounce',
  'Bounce',
  'Rebote con física: cada rebote menor con damping realista y squash & stretch',
  BounceAnimation,
  [
    { key: 'height', label: 'Altura', type: 'slider', min: 60, max: 320, step: 10 },
    { key: 'rebounds', label: 'Nº de rebotes', type: 'slider', min: 1, max: 5, step: 1 }
  ]
);