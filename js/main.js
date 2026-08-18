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
    errorText: document.getElementById('error-text')
  };

  const state = {
    image: null,
    imageName: '',
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
    state.imageName = '';
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

        state.image = img;
        state.imageName = file.name;
        setupCanvas();
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
    UI.imageInfo.textContent = `${state.imageName} · ${state.image.width}x${state.image.height}px`;
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

  // Inicialización
  setState('init');
})();