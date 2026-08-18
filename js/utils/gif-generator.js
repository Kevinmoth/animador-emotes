const GIFGenerator = {
  generate(animator, config, onProgress) {
    return new Promise((resolve, reject) => {
      const fps = config.fps || CONFIG.defaultFps;
      const duration = animator.animation.getDuration();
      const frameTime = 1000 / fps;
      const totalFrames = Math.max(1, Math.ceil((duration * 1000) / frameTime));

      let gif;
      try {
        gif = new GIF({
          workers: CONFIG.gifOptions.workers,
          quality: 10,
          width: animator.canvas.width,
          height: animator.canvas.height,
          workerScript: CONFIG.gifOptions.workerScript
        });
      } catch (err) {
        return reject(new Error('No se pudo inicializar gif.js: ' + err.message));
      }

      const finishedBlob = (blob) => resolve(blob);
      const renderError = (err) => reject(new Error('Error generando GIF: ' + (err && err.message ? err.message : err)));

      gif.on('finished', finishedBlob);
      gif.on('progress', (p) => {
        if (typeof onProgress === 'function') onProgress(0.1 + p * 0.9);
      });

      try {
        for (let i = 0; i < totalFrames; i++) {
          const progress = totalFrames === 1 ? 0 : i / (totalFrames - 1);
          animator.renderExportFrame(progress);
          gif.addFrame(animator.canvas, { delay: frameTime, copy: true });
          if (typeof onProgress === 'function') {
            onProgress((i / totalFrames) * 0.1);
          }
        }
      } catch (err) {
        return renderError(err);
      }

      try {
        gif.render();
      } catch (err) {
        renderError(err);
      }
    });
  }
};