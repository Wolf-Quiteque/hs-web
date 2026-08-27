/* ============================================================
   H&S Angola — Visual In-Page CMS Editor
   Runs on every page:
     - Always: fetches DB overrides and applies them silently
     - Edit mode: loads Alpine.js + Quill, shows edit overlay
   ============================================================ */
(function () {
  'use strict';

  // ── Config ───────────────────────────────────────────────────
  var API_BASE = (window.HS_API_BASE || 'https://hs-node-api.vercel.app/api');
  var EDIT_MODE_KEY  = 'hsEditMode';
  var ADMIN_KEY_STORE = 'hsAdminKey';

  // ── State ────────────────────────────────────────────────────
  var isEditMode = sessionStorage.getItem(EDIT_MODE_KEY) === 'true';
  var adminKey   = sessionStorage.getItem(ADMIN_KEY_STORE) || '';
  var pageKey    = window.location.pathname;

  var textElements  = []; // [{el, key, defaultHtml}]
  var imageElements = []; // [{el, key, kind, defaultSrc}]

  var activeTextItem = null;
  var activeImgItem  = null;
  var quillInstance  = null;
  var quillReady     = false;
  var pendingImgDataUrl  = null;
  var pendingImgFilename = null;

  // ── Editable selectors ───────────────────────────────────────
  var TEXT_SELECTORS = [
    // Blog / article pages
    '.blog-text p',
    '.blog-text h2',
    '.blog-text h3',
    '.blog-text h4',
    '.blog-text h6',
    '.blog-text li',
    // Hero / page headers
    '.banner-title',
    '.tj-page-title',
    // Banner content paragraphs (sobrenos hero, inner-page heroes)
    '.banner-content p',
    // Section headings
    '.sec-title',
    '.sub-title',
    // About sections — .about-content-area is the actual parent class used
    '.about-content-area p',
    '.about-content-area h2',
    '.about-content-area h3',
    '.about-content-area h4',
    // Mission-Vision-Values / Angola-China boxes
    '.mission-vision-box h4.title',
    '.mission-vision-box p.desc',
    '.mission-vision-box ul.list-items li',
    // Service cards (tj-service-section-5, service-stack, etc.)
    '.service-content .title',
    '.service-content p.desc',
    '.service-content ul.desc',
    '.service-content .no',
    // Detail item cards
    '.service-details-item h6.title',
    '.service-details-item .desc p',
    // Choose / mission-vision-values boxes (sobrenos Missão/Visão/Valores)
    '.choose-box .title',
    '.choose-box .desc',
    // Working process steps
    '.process-content .title',
    '.process-content .desc',
    // Team/person cards
    '.tj-team-single .title',
    '.tj-team-single .designation',
    // Counter / stat items
    '.tj-counter-item .title',
    '.tj-counter-item p',
    // Testimonial sections
    '.testimonial-text',
    '.testimonial-content p',
    // CTA sections
    '.tj-cta-content h2',
    '.tj-cta-content p',
    // Footer
    '.footer-text p',
    '.footer-contact-info .contact-item span'
  ];

  var IMG_SELECTORS = [
    // Blog / article images
    '.blog-images img',
    '.blog-text img',
    // Service section images (tj-service-section-5 and timeline stacks)
    '.service-img img',
    // About section images
    '.about-img img',
    // Generic image containers
    '.image-box img',
    '.images-wrap img',
    '.banner-img img',
    '.cta-img img',
    // Team / person photos
    '.tj-team-img img',
    // Partner/client logos in swiper
    '.client-logo img',
    // Project carousels (swiper slides with real content images)
    '.swiper-slide .project-img img',
    '.swiper-slide .h6-project-item img',
    // Slideshow / hero image
    '#slideshow-image',
    // Keep the catch-all last so existing element keys remain stable.
    'img'
  ];

  var BACKGROUND_IMAGE_SELECTORS = [
    '[data-bg-image]',
    '[data-bg-src]',
    '[style*="background-image"]'
  ];

  // ── Discover editable elements ───────────────────────────────
  function discoverElements() {
    var seenText = [];
    var seenImg  = [];
    var tIdx = 0;
    var iIdx = 0;

    TEXT_SELECTORS.forEach(function (sel) {
      var els = document.querySelectorAll(sel);
      els.forEach(function (el) {
        if (seenText.indexOf(el) !== -1) return;
        seenText.push(el);
        textElements.push({ el: el, key: 'text-' + tIdx++, defaultHtml: el.innerHTML });
      });
    });

    IMG_SELECTORS.forEach(function (sel) {
      var els = document.querySelectorAll(sel);
      els.forEach(function (el) {
        if (seenImg.indexOf(el) !== -1) return;
        seenImg.push(el);
        imageElements.push({ el: el, key: 'img-' + iIdx++, kind: 'image', defaultSrc: el.src });
      });
    });

    // Background images do not have an <img> node, but are still visual
    // content users expect to be able to replace in the live editor.
    BACKGROUND_IMAGE_SELECTORS.forEach(function (sel) {
      var els = document.querySelectorAll(sel);
      els.forEach(function (el) {
        if (seenImg.indexOf(el) !== -1) return;
        var defaultValue = getImageValue({ el: el, kind: 'background' });
        if (!defaultValue) return;
        seenImg.push(el);
        imageElements.push({ el: el, key: 'img-' + iIdx++, kind: 'background', defaultSrc: defaultValue });
      });
    });
  }

  // ── Apply overrides from DB ──────────────────────────────────
  function applyOverrides() {
    return fetch(API_BASE + '/site-content?page=' + encodeURIComponent(pageKey))
      .then(function (resp) {
        if (!resp.ok) return { data: [] };
        return resp.json();
      })
      .then(function (json) {
        var data = (json && json.data) ? json.data : [];
        if (data.length === 0) return;

        var map = {};
        data.forEach(function (d) { map[d.elementKey] = d; });

        textElements.forEach(function (item) {
          if (map[item.key]) {
            item.el.innerHTML = map[item.key].value;
            if (isEditMode) item.el.classList.add('hs-has-override');
          }
        });

        imageElements.forEach(function (item) {
          if (map[item.key]) {
            setImageValue(item, map[item.key].value);
            if (isEditMode) item.el.classList.add('hs-has-override');
          }
        });
      })
      .catch(function (e) {
        console.warn('[hs-editor] Could not fetch overrides:', e.message);
      });
  }

  // ════════════════════════════════════════════════════════════
  //  EDIT MODE UI
  // ════════════════════════════════════════════════════════════

  function buildEditUI() {
    document.body.classList.add('hs-edit-mode');
    buildBanner();
    buildModalOverlay();
    addEditButtons();
  }

  // ── Top banner ───────────────────────────────────────────────
  function buildBanner() {
    var maskedKey = adminKey ? (adminKey.slice(0, 3) + '***') : '(sem chave)';
    var banner = document.createElement('div');
    banner.id = 'hs-edit-banner';
    banner.innerHTML =
      '<span class="hs-banner-title">MODO EDIÇÃO</span>' +
      '<span class="hs-banner-page">' + pageKey + '</span>' +
      '<div class="hs-banner-actions">' +
        '<span style="font-size:11px;opacity:0.8;">Chave: ' + maskedKey + '</span>' +
        '<input id="hs-key-input" type="password" placeholder="Corrigir chave API" ' +
          'style="font-size:11px;padding:3px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.4);' +
          'background:rgba(255,255,255,0.15);color:#fff;width:140px;" ' +
          'value="' + adminKey + '">' +
        '<button id="hs-key-apply" style="font-size:11px;">Aplicar</button>' +
        '<button id="hs-exit-edit">Sair do Modo Edição</button>' +
      '</div>';
    document.body.appendChild(banner);

    document.getElementById('hs-key-apply').addEventListener('click', function () {
      var newKey = document.getElementById('hs-key-input').value.trim();
      if (newKey) {
        adminKey = newKey;
        sessionStorage.setItem(ADMIN_KEY_STORE, newKey);
        var masked = newKey.slice(0, 3) + '***';
        banner.querySelector('span[style]').textContent = 'Chave: ' + masked;
      }
    });

    document.getElementById('hs-exit-edit').addEventListener('click', function () {
      sessionStorage.removeItem(EDIT_MODE_KEY);
      sessionStorage.removeItem(ADMIN_KEY_STORE);
      window.location.reload();
    });
  }

  // ── Modal overlay ────────────────────────────────────────────
  function buildModalOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'hs-modal-overlay';

    overlay.innerHTML =
      // ── Text modal ──────────────────────────────────────────
      '<div class="hs-modal" id="hs-text-modal" style="display:none;">' +
        '<div class="hs-modal-header">' +
          '<h3>Editar Texto</h3>' +
          '<button class="hs-modal-close" id="hs-text-close">&times;</button>' +
        '</div>' +
        '<div class="hs-modal-body">' +
          '<span class="hs-modal-label">Use a barra de ferramentas para formatar o texto:</span>' +
          '<div id="hs-quill-container"></div>' +
        '</div>' +
        '<div class="hs-modal-footer">' +
          '<button class="hs-btn-reset" id="hs-text-reset">Repor Padrão</button>' +
          '<button id="hs-text-cancel">Cancelar</button>' +
          '<button class="hs-btn-primary" id="hs-text-save">Guardar</button>' +
        '</div>' +
      '</div>' +

      // ── Image modal ──────────────────────────────────────────
      '<div class="hs-modal" id="hs-img-modal" style="display:none;">' +
        '<div class="hs-modal-header">' +
          '<h3>Editar Imagem</h3>' +
          '<button class="hs-modal-close" id="hs-img-close">&times;</button>' +
        '</div>' +
        '<div class="hs-modal-body">' +
          '<span class="hs-modal-label">Imagem actual:</span>' +
          '<img id="hs-img-preview" src="" alt="Preview">' +
          '<span class="hs-modal-label">Selecionar nova imagem (será convertida para WebP):</span>' +
          '<input type="file" id="hs-img-file" accept="image/*">' +
          '<div id="hs-img-status"></div>' +
        '</div>' +
        '<div class="hs-modal-footer">' +
          '<button class="hs-btn-reset" id="hs-img-reset">Repor Padrão</button>' +
          '<button id="hs-img-cancel">Cancelar</button>' +
          '<button class="hs-btn-primary" id="hs-img-save">Guardar</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    wireModalEvents();
  }

  function openOverlay(modalId) {
    document.getElementById('hs-modal-overlay').classList.add('hs-overlay-active');
    document.getElementById(modalId).style.display = 'flex';
  }

  function closeOverlay() {
    document.getElementById('hs-modal-overlay').classList.remove('hs-overlay-active');
    document.querySelectorAll('.hs-modal').forEach(function (m) { m.style.display = 'none'; });
    activeTextItem = null;
    activeImgItem  = null;
    pendingImgDataUrl  = null;
    pendingImgFilename = null;
    if (quillInstance) quillInstance.setText('');
  }

  function wireModalEvents() {
    // Text modal
    document.getElementById('hs-text-close').addEventListener('click', closeOverlay);
    document.getElementById('hs-text-cancel').addEventListener('click', closeOverlay);
    document.getElementById('hs-text-save').addEventListener('click', saveText);
    document.getElementById('hs-text-reset').addEventListener('click', resetText);

    // Image modal
    document.getElementById('hs-img-close').addEventListener('click', closeOverlay);
    document.getElementById('hs-img-cancel').addEventListener('click', closeOverlay);
    document.getElementById('hs-img-save').addEventListener('click', saveImage);
    document.getElementById('hs-img-reset').addEventListener('click', resetImage);
    document.getElementById('hs-img-file').addEventListener('change', onImageFileChange);

    // Close overlay on backdrop click
    document.getElementById('hs-modal-overlay').addEventListener('click', function (e) {
      if (e.target === document.getElementById('hs-modal-overlay')) closeOverlay();
    });
  }

  // ── Add edit buttons to each element ─────────────────────────
  function addEditButtons() {
    textElements.forEach(function (item) {
      item.el.classList.add('hs-edit-target');
      var btn = document.createElement('button');
      btn.className = 'hs-edit-btn';
      btn.title = 'Editar: ' + item.key;
      btn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        openTextModal(item);
      });
      item.el.appendChild(btn);
    });

    imageElements.forEach(function (item) {
      var wrapper = item.el.parentElement;
      if (!wrapper) return;
      var origPosition = window.getComputedStyle(wrapper).position;
      if (origPosition === 'static') wrapper.style.position = 'relative';
      var btn = document.createElement('button');
      btn.className = 'hs-edit-btn';
      btn.title = 'Editar imagem: ' + item.key;
      btn.innerHTML = '<i class="fa-solid fa-camera"></i>';
      btn.style.top = '8px';
      btn.style.right = '8px';
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        openImageModal(item);
      });
      wrapper.appendChild(btn);
    });
  }

  // ════════════════════════════════════════════════════════════
  //  TEXT MODAL
  // ════════════════════════════════════════════════════════════

  function loadQuill(cb) {
    if (quillReady) { cb(); return; }

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css';
    document.head.appendChild(link);

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js';
    script.onload = function () {
      quillInstance = new Quill('#hs-quill-container', {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            [{ 'header': [2, 3, 4, false] }],
            ['clean']
          ]
        }
      });
      quillReady = true;
      cb();
    };
    document.head.appendChild(script);
  }

  function openTextModal(item) {
    activeTextItem = item;
    loadQuill(function () {
      var delta = quillInstance.clipboard.convert({ html: item.el.innerHTML });
      quillInstance.setContents(delta, 'silent');
      openOverlay('hs-text-modal');
    });
  }

  function saveText() {
    if (!activeTextItem) return;
    var html = quillInstance.root.innerHTML;
    var btn = document.getElementById('hs-text-save');
    setBtn(btn, true, 'A guardar...');
    fetch(API_BASE + '/site-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({
        pageKey: pageKey,
        elementKey: activeTextItem.key,
        type: 'text',
        value: html
      })
    })
    .then(function (resp) {
      if (!resp.ok) return resp.json().then(function (e) { throw new Error(e.error || resp.status); });
      return resp.json();
    })
    .then(function () {
      activeTextItem.el.innerHTML = html;
      // Re-append the edit button (innerHTML wipe removed it)
      var btn2 = document.createElement('button');
      btn2.className = 'hs-edit-btn';
      btn2.title = 'Editar: ' + activeTextItem.key;
      btn2.innerHTML = '<i class="fa-solid fa-pencil"></i>';
      var capturedItem = activeTextItem;
      btn2.addEventListener('click', function (e) {
        e.stopPropagation(); e.preventDefault();
        openTextModal(capturedItem);
      });
      activeTextItem.el.appendChild(btn2);
      activeTextItem.el.classList.add('hs-has-override');
      closeOverlay();
    })
    .catch(function (e) {
      alert('Erro ao guardar: ' + e.message);
    })
    .finally(function () {
      setBtn(btn, false, 'Guardar');
    });
  }

  function resetText() {
    if (!activeTextItem) return;
    if (!confirm('Repor conteúdo padrão para este elemento? Esta acção não pode ser desfeita.')) return;
    var btn = document.getElementById('hs-text-reset');
    setBtn(btn, true, '...');
    fetch(API_BASE + '/site-content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ pageKey: pageKey, elementKey: activeTextItem.key })
    })
    .then(function () {
      activeTextItem.el.classList.remove('hs-has-override');
      // Restore default HTML
      activeTextItem.el.innerHTML = activeTextItem.defaultHtml;
      // Re-append edit button
      var btn2 = document.createElement('button');
      btn2.className = 'hs-edit-btn';
      btn2.title = 'Editar: ' + activeTextItem.key;
      btn2.innerHTML = '<i class="fa-solid fa-pencil"></i>';
      var capturedItem = activeTextItem;
      btn2.addEventListener('click', function (e) {
        e.stopPropagation(); e.preventDefault();
        openTextModal(capturedItem);
      });
      activeTextItem.el.appendChild(btn2);
      closeOverlay();
    })
    .catch(function (e) {
      alert('Erro ao repor: ' + e.message);
    })
    .finally(function () {
      setBtn(btn, false, 'Repor Padrão');
    });
  }

  // ════════════════════════════════════════════════════════════
  //  IMAGE MODAL
  // ════════════════════════════════════════════════════════════

  function openImageModal(item) {
    activeImgItem = item;
    pendingImgDataUrl  = null;
    pendingImgFilename = null;
    document.getElementById('hs-img-preview').src = getImageValue(item);
    document.getElementById('hs-img-file').value = '';
    document.getElementById('hs-img-status').textContent = '';
    openOverlay('hs-img-modal');
  }

  function onImageFileChange(e) {
    var file = e.target.files[0];
    if (!file) return;
    var statusEl = document.getElementById('hs-img-status');
    statusEl.textContent = 'A converter para WebP...';
    fileToWebpDataUrl(file, 0.90)
      .then(function (dataUrl) {
        document.getElementById('hs-img-preview').src = dataUrl;
        pendingImgDataUrl  = dataUrl;
        pendingImgFilename = file.name.replace(/\.[^.]+$/, '') + '.webp';
        statusEl.textContent = 'Pronto para guardar.';
      })
      .catch(function (err) {
        statusEl.textContent = 'Erro na conversão: ' + err.message;
      });
  }

  function saveImage() {
    if (!activeImgItem) return;
    if (!pendingImgDataUrl) { alert('Selecione uma imagem primeiro.'); return; }

    var btn = document.getElementById('hs-img-save');
    var statusEl = document.getElementById('hs-img-status');
    setBtn(btn, true, 'A enviar...');
    statusEl.textContent = 'A enviar imagem para o servidor...';

    fetch(API_BASE + '/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({
        dataUrl: pendingImgDataUrl,
        filename: pendingImgFilename || 'content.webp',
        kind: 'content'
      })
    })
    .then(function (resp) {
      if (!resp.ok) return resp.json().then(function (e) { throw new Error(e.error || resp.status); });
      return resp.json();
    })
    .then(function (json) {
      var url = json.url;
      statusEl.textContent = 'A guardar referência...';
      return fetch(API_BASE + '/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({
          pageKey: pageKey,
          elementKey: activeImgItem.key,
          type: 'image',
          value: url
        })
      })
      .then(function (resp2) {
        if (!resp2.ok) return resp2.json().then(function (e) { throw new Error(e.error || resp2.status); });
        return url;
      });
    })
    .then(function (url) {
      setImageValue(activeImgItem, url);
      activeImgItem.el.classList.add('hs-has-override');
      closeOverlay();
    })
    .catch(function (e) {
      statusEl.textContent = 'Erro: ' + e.message;
    })
    .finally(function () {
      setBtn(btn, false, 'Guardar');
    });
  }

  function resetImage() {
    if (!activeImgItem) return;
    if (!confirm('Repor imagem padrão para este elemento?')) return;
    var btn = document.getElementById('hs-img-reset');
    setBtn(btn, true, '...');
    fetch(API_BASE + '/site-content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ pageKey: pageKey, elementKey: activeImgItem.key })
    })
    .then(function () {
      setImageValue(activeImgItem, activeImgItem.defaultSrc);
      activeImgItem.el.classList.remove('hs-has-override');
      closeOverlay();
    })
    .catch(function (e) {
      alert('Erro ao repor: ' + e.message);
    })
    .finally(function () {
      setBtn(btn, false, 'Repor Padrão');
    });
  }

  // ════════════════════════════════════════════════════════════
  //  UTILITIES
  // ════════════════════════════════════════════════════════════

  function setBtn(btn, disabled, text) {
    if (!btn) return;
    btn.disabled = disabled;
    btn.textContent = text;
  }

  function getImageValue(item) {
    if (item.kind === 'background') {
      var declared = item.el.getAttribute('data-bg-image') || item.el.getAttribute('data-bg-src');
      if (declared) return declared;
      var match = String(item.el.style.backgroundImage || '').match(/url\(["']?(.*?)["']?\)/i);
      return match ? match[1] : '';
    }
    return item.el.currentSrc || item.el.src || '';
  }

  function setImageValue(item, value) {
    if (item.kind === 'background') {
      item.el.style.backgroundImage = 'url("' + String(value).replace(/"/g, '\\"') + '")';
      if (item.el.hasAttribute('data-bg-image')) item.el.setAttribute('data-bg-image', value);
      if (item.el.hasAttribute('data-bg-src')) item.el.setAttribute('data-bg-src', value);
      return;
    }
    item.el.src = value;
  }

  /**
   * Convert a File to a WebP base64 dataUrl.
   * Caps width at 1600px. Mirrors the conversion in admin.html.
   */
  function fileToWebpDataUrl(file, quality) {
    quality = quality || 0.90;
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function (ev) {
        var img = new Image();
        img.onerror = reject;
        img.onload = function () {
          var maxW = 1600;
          var scale = Math.min(1, maxW / img.width);
          var tw = Math.round(img.width * scale);
          var th = Math.round(img.height * scale);
          var canvas = document.createElement('canvas');
          canvas.width = tw;
          canvas.height = th;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, tw, th);
          canvas.toBlob(function (blob) {
            if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
            var fr = new FileReader();
            fr.onerror = reject;
            fr.onload = function () { resolve(fr.result); };
            fr.readAsDataURL(blob);
          }, 'image/webp', quality);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ════════════════════════════════════════════════════════════
  //  INIT
  // ════════════════════════════════════════════════════════════

  function init() {
    discoverElements();
    applyOverrides().then(function () {
      if (isEditMode) {
        buildEditUI();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
