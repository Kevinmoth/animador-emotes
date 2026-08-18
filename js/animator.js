class Animator {
  constructor(canvas, image, animation, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.image = image;
    this.animation = animation;
    this.status = 'idle';
    this.animationId = null;
    this.onProgress = config.onProgress || (() => {});
    this.onComplete = config.onComplete || (() => {});

    // Fixed progress (0..1) — used for GIF export
    this.exportProgress = config.exportProgress || null;
    this.loopProgress = config.loopProgress || false;
  }

  setAnimation(animation) {
    this.animation = animation;
  }

  start() {
    if (this.status === 'running') return;
    this.status = 'running';
    const startTime = performance.now();
    const duration = this.animation.getDuration();
    const speed = this.animation.getSpeed();

    const loop = (now) => {
      if (this.status !== 'running') return;
      const elapsed = (now - startTime) / 1000;
      const raw = (elapsed * speed) % duration;
      const progress = Math.min(raw / duration, 1);

      this.renderFrame(progress);
      this.onProgress(progress);

      if (elapsed * speed < duration) {
        this.animationId = requestAnimationFrame(loop);
      } else {
        this.stop();
        this.onComplete();
      }
    };

    this.animationId = requestAnimationFrame(loop);
  }

  renderFrame(progress) {
    const frame = this.animation.getFrame(progress);
    const imageRect = this._fitImage();
    if (frame.slices && frame.slices.length) {
      CanvasRenderer.drawSlices(this.ctx, this.canvas.width, this.image, imageRect, frame);
    } else if (frame.layers && frame.layers.length) {
      CanvasRenderer.drawFrameLayers(this.ctx, this.canvas.width, this.image, imageRect, frame);
    } else {
      CanvasRenderer.drawFrame(this.ctx, this.canvas.width, this.image, imageRect, frame);
    }
    return frame;
  }

  renderExportFrame(progress) {
    return this.renderFrame(progress);
  }

  stop() {
    this.status = 'idle';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  _fitImage() {
    const size = this.canvas.width;
    const padding = size * 0.06;
    const avail = size - padding * 2;
    const ratio = Math.min(avail / this.image.width, avail / this.image.height);
    return {
      w: this.image.width * ratio,
      h: this.image.height * ratio
    };
  }
}