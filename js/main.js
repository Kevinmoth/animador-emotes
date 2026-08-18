(() => {
  'use strict';

  const UI = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    browseBtn: document.getElementById('browse-btn'),
    stateInit: document.getElementById('state-init'),
    stateLoaded: document.getElementById('state-loaded'),
    stateGenerating: document.getElementById('state-generating'),
    imageInfo: document.getElementById('image-info'),
    previewCanvas: document.getElementById('preview-canvas'),
    previewStage: document.getElementById('preview-stage'),
    animationList: document.getElementById('animation-list'),
    paramsContainer: document.getElementById('params-container'),
    paramControls: document.getElementById('param-controls'),
    duration: document.getElementById('duration'),
    durationVal: document.getElementById('duration-val'),
    speed: document.getElementById('speed'),
    speedVal: document.getElementById('speed-val'),
    fps: document.getElementById('fps'),
    btnGenerate: document.getElementById('btn-generate'),
    btnReset: document.getElementById('btn-reset'),
    btnDownload: document.getElementById('btn-download'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    errorBox: document.getElementById('error-box'),
    errorText: document.getElementById('error-text'),
    themeToggle: document.getElementById('theme-toggle'),
    themeLabel: document.getElementById('theme-label'),
    cropCanvas: document.getElementById('crop-canvas'),
    cropPadding: document.getElementById('crop-padding'),
    cropPaddingVal: document.getElementById('crop-padding-val'),
    cropReset: document.getElementById('crop-reset')
  };

  const state = {
    image: null,
    originalImage: null,
    imageName: '',
    crop: null,
    padding: 0,
    currentAnimation: null,
    animator: null,
    exportCanvas: null,
    generating: false
  };

  function setState(name) {
    ['init', 'loaded', 'generating'].forEach(s => {
      UI['state' + s[0].toUpperCase() + s.slice(1)].classList.toggle('hidden', s !== name);
    });
  }

  function showError(msg) {
    UI.errorText.textContent = msg;
    UI.errorBox.classList.remove('hidden');
  }

  function clearError() {
    UI.errorBox.classList.add('hidden');
  }

  function resetToInit() {
    if (previewRaf) cancelAnimationFrame(previewRaf);
    state.image = null;
    state.originalImage = null;
    state.imageName = '';
    state.crop = null;
    state.padding = 0;
    state.currentAnimation = null;
    state.animator = null;
    state.generating = false;
    UI.fileInput.value = '';
    UI.btnDownload.classList.add('disabled');
    UI.btnDownload.removeAttribute('href');
    setState('init');
    clearError();
  }

  function validateImage(file) {
    clearError();
    if (!file) return false;
    if (!CONFIG.acceptedTypes.includes(file.type)) {
      showError('Solo se permiten imágenes PNG o JPG.');
      return false;
    }
    if (file.size > CONFIG.maxFileSizeMB * 1024 * 1024) {
      showError('La imagen supera el máximo de 10MB.');
      return false;
    }
    return true;
  }

  function loadImage(file) {
    if (!validateImage(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < CONFIG.minResolution || img.height < CONFIG.minResolution) {
          showError('La imagen es demasiado pequeña (mínimo 64x64px).');
          return;
        }
        if (img.width > CONFIG.maxResolution || img.height > CONFIG.maxResolution) {
          showError('Advertencia: imagen muy grande (>4096px). Puede tardar en procesar.');
        }

        state.originalImage = img;
        state.imageName = file.name;
        setupCanvas();
        setupCropEditor();
        setupAnimations();
        selectAnimation(Object.keys(AnimationRegistry)[0]);
        setState('loaded');
      };
      img.onerror = () => showError('No se pudo leer la imagen. Intenta con otra.');
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function setupCanvas() {
    const size = CONFIG.canvasSize;
    UI.previewCanvas.width = size;
    UI.previewCanvas.height = size;
    UI.previewStage.style.width = size + 'px';
    UI.previewStage.style.height = size + 'px';
  }

  function setupAnimations() {
    UI.animationList.innerHTML = '';
    Object.values(AnimationRegistry).forEach(anim => {
      const btn = document.createElement('button');
      btn.className = 'anim-item';
      btn.dataset.id = anim.id;
      btn.innerHTML = `<span class="anim-label">${anim.label}</span><span class="anim-desc">${anim.description}</span>`;
      btn.addEventListener('click', () => selectAnimation(anim.id));
      UI.animationList.appendChild(btn);
    });
  }

  function selectAnimation(id) {
    state.currentAnimation = id;
    document.querySelectorAll('.anim-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });
    buildParamsUI();
    restartPreview();
  }

  function getAnimationConfig() {
    const meta = AnimationRegistry[state.currentAnimation];
    const config = {
      duration: parseFloat(UI.duration.value),
      speed: parseFloat(UI.speed.value)
    };
    if (meta) {
      meta.params.forEach(p => {
        const el = document.querySelector(`[data-param="${p.key}"]`);
        if (!el) return;
        if (el.type === 'checkbox') {
          config[p.key] = el.checked;
        } else if (el.tagName === 'SELECT') {
          config[p.key] = el.value;
        } else {
          const val = parseFloat(el.value);
          config[p.key] = isNaN(val) ? el.value : val;
        }
      });
    }
    return config;
  }

  function buildParamsUI() {
    const meta = AnimationRegistry[state.currentAnimation];
    UI.paramControls.innerHTML = '';

    if (meta && meta.params.length > 0) {
      UI.paramsContainer.classList.remove('hidden');
      meta.params.forEach(p => {
        const row = document.createElement('div');
        row.className = 'param-row';

        if (p.type === 'select') {
          row.innerHTML = `<label>${p.label}</label>`;
          const select = document.createElement('select');
          select.dataset.param = p.key;
          select.className = 'param-select';
          p.options.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o.value;
            opt.textContent = o.label;
            select.appendChild(opt);
          });
          select.addEventListener('change', restartPreview);
          row.appendChild(select);
        } else if (p.type === 'toggle') {
          row.innerHTML = `<label>${p.label}</label>`;
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = p.default !== false;
          checkbox.dataset.param = p.key;
          checkbox.className = 'param-toggle';
          checkbox.addEventListener('change', restartPreview);
          row.appendChild(checkbox);
        } else {
          const isSlider = p.type === 'slider';
          const valEl = document.createElement('span');
          valEl.className = 'param-val';
          const display = (v) => {
            valEl.textContent = isSlider && p.step < 1 ? parseFloat(v).toFixed(2) : v;
          };
          row.innerHTML = `<label>${p.label}</label>`;
          const input = document.createElement('input');
          if (isSlider) {
            input.type = 'range';
            input.min = p.min;
            input.max = p.max;
            input.step = p.step || 1;
            input.value = p.default ?? ((p.min + p.max) / 2);
            input.dataset.param = p.key;
            input.className = 'param-slider';
          } else {
            input.type = 'number';
            input.min = p.min;
            input.max = p.max;
            input.value = p.default ?? ((p.min + p.max) / 2);
            input.dataset.param = p.key;
            input.className = 'param-number';
          }
          input.addEventListener('input', () => { display(input.value); restartPreview(); });
          display(input.value);
          row.appendChild(input);
          row.appendChild(valEl);
        }
        UI.paramControls.appendChild(row);
      });
    } else {
      UI.paramsContainer.classList.add('hidden');
    }
  }

  function getOrCreateAnimator() {
    if (!state.animator) {
      const cls = AnimationRegistry[state.currentAnimation].AnimationClass;
      state.animator = new Animator(UI.previewCanvas, state.image, new cls(getAnimationConfig()));
    } else {
      const cls = AnimationRegistry[state.currentAnimation].AnimationClass;
      state.animator.setAnimation(new cls(getAnimationConfig()));
    }
    return state.animator;
  }

  let previewRaf = null;
  function restartPreview() {
    const animator = getOrCreateAnimator();
    animator.stop();
    if (previewRaf) cancelAnimationFrame(previewRaf);

    const startTime = performance.now();
    const duration = animator.animation.getDuration();

    const loop = (now) => {
      const elapsed = (now - startTime) / 1000;
      const progress = (elapsed / duration) % 1;
      animator.renderFrame(progress);
      if (state.image && !state.generating) {
        previewRaf = requestAnimationFrame(loop);
      }
    };
    previewRaf = requestAnimationFrame(loop);
  }

  // ==== Generación GIF ====
  async function generateGif() {
    if (state.generating || !state.image) return;

    clearError();
    state.generating = true;
    UI.btnGenerate.disabled = true;
    setState('generating');
    UI.progressBar.style.width = '0%';
    UI.progressText.textContent = 'Preparando...';

    try {
      const config = getAnimationConfig();
      const cls = AnimationRegistry[state.currentAnimation].AnimationClass;
      const animation = new cls(config);

      // Crear canvas de exportación temporal (512px para rendimiento)
      const exportCanvas = CanvasRenderer.createCanvas(CONFIG.canvasSize);
      const exportAnimator = new Animator(exportCanvas, state.image, animation);

      const blob = await GIFGenerator.generate(exportAnimator, { fps: parseInt(UI.fps.value, 10) }, (p) => {
        const pct = Math.round(p * 100);
        UI.progressBar.style.width = pct + '%';
        UI.progressText.textContent = `Generando... ${pct}%`;
      });

      UI.progressBar.style.width = '100%';
      UI.progressText.textContent = 'Completado';

      const url = URL.createObjectURL(blob);
      UI.btnDownload.href = url;
      UI.btnDownload.download = `${baseName(state.imageName)}_${state.currentAnimation}.gif`;
      UI.btnDownload.classList.remove('disabled');

      setState('loaded');
    } catch (err) {
      showError(err.message || 'Error al generar el GIF.');
      setState('loaded');
    } finally {
      state.generating = false;
      UI.btnGenerate.disabled = false;
      restartPreview();
    }
  }

  function baseName(name) {
    return name.replace(/\.[^.]+$/, '') || 'animation';
  }

  // ==== Recorte y encuadre ====
  let cropDrag = null;
  let rebuildPending = false;

  function setupCropEditor() {
    state.crop = { x: 0, y: 0, w: 1, h: 1 };
    state.padding = 0;
    state.animator = null;
    UI.cropPadding.value = 0;
    UI.cropPaddingVal.textContent = '0%';
    layoutCropCanvas();
    drawCropOverlay();
    buildSourceImage();
  }

  function layoutCropCanvas() {
    const img = state.originalImage;
    const maxW = 380, maxH = 320;
    const ratio = Math.min(maxW / img.width, maxH / img.height);
    UI.cropCanvas.width = Math.max(1, Math.round(img.width * ratio));
    UI.cropCanvas.height = Math.max(1, Math.round(img.height * ratio));
  }

  function cropRectPx() {
    return {
      x: state.crop.x * UI.cropCanvas.width,
      y: state.crop.y * UI.cropCanvas.height,
      w: state.crop.w * UI.cropCanvas.width,
      h: state.crop.h * UI.cropCanvas.height
    };
  }

  function drawCropOverlay() {
    const cv = UI.cropCanvas;
    const ctx = cv.getContext('2d');
    const img = state.originalImage;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, 0, 0, cv.width, cv.height);

    const r = cropRectPx();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, cv.width, r.y);
    ctx.fillRect(0, r.y + r.h, cv.width, cv.height - r.y - r.h);
    ctx.fillRect(0, r.y, r.x, r.h);
    ctx.fillRect(r.x + r.w, r.y, cv.width - r.x - r.w, r.h);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(r.x, r.y, r.w, r.h);

    const hs = 6;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#0071e3';
    ctx.lineWidth = 2;
    const corners = [
      [r.x, r.y], [r.x + r.w, r.y],
      [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillRect(cx - hs, cy - hs, hs * 2, hs * 2);
      ctx.strokeRect(cx - hs, cy - hs, hs * 2, hs * 2);
    });
  }

  function buildSourceImage() {
    const img = state.originalImage;
    if (!img) return;
    const crop = state.crop;
    const padPct = state.padding;
    const cw = crop.w * img.width;
    const ch = crop.h * img.height;
    const padW = (cw * padPct) / 100;
    const padH = (ch * padPct) / 100;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(cw + padW * 2));
    canvas.height = Math.max(1, Math.round(ch + padH * 2));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      img,
      crop.x * img.width, crop.y * img.height, cw, ch,
      padW, padH, cw, ch
    );
    state.image = canvas;
    updateImageInfo();
  }

  function updateImageInfo() {
    const img = state.image;
    if (!img || !state.originalImage) return;
    if (img.width === state.originalImage.width && img.height === state.originalImage.height) {
      UI.imageInfo.textContent = `${state.imageName} · ${img.width}x${img.height}px`;
    } else {
      UI.imageInfo.textContent = `${state.imageName} · fuente ${state.originalImage.width}x${state.originalImage.height}px → ${img.width}x${img.height}px`;
    }
  }

  function scheduleRebuild() {
    if (rebuildPending) return;
    rebuildPending = true;
    requestAnimationFrame(() => {
      rebuildPending = false;
      buildSourceImage();
      state.animator = null;
      restartPreview();
    });
  }

  function cropEventPos(e) {
    const rect = UI.cropCanvas.getBoundingClientRect();
    const scaleX = UI.cropCanvas.width / rect.width;
    const scaleY = UI.cropCanvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function hitCropHandle(px) {
    const r = cropRectPx();
    const h = 12;
    if (Math.abs(px.x - r.x) <= h && Math.abs(px.y - r.y) <= h) return 'nw';
    if (Math.abs(px.x - (r.x + r.w)) <= h && Math.abs(px.y - r.y) <= h) return 'ne';
    if (Math.abs(px.x - r.x) <= h && Math.abs(px.y - (r.y + r.h)) <= h) return 'sw';
    if (Math.abs(px.x - (r.x + r.w)) <= h && Math.abs(px.y - (r.y + r.h)) <= h) return 'se';
    return null;
  }

  function isInsideCrop(px) {
    const r = cropRectPx();
    return px.x >= r.x && px.x <= r.x + r.w && px.y >= r.y && px.y <= r.y + r.h;
  }

  UI.cropCanvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    UI.cropCanvas.setPointerCapture(e.pointerId);
    const px = cropEventPos(e);
    const handle = hitCropHandle(px);
    const mode = handle || (isInsideCrop(px) ? 'move' : null);
    if (!mode) return;
    cropDrag = { mode, startX: px.x, startY: px.y, start: { ...state.crop } };
    UI.cropCanvas.style.cursor = 'grabbing';
  });

  UI.cropCanvas.addEventListener('pointermove', (e) => {
    if (cropDrag) {
      const px = cropEventPos(e);
      const dx = (px.x - cropDrag.startX) / UI.cropCanvas.width;
      const dy = (px.y - cropDrag.startY) / UI.cropCanvas.height;
      const s = cropDrag.start;
      const MIN = 0.05;
      let c;

      if (cropDrag.mode === 'move') {
        c = {
          x: Math.max(0, Math.min(1 - s.w, s.x + dx)),
          y: Math.max(0, Math.min(1 - s.h, s.y + dy)),
          w: s.w,
          h: s.h
        };
      } else {
        let x0 = s.x, y0 = s.y, x1 = s.x + s.w, y1 = s.y + s.h;
        if (cropDrag.mode.indexOf('w') !== -1) x0 = s.x + dx;
        if (cropDrag.mode.indexOf('e') !== -1) x1 = s.x + s.w + dx;
        if (cropDrag.mode.indexOf('n') !== -1) y0 = s.y + dy;
        if (cropDrag.mode.indexOf('s') !== -1) y1 = s.y + s.h + dy;
        x0 = Math.max(0, Math.min(x0, 1 - MIN));
        x1 = Math.min(1, Math.max(x1, MIN + x0));
        if (x1 - x0 < MIN) x1 = x0 + MIN;
        y0 = Math.max(0, Math.min(y0, 1 - MIN));
        y1 = Math.min(1, Math.max(y1, MIN + y0));
        if (y1 - y0 < MIN) y1 = y0 + MIN;
        c = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
      }
      state.crop = c;
      drawCropOverlay();
      scheduleRebuild();
      return;
    }

    const px = cropEventPos(e);
    const handle = hitCropHandle(px);
    const inside = isInsideCrop(px);
    if (handle) {
      UI.cropCanvas.style.cursor = (handle === 'nw' || handle === 'se')
        ? 'nwse-resize'
        : 'nesw-resize';
    } else if (inside) {
      UI.cropCanvas.style.cursor = 'move';
    } else {
      UI.cropCanvas.style.cursor = 'crosshair';
    }
  });

  UI.cropCanvas.addEventListener('pointerup', () => {
    cropDrag = null;
    UI.cropCanvas.style.cursor = 'crosshair';
  });

  UI.cropReset.addEventListener('click', () => {
    state.crop = { x: 0, y: 0, w: 1, h: 1 };
    state.padding = 0;
    UI.cropPadding.value = 0;
    UI.cropPaddingVal.textContent = '0%';
    drawCropOverlay();
    buildSourceImage();
    state.animator = null;
    restartPreview();
  });

  UI.cropPadding.addEventListener('input', () => {
    state.padding = parseInt(UI.cropPadding.value, 10) || 0;
    UI.cropPaddingVal.textContent = state.padding + '%';
    buildSourceImage();
    state.animator = null;
    restartPreview();
  });

  // ==== Event listeners ====
  ['dragenter', 'dragover'].forEach(ev => {
    UI.dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      UI.dropZone.classList.add('dragging');
    });
  });
  ['dragleave', 'drop'].forEach(ev => {
    UI.dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      UI.dropZone.classList.remove('dragging');
    });
  });
  UI.dropZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  });
  UI.browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    UI.fileInput.click();
  });
  UI.dropZone.addEventListener('click', () => UI.fileInput.click());
  UI.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadImage(file);
  });

  UI.duration.addEventListener('input', () => {
    UI.durationVal.textContent = parseFloat(UI.duration.value).toFixed(1) + 's';
    restartPreview();
  });
  UI.speed.addEventListener('input', () => {
    UI.speedVal.textContent = parseFloat(UI.speed.value).toFixed(1) + 'x';
    restartPreview();
  });
  UI.btnGenerate.addEventListener('click', generateGif);
  UI.btnReset.addEventListener('click', resetToInit);

  // ==== Modo oscuro ====
  const THEME_KEY = 'animador-theme';
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (UI.themeLabel) {
      UI.themeLabel.textContent = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    }
  }
  UI.themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });
  try {
    applyTheme(localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light');
  } catch (e) {
    applyTheme('light');
  }

  // Inicialización
  setState('init');
})();