const CanvasRenderer = {
  createCanvas(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
  },

  clear(ctx, size) {
    ctx.clearRect(0, 0, size, size);
  },

  drawFrame(ctx, size, image, imageRect, transform) {
    this.clear(ctx, size);
    ctx.save();

    ctx.translate(size / 2, size / 2);

    if (transform.rotation) ctx.rotate(transform.rotation);
    if (transform.skewX !== 0) ctx.transform(1, 0, Math.tan(transform.skewX || 0), 1, 0, 0);
    if (transform.skewY !== 0) ctx.transform(1, Math.tan(transform.skewY || 0), 0, 1, 0, 0);
    ctx.scale(transform.scaleX, transform.scaleY);
    ctx.translate(transform.x || 0, transform.y || 0);

    ctx.drawImage(
      image,
      -imageRect.w / 2,
      -imageRect.h / 2,
      imageRect.w,
      imageRect.h
    );

    ctx.restore();
  },

  renderToImage(canvas) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('No se pudo generar el blob'));
          resolve(blob);
        }, 'image/gif');
      } catch (err) {
        reject(err);
      }
    });
  }
};