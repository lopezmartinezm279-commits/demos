/* =====================================================================
   app.js — TODO el JS compartido del escaparate de demos.
   Dirigido por atributos de datos. Defensivo: si un componente no está
   en la página, no hace nada. Sin dependencias. Cargar con `defer`.

   Hooks implementados (atributos exactos):
     body[data-wa]            -> inyecta FAB de WhatsApp
     #demobar                 -> barra fija con las 10 demos + portada
     form[data-demo-form]     -> formulario demo (toast + reset); opcional data-toast="..."
     [data-ba]                -> comparador antes/después (con .ba__range)
     [data-filter-root]       -> filtros: select[data-filter="zona|tipo|precio"],
                                 tarjetas [data-item][data-zona][data-tipo][data-precio],
                                 contador [data-filter-count], vacío [data-filter-empty]
     [data-tabs]              -> pestañas: button[data-tab="X"] + [data-panel="X"] (dentro del root)
     [data-calc]              -> calculadora solar: input[name="consumo"] +
                                 [data-calc-out="ahorro-mes|ahorro-ano|ahorro-25"] (dentro del root)
     [data-lightbox]          -> las <img> del contenedor abren lightbox
     [data-wa-item]           -> botón "Me interesa" con data-ref="..." y data-msg="..."
     [data-nav-toggle]        -> abre/cierra [data-nav] (nav móvil)
     .reveal                  -> fade-up al entrar en viewport (añade .is-in)
     [data-year]              -> año actual
   ===================================================================== */
