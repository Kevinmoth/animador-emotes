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

  drawFrameLayers(ctx, size, image, imageRect, frame) {
    this.clear(ctx, size);
    const layers = frame.layers || [];

    const drawLayer = (layer) => {
      ctx.save();
      ctx.translate(size / 2, size / 2);
      if (layer.rotation) ctx.rotate(layer.rotation);
      if (layer.skewX) ctx.transform(1, 0, Math.tan(layer.skewX || 0), 1, 0, 0);
      if (layer.skewY) ctx.transform(1, Math.tan(layer.skewY || 0), 0, 1, 0, 0);
      ctx.scale(layer.scaleX || 1, layer.scaleY || 1);
      ctx.translate(layer.x || 0, layer.y || 0);
      if (layer.offsetX || layer.offsetY) ctx.translate(layer.offsetX || 0, layer.offsetY || 0);
      if (typeof layer.alpha === 'number' && layer.alpha !== 1) ctx.globalAlpha = layer.alpha;
      if (layer.composite) ctx.globalCompositeOperation = layer.composite;
      if (layer.tint) {
        ctx.shadowColor = layer.tint;
        ctx.shadowBlur = layer.blur || 0;
      }
      ctx.drawImage(image, -imageRect.w / 2, -imageRect.h / 2, imageRect.w, imageRect.h);
      ctx.restore();
    };

    if (frame.layersBehind === true) {
      layers.forEach(drawLayer);
      drawLayer(frame);
    } else {
      drawLayer(frame);
      layers.forEach(drawLayer);
    }
  },

  drawSlices(ctx, size, image, imageRect, frame) {
    this.clear(ctx, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    if (frame.rotation) ctx.rotate(frame.rotation);
    if (frame.skewX) ctx.transform(1, 0, Math.tan(frame.skewX || 0), 1, 0, 0);
    if (frame.skewY) ctx.transform(1, Math.tan(frame.skewY || 0), 0, 1, 0, 0);
    ctx.scale(frame.scaleX, frame.scaleY);
    ctx.translate(frame.x || 0, frame.y || 0);

    const srcW = image.width, srcH = image.height;
    const dw = imageRect.w, dh = imageRect.h;
    for (const s of (frame.slices || [])) {
      ctx.save();
      if (s.skew) ctx.transform(1, 0, Math.tan(s.skew), 1, 0, 0);
      if (typeof s.alpha === 'number' && s.alpha !== 1) ctx.globalAlpha = s.alpha;
      const y0 = Math.max(0, Math.min(1, s.y));
      const h0 = Math.max(0.001, Math.min(1 - y0, s.h));
      ctx.drawImage(
        image,
        0, y0 * srcH, srcW, Math.max(1, h0 * srcH),
        -dw / 2 + (s.dx || 0), -dh / 2 + y0 * dh, dw, h0 * dh
      );
      ctx.restore();
    }
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