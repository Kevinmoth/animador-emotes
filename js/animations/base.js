class BaseAnimation {
  constructor(config = {}) {
    this.config = config || {};
  }

  getDuration() {
    const duration = parseFloat(this.config.duration) || CONFIG.defaultDuration;
    const speed = parseFloat(this.config.speed) || CONFIG.defaultSpeed;
    return Math.max(0.1, duration / speed);
  }

  getSpeed() {
    return parseFloat(this.config.speed) || CONFIG.defaultSpeed;
  }

  getDurationMs() {
    return this.getDuration() * 1000;
  }

  getFrame(t) {
    return { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 };
  }

  _t(t) {
    return Math.min(1, Math.max(0, t));
  }
}

const AnimationRegistry = {};
function registerAnimation(id, label, description, AnimationClass, params) {
  AnimationRegistry[id] = {
    id,
    label,
    description,
    AnimationClass,
    params: params || []
  };
}