(function () {
  'use strict';

  var WA_PHONE = '34692203981';

  var SECTORS = [
    { slug: 'reformas', file: 'reformas.html', label: 'Reformas' },
    { slug: 'clinicas', file: 'clinicas.html', label: 'Clínica estética' },
    { slug: 'solar', file: 'solar.html', label: 'Placas solares' },
    { slug: 'taller', file: 'taller.html', label: 'Taller' },
    { slug: 'inmobiliaria', file: 'inmobiliaria.html', label: 'Inmobiliaria' },
    { slug: 'dentista', file: 'dentista.html', label: 'Dentista' },
    { slug: 'fisio', file: 'fisio.html', label: 'Fisio' },
    { slug: 'abogados', file: 'abogados.html', label: 'Abogados' },
    { slug: 'barberia', file: 'barberia.html', label: 'Barbería' },
    { slug: 'restaurante', file: 'restaurante.html', label: 'Restaurante' }
  ];

  var WA_SVG =
    '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M12 2.2c-5.4 0-9.8 4.3-9.8 9.7 0 1.7.5 3.4 1.3 4.8L2.2 21.8l5.3-1.4c1.4.8 2.9 1.2 4.5 1.2 5.4 0 9.8-4.3 9.8-9.7S17.4 2.2 12 2.2zm0 17.6c-1.4 0-2.8-.4-4-1.1l-.3-.2-3.1.8.8-3-.2-.3c-.8-1.2-1.2-2.7-1.2-4.1 0-4.4 3.6-7.9 8-7.9s8 3.5 8 7.9-3.6 7.9-8 7.9zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z"/></svg>';

  function waUrl(text) {
    return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(text);
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- Toast --------------------------------------------------- */
  var toastTimer = null;
  function showToast(msg) {
    var toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    // reflow para reiniciar la transición si ya estaba visible
    void toast.offsetWidth;
    toast.classList.add('is-show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-show');
    }, 4000);
  }

  /* ---------- 1. Demobar ---------------------------------------------- */
  function initDemobar() {
    var el = document.getElementById('demobar');
    if (!el) return;

    var current = decodeURIComponent(location.pathname.split('/').pop() || '') || 'index.html';
    var html = '<nav aria-label="Todas las demos"><div class="demobar__scroll">';
    html += '<a class="demobar__home' + (current === 'index.html' ? ' is-active' : '') +
      '" href="index.html">◆ Demos</a>';

    SECTORS.forEach(function (s) {
      var active = current === s.file;
      html += '<a class="demobar__tab' + (active ? ' is-active' : '') + '" href="' + s.file + '"' +
        (active ? ' aria-current="page"' : '') + '>' + s.label + '</a>';
    });
    html += '</div></nav>';
    el.innerHTML = html;

    // Centrar la pestaña activa en móvil
    var scroller = el.querySelector('.demobar__scroll');
    var active = el.querySelector('.demobar__tab.is-active');
    if (scroller && active) {
      requestAnimationFrame(function () {
        scroller.scrollLeft = active.offsetLeft - (scroller.clientWidth - active.offsetWidth) / 2;
      });
    }
  }

  /* ---------- 2. FAB WhatsApp ------------------------------------------ */
  function initFab() {
    var msg = document.body.getAttribute('data-wa');
    if (!msg) return;
    var a = document.createElement('a');
    a.className = 'fab-wa';
    a.href = waUrl(msg);
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Escríbenos por WhatsApp');
    a.innerHTML = WA_SVG;
    document.body.appendChild(a);
  }

  /* ---------- 3. Formularios demo -------------------------------------- */
  function initForms() {
    var forms = document.querySelectorAll('form[data-demo-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault(); // la validación required nativa ya se ha pasado
        showToast(form.getAttribute('data-toast') ||
          'DEMO: este lead llegaría a tu WhatsApp y a tu email al instante');
        form.reset();
      });
    });
  }

  /* ---------- 4. Comparador antes/después ------------------------------ */
  function initBA() {
    document.querySelectorAll('[data-ba]').forEach(function (root) {
      var range = root.querySelector('.ba__range');
      var before = root.querySelector('.ba__before');
      if (!range || !before) return;
      var handle = root.querySelector('.ba__handle');

      function set(v) {
        v = Math.max(0, Math.min(100, v));
        before.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
        if (handle) handle.style.left = v + '%';
      }
      range.addEventListener('input', function () { set(parseFloat(range.value)); });
      set(parseFloat(range.value) || 50);
    });
  }

  /* ---------- 5. Filtros (inmobiliaria) -------------------------------- */
  function initFilters() {
    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
      var selects = root.querySelectorAll('select[data-filter]');
      var items = root.querySelectorAll('[data-item]');
      if (!selects.length || !items.length) return;
      var countEl = root.querySelector('[data-filter-count]');
      var emptyEl = root.querySelector('[data-filter-empty]');

      function apply() {
        var visible = 0;
        items.forEach(function (item) {
          var show = true;
          selects.forEach(function (sel) {
            var key = sel.getAttribute('data-filter');
            var val = sel.value;
            if (!val) return;
            if (key === 'precio') {
              var price = parseFloat(item.getAttribute('data-precio'));
              if (isNaN(price) || price > parseFloat(val)) show = false;
            } else {
              if (item.getAttribute('data-' + key) !== val) show = false;
            }
          });
          item.hidden = !show;
          if (show) visible++;
        });
        if (countEl) countEl.textContent = String(visible);
        if (emptyEl) emptyEl.hidden = visible > 0;
      }

      selects.forEach(function (sel) { sel.addEventListener('change', apply); });
      apply();
    });
  }

  /* ---------- 6. Pestañas de contenido --------------------------------- */
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (root) {
      var btns = Array.prototype.slice.call(root.querySelectorAll('button[data-tab]'));
      var panels = Array.prototype.slice.call(root.querySelectorAll('[data-panel]'));
      if (!btns.length || !panels.length) return;

      var nav = btns[0].parentElement;
      if (nav) nav.setAttribute('role', 'tablist');

      function activate(name, focus) {
        btns.forEach(function (b) {
          var on = b.getAttribute('data-tab') === name;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.setAttribute('tabindex', on ? '0' : '-1');
          if (on && focus) b.focus();
        });
        panels.forEach(function (p) {
          p.hidden = p.getAttribute('data-panel') !== name;
        });
      }

      btns.forEach(function (b, i) {
        b.setAttribute('role', 'tab');
        b.addEventListener('click', function () { activate(b.getAttribute('data-tab'), false); });
        b.addEventListener('keydown', function (e) {
          var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!dir) return;
          e.preventDefault();
          var next = btns[(i + dir + btns.length) % btns.length];
          activate(next.getAttribute('data-tab'), true);
        });
      });
      panels.forEach(function (p) { p.setAttribute('role', 'tabpanel'); });

      var initial = root.querySelector('button[data-tab].is-active') || btns[0];
      activate(initial.getAttribute('data-tab'), false);
    });
  }

  /* ---------- 7. Calculadora solar -------------------------------------- */
  function initCalc() {
    var fmt = new Intl.NumberFormat('es-ES', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0
    });
    document.querySelectorAll('[data-calc]').forEach(function (root) {
      var input = root.querySelector('input[name="consumo"]');
      if (!input) return;

      function out(name, value) {
        var el = root.querySelector('[data-calc-out="' + name + '"]');
        if (el) el.textContent = fmt.format(value);
      }
      function update() {
        var consumo = parseFloat(input.value) || 0;
        var mes = consumo * 0.55;
        out('ahorro-mes', mes);
        out('ahorro-ano', mes * 12);
        out('ahorro-25', mes * 12 * 25);
      }

      root.addEventListener('input', update);
      if (root.tagName === 'FORM') {
        root.addEventListener('submit', function (e) { e.preventDefault(); update(); });
      }
      update();
    });
  }

  /* ---------- 8. Lightbox ------------------------------------------------ */
  function initLightbox() {
    var containers = document.querySelectorAll('[data-lightbox]');
    if (!containers.length) return;

    var overlay = null;
    var lastFocus = null;

    function build() {
      overlay = document.createElement('div');
      overlay.className = 'lightbox';
      overlay.hidden = true;
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Imagen ampliada');
      overlay.innerHTML =
        '<button type="button" class="lightbox__close" aria-label="Cerrar imagen">×</button>' +
        '<img class="lightbox__img" src="" alt="">';
      document.body.appendChild(overlay);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay || e.target.classList.contains('lightbox__close')) close();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !overlay.hidden) close();
      });
    }

    function open(img) {
      if (!overlay) build();
      lastFocus = document.activeElement;
      var big = overlay.querySelector('.lightbox__img');
      big.src = img.getAttribute('data-full') || img.currentSrc || img.src;
      big.alt = img.alt || '';
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      overlay.querySelector('.lightbox__close').focus();
    }

    function close() {
      overlay.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    containers.forEach(function (c) {
      c.querySelectorAll('img').forEach(function (img) {
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
      });
      c.addEventListener('click', function (e) {
        var img = e.target.closest && e.target.closest('img');
        if (img && c.contains(img)) open(img);
      });
      c.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.tagName === 'IMG') {
          e.preventDefault();
          open(e.target);
        }
      });
    });
  }

  /* ---------- 9. Botón "Me interesa" (wa.me con referencia) -------------- */
  function initWaItems() {
    document.querySelectorAll('[data-wa-item]').forEach(function (el) {
      var ref = el.getAttribute('data-ref') || '';
      var msg = el.getAttribute('data-msg') || document.body.getAttribute('data-wa') || 'Hola, me interesa';
      var text = ref ? msg + ' (Ref: ' + ref + ')' : msg;
      var url = waUrl(text);
      if (el.tagName === 'A') {
        el.href = url;
        el.target = '_blank';
        el.rel = 'noopener';
      } else {
        el.addEventListener('click', function () {
          window.open(url, '_blank', 'noopener');
        });
      }
    });
  }

  /* ---------- 10. Nav móvil ---------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
    });
  }

  /* ---------- 11. Reveal -------------------------------------------------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 12. Año ------------------------------------------------------ */
  function initYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = year;
    });
  }

  /* ---------- Arranque (13: los anchors los compensa el CSS) --------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initDemobar();
    initFab();
    initForms();
    initBA();
    initFilters();
    initTabs();
    initCalc();
    initLightbox();
    initWaItems();
    initNav();
    initReveal();
    initYear();
  });
})();
