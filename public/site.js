/* SecretPub - interactions (brief v2 : précision, pas d'agitation) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Soulignement au marqueur du H1 (se dessine à l'arrivée)
  window.addEventListener('load', function () {
    requestAnimationFrame(function () { document.body.classList.add('loaded'); });
  });
  // filet : si load a déjà eu lieu ou tarde
  setTimeout(function () { document.body.classList.add('loaded'); }, 900);

  // Détection d'entrée en viewport par position de scroll.
  // (Volontairement sans IntersectionObserver : certains contextes
  // d'intégration le gelènt ; le calcul direct marche partout.)
  var watchers = [];
  function watch(el, onEnter, ratio) {
    if (!el) return;
    watchers.push({ el: el, fn: onEnter, ratio: ratio || 0.92 });
  }
  var ticking = false;
  function checkWatchers() {
    ticking = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = watchers.length - 1; i >= 0; i--) {
      var w = watchers[i];
      var r = w.el.getBoundingClientRect();
      if (r.top < vh * w.ratio && r.bottom > 0) {
        watchers.splice(i, 1);
        w.fn(w.el);
      }
    }
  }
  function requestCheck() {
    if (!ticking) { ticking = true; setTimeout(checkWatchers, 40); }
  }
  window.addEventListener('scroll', requestCheck, { passive: true });
  window.addEventListener('resize', requestCheck);
  // premiers passages (chargement, polices, ancres)
  [0, 120, 400, 1000].forEach(function (d) { setTimeout(checkWatchers, d); });

  // Reveal au scroll (fade-up 20 px, une seule fois)
  document.querySelectorAll('.reveal').forEach(function (el) {
    watch(el, function () { el.classList.add('armed'); });
  });

  // 2. Compteurs du bandeau preuve (0 → valeur, à l'apparition)
  document.querySelectorAll('[data-count]').forEach(function (el) {
    if (reduceMotion) return;
    watch(el, function () {
      var end = parseInt(el.getAttribute('data-count'), 10);
      var start = parseInt(el.getAttribute('data-from') || '0', 10);
      var dur = 1400;
      var t0 = null;
      function tick(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(start + (end - start) * eased).toString();
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, 0.96);
  });

  // 5. Mockup Plug&Print : glisse au scroll, notification après 1 s
  var mock = document.getElementById('plugMock');
  if (mock) {
    watch(mock, function () {
      mock.classList.add('in');
      var toast = mock.querySelector('.pm-toast');
      if (toast) setTimeout(function () { toast.classList.add('show'); }, 1000);
    }, 0.78);
  }

  // Carte de France : pins en cascade à l'apparition
  var fmap = document.getElementById('franceMap');
  if (fmap) {
    watch(fmap, function () { fmap.classList.add('in'); }, 0.7);
  }

  // Méthode : jauge + vignettes qui s'animent à l'apparition
  var mSteps = document.getElementById('methodeSteps');
  if (mSteps) {
    watch(mSteps, function () { mSteps.classList.add('in'); }, 0.9);
  }

  // Header liquid glass : état "scrolled"
  var siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    var onScrollHeader = function () {
      siteHeader.classList.toggle('scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();
  }

  // Fusion du voyant vert dans le titre Réalisations (lié au scroll, bidirectionnel)
  var fusion = document.getElementById('fusionTrack');
  var realSec = document.getElementById('realisations');
  var realIgnite = realSec && realSec.querySelector('.rh-ignite');
  if (fusion && realSec && realIgnite) {
    var onFusion = function () {
      var r = realSec.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var start = vh * 0.72, end = vh * 0.12;
      var praw = (start - r.top) / (start - end);
      praw = Math.max(0, Math.min(1, praw));
      var visible = praw > 0.04;
      fusion.style.setProperty('--p1', praw);
      fusion.style.setProperty('--d-op', visible ? 1 : 0);
      fusion.style.setProperty('--d-sc', visible ? 1 : 0.4);
      realIgnite.style.setProperty('--ign', (praw * 100) + '%');
      realIgnite.classList.toggle('lit', praw >= 0.985);
    };
    window.addEventListener('scroll', onFusion, { passive: true });
    window.addEventListener('resize', onFusion);
    onFusion();
  }

  // Parallaxe FAQ : les feuilles apparaissent une à une au scroll
  var faqLeaves = document.getElementById('faqLeaves');
  if (faqLeaves) {
    var leaves = [
      faqLeaves.querySelector('.leaf-bot'),
      faqLeaves.querySelector('.leaf-mid'),
      faqLeaves.querySelector('.leaf-top')
    ];
    var onLeaves = function () {
      var r = faqLeaves.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // progression calibrée : 0 quand le centre des feuilles entre par le bas,
      // 1 quand il atteint ~40% de la hauteur de l'écran
      var center = r.top + r.height / 2;
      var start = vh * 0.95, end = vh * 0.42;
      var p = (start - center) / (start - end);
      p = Math.max(0, Math.min(1, p));
      var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
      leaves.forEach(function (lf, i) {
        if (!lf) return;
        // cascade douce : bot (0) → mid → top, chaque couche sur 70% de la course
        var seg = i * 0.15;
        var lp = Math.max(0, Math.min(1, (p - seg) / 0.7));
        var e = easeOut(lp);
        lf.style.setProperty('--lo', e.toFixed(3));
        lf.style.setProperty('--ly', (44 * (1 - e)).toFixed(1) + 'px');
        lf.style.setProperty('--ls', (0.92 + 0.08 * e).toFixed(3));
        // parallaxe continue très légère, divergente par couche
        lf.style.setProperty('--pp', ((p - 0.5) * (3 + i * 5)).toFixed(1) + 'px');
      });
      faqLeaves.classList.toggle('settled', p >= 0.92);
    };
    window.addEventListener('scroll', onLeaves, { passive: true });
    window.addEventListener('resize', onLeaves);
    onLeaves();
  }

  // Menu mobile (drawer latéral)
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  var menuOverlay = document.getElementById('menuOverlay');
  var menuClose = document.getElementById('menuClose');
  if (burger && mobileMenu) {
    var openMenu = function () {
      mobileMenu.classList.add('open');
      if (menuOverlay) menuOverlay.classList.add('open');
      burger.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    };
    var closeMenu = function () {
      mobileMenu.classList.remove('open');
      if (menuOverlay) menuOverlay.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };
    burger.addEventListener('click', function () {
      if (mobileMenu.classList.contains('open')) closeMenu(); else openMenu();
    });
    if (menuClose) menuClose.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
    });
  }

  // Carrousel grand format (flèches, points, glisser, défilement doux)
  var caro = document.getElementById('swCarousel');
  if (caro) {
    var caroTrack = document.getElementById('swcTrack');
    var slides = caroTrack.children.length;
    var dotsWrap = document.getElementById('swcDots');
    var idx = 0;
    var timer = null;
    for (var d = 0; d < slides; d++) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Photo ' + (d + 1));
      (function (k) { b.addEventListener('click', function () { go(k); pause(); }); })(d);
      dotsWrap.appendChild(b);
    }
    function go(k) {
      idx = (k + slides) % slides;
      caroTrack.style.transform = 'translateX(-' + idx * 100 + '%)';
      Array.prototype.forEach.call(dotsWrap.children, function (dot, j) {
        dot.classList.toggle('on', j === idx);
      });
    }
    function pause() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    document.getElementById('swcPrev').addEventListener('click', function () { go(idx - 1); pause(); });
    document.getElementById('swcNext').addEventListener('click', function () { go(idx + 1); pause(); });
    caro.addEventListener('pointerdown', pause, { passive: true });
    // défilement automatique doux, stoppé à la première interaction
    timer = setInterval(function () { go(idx + 1); }, 5000);
    go(0);
    // balayage tactile
    var sx = null;
    caro.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    caro.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });
  }

  // Galerie réalisations : filtres + pagination (9 par page)
  var filters = document.getElementById('filters');
  var realGridEl = document.getElementById('realGrid');
  var pager = document.getElementById('realPager');
  var realPrev = document.getElementById('realPrev');
  var realNext = document.getElementById('realNext');
  // 6 photos par page sur mobile/tablette, 9 sur desktop.
  function computePerPage() { return window.matchMedia('(min-width: 1025px)').matches ? 9 : 6; }
  var PER_PAGE = computePerPage();
  var curCat = 'tout';
  var curSub = 'tout';
  var curPage = 1;
  var curPages = 1;
  var subbar = document.getElementById('subfilters');
  var SUB_LABELS = {
    enseignes: 'Enseignes', lettres: 'Lettres découpées', panneaux: 'Panneaux',
    facade: 'Habillage de façade', totems: 'Totems', vitrophanie: 'Vitrophanie', vehicule: 'Marquage véhicule', baches: 'Bâches échafaudage',
    cartes: 'Cartes de visite', brochures: 'Brochures', plv: 'Affiches et PLV', kakemonos: 'Kakémonos', grandformat: 'Grand format',
    vetements: 'Vêtements de travail', casquettes: 'Casquettes', dotation: 'Dotation réseau', broderie: 'Broderie',
    objets: 'Objets publicitaires', gourdes: 'Gourdes et mugs', totebags: 'Tote bags',
    boites: 'Boîtes et étuis', pochettes: 'Pochettes', emballage: 'Emballage sur-mesure', sacs: 'Sacs kraft'
  };
  var allItems = realGridEl ? Array.prototype.slice.call(realGridEl.querySelectorAll('.real-item')) : [];
  if (realGridEl) realGridEl.classList.add('expanded');

  // Catégories taguées sur les photos d'un projet (pour le tri par produit).
  function itemPhotoCats(item) {
    return Array.prototype.slice.call(item.querySelectorAll('img.ph[data-pcat]'))
      .map(function (im) { return im.getAttribute('data-pcat'); });
  }
  // Mots-clés de sous-catégorie d'un projet : data-sub peut en contenir plusieurs
  // (séparés par virgule) et chaque photo extra peut en porter d'autres (data-psub).
  // On rassemble tout, dédupliqué, pour que CHAQUE mot-clé pilote un filtre.
  function subKeysOf(item) {
    var out = [];
    var push = function (v) {
      (v || '').split(',').forEach(function (x) {
        var t = x.trim();
        if (t && out.indexOf(t) === -1) out.push(t);
      });
    };
    push(item.getAttribute('data-sub'));
    Array.prototype.slice.call(item.querySelectorAll('img.ph[data-psub]'))
      .forEach(function (im) { push(im.getAttribute('data-psub')); });
    return out;
  }
  // Mots-clés de sous-catégorie appartenant à UNE catégorie précise : on n'affiche
  // dans la barre que les sous-filtres pertinents (data-sub de l'item si l'item est de
  // cette catégorie ; data-psub d'une photo si la photo est taguée de cette catégorie,
  // ou non taguée mais le projet l'est). Évite qu'un projet textile ayant une photo
  // signa injecte « Sweats » dans la barre signa.
  function subKeysInCat(item, cat) {
    var out = [];
    var push = function (v) {
      (v || '').split(',').forEach(function (x) {
        var t = x.trim();
        if (t && out.indexOf(t) === -1) out.push(t);
      });
    };
    var ownCat = item.getAttribute('data-cat');
    if (ownCat === cat) push(item.getAttribute('data-sub'));
    Array.prototype.slice.call(item.querySelectorAll('img.ph[data-psub]')).forEach(function (im) {
      var pc = im.getAttribute('data-pcat');
      if (pc === cat || (!pc && ownCat === cat)) push(im.getAttribute('data-psub'));
    });
    return out;
  }
  // Échappement HTML (attribut + texte) pour construire des boutons en toute sécurité.
  function escHtml(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function matchesCat(item) {
    if (curCat !== 'tout') {
      if (item.getAttribute('data-cat') !== curCat &&
          itemPhotoCats(item).indexOf(curCat) === -1) return false;
    }
    if (curSub !== 'tout' && subKeysOf(item).indexOf(curSub) === -1) return false;
    return true;
  }
  // Quand on filtre par catégorie, affiche la photo du projet taguée avec cette
  // catégorie (sinon la photo principale). Mémorise l'index pour la visionneuse.
  function applyPhotoPreview(item) {
    var mainImg = item.querySelector('img.ri-main');
    if (!mainImg) return;
    if (!mainImg.getAttribute('data-orig')) {
      mainImg.setAttribute('data-orig', mainImg.getAttribute('src') || '');
    }
    if (mainImg.getAttribute('data-orig-pos') === null) {
      mainImg.setAttribute('data-orig-pos', mainImg.style.objectPosition || '');
    }
    var photos = Array.prototype.slice.call(item.querySelectorAll('img.ph'));
    var chosen = mainImg.getAttribute('data-orig');
    var chosenPos = mainImg.getAttribute('data-orig-pos') || '';
    var idx = 0;
    var pickPhoto = function (k) {
      chosen = photos[k].getAttribute('data-orig') || photos[k].getAttribute('src');
      chosenPos = photos[k].getAttribute('data-pos') || '';
      idx = k;
    };
    var psubOf = function (im) {
      return (im.getAttribute('data-psub') || '').split(',').map(function (x) { return x.trim(); });
    };
    if (curSub !== 'tout') {
      // Sous-filtre actif : on montre la photo taguée avec ce mot-clé, même si le
      // projet est classé sous une autre sous-catégorie (ex. la photo « Tapis d'entrée »
      // d'un projet Revigest par ailleurs « Adhésifs »). Sinon on garde la 1re photo.
      for (var si = 0; si < photos.length; si++) {
        if (psubOf(photos[si]).indexOf(curSub) !== -1) { pickPhoto(si); break; }
      }
    } else if (curCat !== 'tout' && item.getAttribute('data-cat') !== curCat) {
      // On ne bascule sur la photo taguée de la catégorie filtrée QUE si le projet est
      // d'une catégorie DIFFÉRENTE (ex. un projet "textile" qui a aussi une photo signa).
      // Si le projet est déjà de la catégorie filtrée, on garde toujours la 1re photo.
      for (var k = 0; k < photos.length; k++) {
        if (photos[k].getAttribute('data-pcat') === curCat) { pickPhoto(k); break; }
      }
    }
    mainImg.setAttribute('src', chosen);
    mainImg.style.objectPosition = chosenPos || '50% 50%';
    item._startIdx = idx;
  }

  // Construit la barre de sous-catégories pour la catégorie active (apparaît au clic)
  function buildSubBar(cat) {
    if (!subbar) return;
    if (cat === 'tout') {
      subbar.classList.remove('open');
      subbar.setAttribute('hidden', '');
      subbar.innerHTML = '';
      return;
    }
    var seen = [];
    allItems.forEach(function (it) {
      var inCat = it.getAttribute('data-cat') === cat
        || itemPhotoCats(it).indexOf(cat) !== -1;
      if (!inCat) return;
      subKeysInCat(it, cat).forEach(function (s) {
        if (seen.indexOf(s) === -1) seen.push(s);
      });
    });
    seen.sort(function (a, b) { return a.localeCompare(b, 'fr'); });
    if (seen.length < 2) {  // pas de sous-catégorie utile
      subbar.classList.remove('open');
      subbar.setAttribute('hidden', '');
      subbar.innerHTML = '';
      return;
    }
    var html = '<button class="on" data-sub="tout">Tout</button>';
    seen.forEach(function (s) {
      html += '<button data-sub="' + escHtml(s) + '">' + escHtml(SUB_LABELS[s] || s) + '</button>';
    });
    subbar.innerHTML = html;
    subbar.removeAttribute('hidden');
    requestAnimationFrame(function () { subbar.classList.add('open'); });
  }

  function scrollToGrid() {
    if (!realGridEl) return;
    var y = realGridEl.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function buildPager(pages) {
    if (!pager) return;
    pager.innerHTML = '';
    if (pages <= 1) { pager.style.display = 'none'; return; }
    pager.style.display = 'flex';
    var mk = function (label, page, opts) {
      opts = opts || {};
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pg-btn' + (opts.cls ? ' ' + opts.cls : '') + (opts.active ? ' on' : '');
      b.innerHTML = label;
      if (opts.disabled) { b.disabled = true; }
      else { b.addEventListener('click', function () { curPage = page; renderGallery(); scrollToGrid(); }); }
      pager.appendChild(b);
    };
    var mkEllipsis = function () {
      var s = document.createElement('span');
      s.className = 'pg-ellipsis'; s.textContent = '\u2026';
      pager.appendChild(s);
    };
    mk('\u2039', curPage - 1, { cls: 'arrow', disabled: curPage === 1 });
    // Pager condens\u00e9 : page 1, derni\u00e8re page, et une fen\u00eatre autour de la page courante
    // (\u2026). Pas toute la suite de chiffres.
    var show = {};
    show[1] = 1; show[pages] = 1;
    for (var d = -1; d <= 1; d++) { var w = curPage + d; if (w >= 1 && w <= pages) show[w] = 1; }
    var list = Object.keys(show).map(Number).sort(function (a, b) { return a - b; });
    var prev = 0;
    list.forEach(function (p) {
      if (p - prev > 1) mkEllipsis();
      mk(String(p), p, { active: p === curPage });
      prev = p;
    });
    mk('\u203a', curPage + 1, { cls: 'arrow', disabled: curPage === pages });
  }

  // Flèches latérales de la grille : navigation page par page.
  function updateSideArrows() {
    [[realPrev, curPage > 1], [realNext, curPage < curPages]].forEach(function (pair) {
      var el = pair[0]; if (!el) return;
      if (curPages <= 1) { el.hidden = true; return; }
      el.hidden = false;
      el.disabled = !pair[1];
    });
  }
  function goPage(delta) {
    var next = curPage + delta;
    if (next < 1 || next > curPages) return;
    curPage = next;
    renderGallery();
  }
  if (realPrev) realPrev.addEventListener('click', function () { goPage(-1); });
  if (realNext) realNext.addEventListener('click', function () { goPage(1); });

  function renderGallery() {
    if (!realGridEl) return;
    var matched = allItems.filter(matchesCat);
    var pages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
    if (curPage > pages) curPage = pages;
    curPages = pages;
    allItems.forEach(function (it) { it.style.display = 'none'; });
    var start = (curPage - 1) * PER_PAGE;
    matched.slice(start, start + PER_PAGE).forEach(function (it) {
      it.style.display = '';
      applyPhotoPreview(it);
    });
    buildPager(pages);
    updateSideArrows();
  }

  function applyFilter(cat) {
    curCat = cat; curSub = 'tout'; curPage = 1;
    if (filters) {
      filters.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-filter') === cat);
      });
    }
    buildSubBar(cat);
    renderGallery();
  }
  function applySub(sub) {
    curSub = sub; curPage = 1;
    if (subbar) {
      subbar.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-sub') === sub);
      });
    }
    renderGallery();
  }
  if (subbar) {
    subbar.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (btn) applySub(btn.getAttribute('data-sub'));
    });
  }
  if (filters) {
    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (btn) applyFilter(btn.getAttribute('data-filter'));
    });
  }
  // les entrées « Réalisations » du menu déroulant / cartes filtrent la galerie
  document.querySelectorAll('.dropdown a[data-cat], .metier[data-cat], .msc-link[data-cat]').forEach(function (a) {
    a.addEventListener('click', function () { applyFilter(a.getAttribute('data-cat')); });
  });
  if (realGridEl) renderGallery();

  // Recalcule le nombre par page quand on bascule mobile/tablette ↔ desktop.
  if (realGridEl) {
    var ppT = null;
    window.addEventListener('resize', function () {
      if (ppT) clearTimeout(ppT);
      ppT = setTimeout(function () {
        var np = computePerPage();
        if (np !== PER_PAGE) { PER_PAGE = np; curPage = 1; renderGallery(); }
      }, 200);
    });
  }

  // Glisser (maintien du clic + balayage gauche/droite) pour changer de page
  if (realGridEl) {
    var dragStartX = 0, dragging = false, dragMoved = false;
    var curPages = function () { return Math.max(1, Math.ceil(allItems.filter(matchesCat).length / PER_PAGE)); };
    realGridEl.addEventListener('pointerdown', function (e) {
      if (e.button != null && e.button !== 0) return;
      // Sur mobile (tactile) : pas de glisser-paginer, on laisse le scroll vertical
      // natif et le tap pour ouvrir la photo. La pagination se fait par le pager du bas.
      if (e.pointerType === 'touch') return;
      dragging = true; dragMoved = false; dragStartX = e.clientX;
      realGridEl.classList.add('grabbing');
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 6) dragMoved = true;
      if (dragMoved) realGridEl.style.setProperty('--drag', Math.max(-70, Math.min(70, dx * 0.3)) + 'px');
    });
    window.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      realGridEl.classList.remove('grabbing');
      realGridEl.style.removeProperty('--drag');
      var dx = e.clientX - dragStartX;
      if (Math.abs(dx) >= 90) {
        var pages = curPages();
        if (dx < 0 && curPage < pages) { curPage++; renderGallery(); }
        else if (dx > 0 && curPage > 1) { curPage--; renderGallery(); }
        window.__galleryDragged = true;
        setTimeout(function () { window.__galleryDragged = false; }, 60);
      }
    });
  }

  // Envoi vers le back-end (Supabase via /api/leads). Renvoie une promesse
  // résolue à true si l'enregistrement a réussi, false sinon.
  function postLead(payload) {
    return fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  // Formulaire contact : confirmation UNIQUEMENT si l'envoi a réussi.
  var form = document.getElementById('cform');
  if (form) {
    // Fichiers : plusieurs autorisés tant que le TOTAL tient dans la limite
    // (3 Mo, pour ne jamais bloquer l'envoi ni dépasser la limite serveur).
    var MAX_FILE = 3 * 1024 * 1024;
    var fileInput = form.querySelector('input[name="fichier"]');
    var fileNameEl = form.querySelector('.cf-file-name');
    var fileClear = form.querySelector('.cf-file-clear');
    var fileWarn = form.querySelector('.cf-file-warn');
    function resetFile() {
      if (fileInput) fileInput.value = '';
      if (fileNameEl) { fileNameEl.textContent = 'Aucun fichier'; fileNameEl.setAttribute('data-empty', '1'); }
      if (fileClear) fileClear.hidden = true;
      if (fileWarn) { fileWarn.hidden = true; fileWarn.textContent = ''; }
    }
    function totalSize(files) { var t = 0; for (var i = 0; i < files.length; i++) t += files[i].size; return t; }
    function fileList() { return (fileInput && fileInput.files) ? Array.prototype.slice.call(fileInput.files) : []; }
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        var files = fileList();
        if (fileWarn) { fileWarn.hidden = true; fileWarn.textContent = ''; }
        if (!files.length) { resetFile(); return; }
        if (totalSize(files) > MAX_FILE) {
          fileInput.value = '';
          if (fileNameEl) { fileNameEl.textContent = 'Aucun fichier'; fileNameEl.setAttribute('data-empty', '1'); }
          if (fileClear) fileClear.hidden = true;
          if (fileWarn) { fileWarn.hidden = false; fileWarn.textContent = 'Fichiers trop lourds (max 3 Mo au total). Réduisez, ou envoyez par email à contact@secretpub.fr.'; }
          return;
        }
        if (fileNameEl) {
          fileNameEl.textContent = files.length === 1 ? files[0].name : (files.length + ' fichiers');
          fileNameEl.removeAttribute('data-empty');
        }
        if (fileClear) fileClear.hidden = false;
      });
    }
    if (fileClear) fileClear.addEventListener('click', resetFile);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var btn = form.querySelector('button[type="submit"]');
      var fd = new FormData(form);
      var payload = { type: 'contact', source_page: location.pathname };
      fd.forEach(function (v, k) {
        if (k === 'fichier') return; // géré via fileInput.files (multi)
        if (k === 'besoin') { (payload.besoin = payload.besoin || []).push(v); }
        else { payload[k] = v; }
      });
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }

      function finish(ok) {
        if (ok) {
          form.classList.add('sent');
          if (btn) btn.textContent = 'Demande envoyée';
        } else {
          if (btn) { btn.disabled = false; btn.textContent = 'Envoyer ma demande'; }
          var err = form.querySelector('.cform-err');
          if (!err) {
            err = document.createElement('p');
            err.className = 'cform-err'; err.setAttribute('role', 'alert');
            form.appendChild(err);
          }
          err.textContent = "L'envoi a échoué. Réessayez, ou appelez-nous au 09 83 80 93 12.";
        }
      }
      function send() { postLead(payload).then(finish); }

      // Plusieurs fichiers autorisés tant que le total tient dans la limite (3 Mo).
      var files = fileList();
      if (files.length && totalSize(files) <= MAX_FILE) {
        var readers = files.map(function (f) {
          return new Promise(function (res) {
            var r = new FileReader();
            r.onload = function () {
              var s = String(r.result || ''); var c = s.indexOf(',');
              res({ name: f.name, type: f.type || 'application/octet-stream', data: c >= 0 ? s.slice(c + 1) : s });
            };
            r.onerror = function () { res(null); };
            r.readAsDataURL(f);
          });
        });
        Promise.all(readers).then(function (arr) {
          payload.fichiers = arr.filter(Boolean);
          send();
        });
      } else {
        if (files.length) payload.fichier_note = 'Fichiers trop lourds (max 3 Mo au total), non joints. À envoyer par email.';
        send();
      }
    });
  }

  // Carrousel HERO (crossfade PC + stories façon Snap sur mobile : jauge segmentée
  // en haut, tap droite = avancer, tap gauche = reculer, appui long = pause).
  var heroC = document.querySelector('.hero-carousel');
  if (heroC) {
    var hSlides = heroC.querySelectorAll('.hslide');
    var hN = hSlides.length;
    var hDots = document.getElementById('hcDots');
    var hIdx = 0, hTimer = null, H_DUR = 5500;
    var hSegStart = 0, hSegRemain = H_DUR;

    // Points (PC)
    for (var hi = 0; hi < hN; hi++) {
      var hb = document.createElement('button');
      hb.setAttribute('role', 'tab');
      hb.setAttribute('aria-label', 'Slide ' + (hi + 1));
      (function (k) { hb.addEventListener('click', function () { hGo(k); }); })(hi);
      hDots.appendChild(hb);
    }

    // Jauge stories (mobile) + zones de tap
    var hStories = document.createElement('div');
    hStories.className = 'hc-stories';
    hStories.setAttribute('aria-hidden', 'true');
    var hSegs = [];
    for (var sgi = 0; sgi < hN; sgi++) {
      var seg = document.createElement('div'); seg.className = 'hc-seg';
      var fill = document.createElement('span'); fill.className = 'hc-seg-fill';
      seg.appendChild(fill); hStories.appendChild(seg); hSegs.push(seg);
    }
    heroC.appendChild(hStories);
    var hNav = document.createElement('div');
    hNav.className = 'hc-nav hint';
    var mkTap = function (cls, d) {
      var z = document.createElement('div'); z.className = 'hc-tap ' + cls;
      z.innerHTML = '<svg class="hc-tap-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
      return z;
    };
    hNav.appendChild(mkTap('prev', 'M15 18l-6-6 6-6'));
    hNav.appendChild(mkTap('next', 'M9 6l6 6-6 6'));
    heroC.appendChild(hNav);

    function setSegments(active) {
      hSegs.forEach(function (s, i) {
        var f = s.firstChild;
        s.classList.remove('done', 'active');
        if (i < active) { s.classList.add('done'); }
        else if (i === active) {
          f.style.animation = 'none'; void f.offsetWidth; f.style.animation = ''; // relance le remplissage
          s.classList.add('active');
        }
      });
    }
    function startTimer(ms) {
      if (hTimer) { clearTimeout(hTimer); }
      hSegStart = Date.now(); hSegRemain = ms;
      hTimer = setTimeout(function () { hGo(hIdx + 1); }, ms);
    }
    function pauseTimer() {
      if (hTimer) { clearTimeout(hTimer); hTimer = null; }
      hSegRemain = Math.max(300, hSegRemain - (Date.now() - hSegStart));
    }
    function hGo(k) {
      hIdx = (k + hN) % hN;
      hSlides.forEach(function (s, j) { s.classList.toggle('is-active', j === hIdx); });
      Array.prototype.forEach.call(hDots.children, function (d, j) { d.classList.toggle('on', j === hIdx); });
      setSegments(hIdx);
      hStories.classList.remove('paused');
      startTimer(H_DUR);
    }
    function hReset() { startTimer(H_DUR); }

    var hcPrev = document.getElementById('hcPrev'), hcNext = document.getElementById('hcNext');
    if (hcPrev) hcPrev.addEventListener('click', function () { hGo(hIdx - 1); });
    if (hcNext) hcNext.addEventListener('click', function () { hGo(hIdx + 1); });
    heroC.addEventListener('mouseenter', function () { pauseTimer(); hStories.classList.add('paused'); });
    heroC.addEventListener('mouseleave', function () { hStories.classList.remove('paused'); startTimer(hSegRemain); });

    // Indice lumineux : montré au départ, retiré au bout de 2,8 s ou à la 1re interaction
    var hHintT = setTimeout(removeHint, 2800);
    function removeHint() { if (hHintT) { clearTimeout(hHintT); hHintT = null; } hNav.classList.remove('hint'); }

    // Tap / swipe / appui long sur la zone média (mobile)
    var dX = 0, dY = 0, dT = 0, down = false;
    hNav.addEventListener('pointerdown', function (e) {
      down = true; dX = e.clientX; dY = e.clientY; dT = Date.now();
      pauseTimer(); hStories.classList.add('paused'); removeHint();
    });
    hNav.addEventListener('pointerup', function (e) {
      if (!down) return; down = false;
      var dt = Date.now() - dT, dx = e.clientX - dX, dy = e.clientY - dY;
      hStories.classList.remove('paused');
      if (Math.abs(dy) > 16 && Math.abs(dy) > Math.abs(dx)) { startTimer(hSegRemain); return; } // scroll vertical
      if (Math.abs(dx) > 40) { hGo(hIdx + (dx < 0 ? 1 : -1)); return; } // swipe
      if (dt < 260 && Math.abs(dx) < 12) { // tap : zone gauche = retour, droite = avancer
        var r = hNav.getBoundingClientRect();
        hGo(hIdx + ((e.clientX - r.left) / r.width < 0.4 ? -1 : 1));
        return;
      }
      startTimer(hSegRemain); // appui long relâché : reprend le temps restant
    });
    hNav.addEventListener('pointercancel', function () {
      if (!down) return; down = false;
      hStories.classList.remove('paused'); startTimer(hSegRemain);
    });

    // Calibrage : on fixe la zone texte mobile sur le slide le PLUS HAUT → le texte
    // (eyebrow inclus) n'est jamais coupé, quel que soit le téléphone / la taille de police.
    function calibrateHero() {
      if (!window.matchMedia('(max-width: 880px)').matches) return;
      var maxH = 0;
      Array.prototype.forEach.call(heroC.querySelectorAll('.hslide-inner'), function (inner) {
        var ph = inner.style.height;
        inner.style.height = 'auto';
        if (inner.scrollHeight > maxH) maxH = inner.scrollHeight;
        inner.style.height = ph;
      });
      if (maxH) heroC.style.setProperty('--hero-text-h', maxH + 'px');
    }
    calibrateHero();
    [200, 700, 1400].forEach(function (d) { setTimeout(calibrateHero, d); });
    var hcalT = null;
    window.addEventListener('resize', function () { if (hcalT) clearTimeout(hcalT); hcalT = setTimeout(calibrateHero, 200); });

    hGo(0);
  }

  // Visionneuse (lightbox) des réalisations - multi-photos par projet
  (function () {
    var grid = document.getElementById('realGrid');
    if (!grid) return;
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.innerHTML = '<button class="lb-close" aria-label="Fermer">\u00d7</button>'
      + '<div class="lb-panel">'
      +   '<div class="lb-stories" aria-hidden="true"></div>'
      +   '<div class="lb-media">'
      +     '<div class="lb-frame">'
      +       '<button type="button" class="lb-tapzone prev" aria-label="Photo précédente"></button>'
      +       '<button type="button" class="lb-tapzone next" aria-label="Photo suivante"></button>'
      +       '<button class="lb-nav lb-prev" aria-label="Photo précédente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>'
      +       '<img class="lb-main" alt="" />'
      +       '<span class="lb-count-lb" aria-hidden="true"></span>'
      +       '<span class="lb-cat-badge" aria-hidden="true"></span>'
      +       '<button class="lb-nav lb-next" aria-label="Photo suivante"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>'
      +     '</div>'
      +     '<div class="lb-thumbs"></div>'
      +   '</div>'
      +   '<div class="lb-sep"></div>'
      +   '<div class="lb-info"><h3 class="lb-title"></h3><div class="lb-soc"><span class="lb-soc-v"></span></div><p class="lb-desc"></p></div>'
      +   '<div class="lb-scrollhint" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>Faire défiler</div>'
      + '</div>';
    document.body.appendChild(box);
    var lbImg = box.querySelector('.lb-media img.lb-main');
    var lbCount = box.querySelector('.lb-count-lb');
    var lbCat = box.querySelector('.lb-cat-badge');
    var lbTitle = box.querySelector('.lb-title');
    var lbDesc = box.querySelector('.lb-desc');
    var lbSocRow = box.querySelector('.lb-soc');
    var lbSocV = box.querySelector('.lb-soc-v');
    var lbThumbs = box.querySelector('.lb-thumbs');
    var prevBtn = box.querySelector('.lb-prev');
    var nextBtn = box.querySelector('.lb-next');
    var lbStories = box.querySelector('.lb-stories');
    var tapPrev = box.querySelector('.lb-tapzone.prev');
    var tapNext = box.querySelector('.lb-tapzone.next');
    var lbInfo = box.querySelector('.lb-info');
    var lbPanel = box.querySelector('.lb-panel');
    if (lbInfo && lbPanel) {
      lbInfo.addEventListener('scroll', function () {
        if (lbInfo.scrollTop > 6) lbPanel.classList.add('info-scrolled');
      }, { passive: true });
    }
    // Chaque photo porte les infos de SON projet (titre, catégorie, société,
    // description) → tout reste synchronisé quand on navigue entre projets fusionnés.
    var st = { item: null, photos: [], idx: 0 };
    function esc(s) {
      return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function itemMeta(it) {
      var catEl = it.querySelector('.ri-cat');
      return {
        cap: (it.querySelector('.ri-cap') || {}).textContent || '',
        cat: catEl ? catEl.textContent.trim() : '',
        soc: it.getAttribute('data-soc') || '',
        desc: it.getAttribute('data-desc') ||
          'Réalisation SecretPub : conçue, produite et posée par nos équipes, à la charte du client.'
      };
    }

    function slotSrc(img) {
      if (!img) return null;
      var src = img.getAttribute('src');
      return src ? src : null;
    }
    function itemSlots(item) { return Array.prototype.slice.call(item.querySelectorAll('img.ph')); }
    function filledSrcs(item) {
      // Pour la photo principale, on garde la source d'origine même si l'aperçu
      // a été remplacé par une photo filtrée (l'ordre des photos reste correct).
      return itemSlots(item).map(function (im) {
        if (im.classList.contains('ri-main') && im.getAttribute('data-orig')) {
          return im.getAttribute('data-orig');
        }
        return slotSrc(im);
      }).filter(function (s) { return !!s; });
    }
    function render() {
      var photos = st.photos;
      var cur = photos[st.idx] || {};
      var multi = photos.length > 1;
      var projSet = {};
      photos.forEach(function (p) { projSet[p.proj] = 1; });
      var multiProj = Object.keys(projSet).length > 1;

      // Affichage SANS FLASH : on précharge la photo cible et on ne remplace la source
      // que lorsqu'elle est prête. L'image en cours reste visible en attendant → plus
      // de réaffichage de la 1re photo / flash entre deux vues.
      (function () {
        var target = cur.src || '';
        if (lbImg.getAttribute('src') === target) { lbImg.style.opacity = 1; return; }
        var swap = function () {
          if (!st.photos[st.idx] || st.photos[st.idx].src !== target) return; // on a re-navigué entre-temps
          lbImg.setAttribute('src', target);
          lbImg.style.opacity = 1;
        };
        lbImg.style.opacity = 0.32; // léger fondu sur l'image en cours pendant le chargement
        var pre = new Image();
        pre.onload = swap; pre.onerror = swap;
        pre.src = target;
        if (pre.complete) swap();
      })();
      // Infos synchronisées avec la photo (donc le projet) en cours.
      lbTitle.textContent = cur.cap || '';
      lbCat.textContent = cur.cat || '';
      lbCat.style.display = cur.cat ? '' : 'none';
      lbSocV.textContent = cur.soc || 'Communiqué sur demande';
      lbSocRow.style.display = '';
      lbDesc.textContent = cur.desc || '';
      // Indice « faire défiler » quand le texte dépasse la zone visible.
      if (lbInfo && lbPanel) {
        lbPanel.classList.remove('info-scrolled');
        requestAnimationFrame(function () {
          lbInfo.scrollTop = 0;
          lbPanel.classList.toggle('info-scroll', lbInfo.scrollHeight > lbInfo.clientHeight + 6);
        });
      }
      prevBtn.style.display = multi ? '' : 'none';
      nextBtn.style.display = multi ? '' : 'none';
      if (lbCount) { lbCount.style.display = multi ? '' : 'none'; lbCount.textContent = (st.idx + 1) + ' / ' + photos.length; }

      var html = '';
      if (multi) {
        photos.forEach(function (p, i) {
          // Séparateur + petit label entre deux projets : en mode « produit » on
          // repère chaque bloc par son client (les titres se répètent) ; sinon par
          // le titre du projet.
          if (multiProj && i > 0 && p.proj !== photos[i - 1].proj) {
            var sepLbl = st.mode === 'product' ? (p.soc || p.cap) : p.cap;
            html += '<div class="lb-thumb-sep"><span>' + esc(sepLbl) + '</span></div>';
          }
          html += '<button class="lb-thumb' + (i === st.idx ? ' on' : '') + '" data-i="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + esc(p.src) + '" alt="" /></button>';
        });
      }
      lbThumbs.innerHTML = html;
      // Jauge stories (mobile) : une barre par photo, remplie jusqu'à la photo active.
      if (lbStories) {
        if (multi) {
          var gh = '';
          for (var gi = 0; gi < photos.length; gi++) {
            gh += '<div class="lb-seg ' + (gi < st.idx ? 'done' : gi === st.idx ? 'active' : '') + '"><i></i></div>';
          }
          lbStories.innerHTML = gh;
          lbStories.style.display = '';
        } else { lbStories.innerHTML = ''; lbStories.style.display = 'none'; }
      }
      if (tapPrev) tapPrev.style.display = multi ? '' : 'none';
      if (tapNext) tapNext.style.display = multi ? '' : 'none';
      // Centre la miniature active DANS la bande (scroll horizontal interne seulement,
      // jamais la page → corrige le bug de scroll).
      var onThumb = lbThumbs.querySelector('.lb-thumb.on');
      if (onThumb) {
        var tr = lbThumbs.getBoundingClientRect(), brc = onThumb.getBoundingClientRect();
        var delta = (brc.left - tr.left) - (lbThumbs.clientWidth - onThumb.offsetWidth) / 2;
        lbThumbs.scrollTo({ left: lbThumbs.scrollLeft + delta, behavior: 'smooth' });
      }
    }
    function go(d) {
      if (!st.photos.length) return;
      st.idx = (st.idx + d + st.photos.length) % st.photos.length;
      render();
    }
    function open(item, startSrc) {
      st.item = item;
      // Regroupement de la diapo selon le mode de la tuile cliquée :
      //  - 'self'    : uniquement ce projet ;
      //  - 'client'  : toutes les réalisations de la même Société (Safir → tout Safir) ;
      //  - 'product' : toutes les réalisations partageant un mot-clé de sous-catégorie
      //                (cartes de visite de clients différents — chaque photo garde son client).
      // On lit TOUS les items (jamais retirés du DOM) → marche entre pages et catégories.
      var norm = function (s) { return (s || '').trim().toLowerCase(); };
      var keysOf = function (v) {
        return norm(v).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      };
      var mode = item.getAttribute('data-group')
        || (item.getAttribute('data-merge') === '1' ? 'client' : 'self');
      var all = Array.prototype.slice.call(grid.querySelectorAll('.real-item'));
      var mergeItems = [item];
      if (mode === 'client') {
        var nsoc = norm(item.getAttribute('data-soc'));
        if (nsoc) {
          mergeItems = [item].concat(all.filter(function (it) {
            return it !== item && norm(it.getAttribute('data-soc')) === nsoc;
          }));
        }
      } else if (mode === 'product') {
        var subKeys = keysOf(item.getAttribute('data-sub'));
        var ncat = norm(item.getAttribute('data-cat'));
        var shares = function (it) {
          if (subKeys.length) {
            return keysOf(it.getAttribute('data-sub')).some(function (k) {
              return subKeys.indexOf(k) !== -1;
            });
          }
          return ncat && norm(it.getAttribute('data-cat')) === ncat;
        };
        mergeItems = [item].concat(all.filter(function (it) {
          return it !== item && shares(it);
        }));
      }
      // Construit la liste des photos, chacune reliée aux infos de son projet.
      var photos = [];
      var seen = {};
      mergeItems.forEach(function (it, pi) {
        var meta = itemMeta(it);
        itemSlots(it).forEach(function (im) {
          var s = (im.classList.contains('ri-main') && im.getAttribute('data-orig'))
            ? im.getAttribute('data-orig') : slotSrc(im);
          if (s && !seen[s]) {
            seen[s] = 1;
            // Client propre à la photo (extra) si renseigné, sinon celui du projet.
            var photoSoc = im.getAttribute('data-soc') || meta.soc;
            photos.push({ src: s, cap: meta.cap, cat: meta.cat, soc: photoSoc, desc: meta.desc, proj: pi });
          }
        });
      });
      st.photos = photos;
      st.mode = mode;
      var si = photos.map(function (p) { return p.src; }).indexOf(startSrc);
      st.idx = si < 0 ? 0 : si;
      render();
      box.classList.add('open');
      document.body.classList.add('lb-open'); // verrouille le scroll de la page derrière
    }
    function close() { box.classList.remove('open'); document.body.classList.remove('lb-open'); lbImg.removeAttribute('src'); st.item = null; }

    // - Navigation multi-photos directement sur la vignette -
    function tileRefresh(item) {
      var srcs = filledSrcs(item);
      var multi = srcs.length > 1;
      item.classList.toggle('has-multi', multi);
      var count = item.querySelector('.ri-count');
      if (count) count.textContent = ((item._navIdx || 0) + 1) + '/' + srcs.length;
      return srcs;
    }
    function tileGo(item, d) {
      var srcs = tileRefresh(item);
      if (srcs.length < 2) return;
      var idx = ((item._navIdx || 0) + d + srcs.length) % srcs.length;
      item._navIdx = idx;
      var swap = item.querySelector('.ri-swap');
      if (!swap) return;
      if (idx === 0) { swap.style.opacity = 0; setTimeout(function () { swap.removeAttribute('src'); }, 250); }
      else {
        swap.onload = function () { swap.style.opacity = 1; };
        if (swap.getAttribute('src') === srcs[idx]) swap.style.opacity = 1; else swap.style.opacity = 0;
        swap.setAttribute('src', srcs[idx]);
      }
      var count = item.querySelector('.ri-count');
      if (count) count.textContent = (idx + 1) + '/' + srcs.length;
    }
    Array.prototype.slice.call(grid.querySelectorAll('.real-item')).forEach(function (item) {
      if (item.querySelectorAll('img.ph').length < 2) return;
      var card = item.querySelector('.real-card');
      if (!card) return;
      var swap = document.createElement('img');
      swap.className = 'ri-swap'; swap.alt = '';
      var prev = document.createElement('button');
      prev.type = 'button'; prev.className = 'ri-nav prev'; prev.setAttribute('aria-label', 'Photo précédente');
      prev.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
      var next = document.createElement('button');
      next.type = 'button'; next.className = 'ri-nav next'; next.setAttribute('aria-label', 'Photo suivante');
      next.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
      var count = document.createElement('span');
      count.className = 'ri-count'; count.setAttribute('aria-hidden', 'true');
      card.appendChild(swap); card.appendChild(prev); card.appendChild(next); card.appendChild(count);
      prev.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); tileGo(item, -1); });
      next.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); tileGo(item, 1); });
      item.addEventListener('mouseenter', function () { tileRefresh(item); });
    });
    // État initial une fois le sidecar des photos chargé
    setTimeout(function () {
      Array.prototype.slice.call(grid.querySelectorAll('.real-item')).forEach(function (it) { if (it.querySelector('.ri-swap')) tileRefresh(it); });
    }, 1500);

    // Clic sur une vignette de projet → ouvre la visionneuse
    grid.addEventListener('click', function (e) {
      var item = e.target.closest('.real-item');
      if (!item) return;
      if (window.__galleryDragged) { e.preventDefault(); return; }
      var srcs = filledSrcs(item);
      if (!srcs.length) return; // aucune photo : rien à ouvrir
      e.preventDefault();
      // Ouvre sur la photo filtrée si un filtre l'a sélectionnée, sinon la position de survol.
      var startIdx = (typeof item._startIdx === 'number' && item._startIdx > 0)
        ? item._startIdx
        : (item._navIdx || 0);
      open(item, srcs[Math.min(startIdx, srcs.length - 1)]);
    });
    // Accessibilité clavier : Entrée / Espace ouvre la vignette focalisée.
    grid.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var item = e.target.closest('.real-item');
      if (!item) return;
      var srcs = filledSrcs(item);
      if (!srcs.length) return;
      e.preventDefault();
      var startIdx = (typeof item._startIdx === 'number' && item._startIdx > 0)
        ? item._startIdx : (item._navIdx || 0);
      open(item, srcs[Math.min(startIdx, srcs.length - 1)]);
    });
    // Navigation : flèches + miniatures
    prevBtn.addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); go(1); });
    // Garde anti double-navigation : après un swipe, on ignore le clic de zone de tap
    // qui pourrait suivre (sinon on avance de 2 photos d'un coup).
    var lbLastSwipe = 0;
    // Zones de tap (mobile, façon story Snap) : gauche = photo précédente, droite = suivante.
    if (tapPrev) tapPrev.addEventListener('click', function (e) { e.stopPropagation(); if (Date.now() - lbLastSwipe < 450) return; go(-1); });
    if (tapNext) tapNext.addEventListener('click', function (e) { e.stopPropagation(); if (Date.now() - lbLastSwipe < 450) return; go(1); });
    // VERROU du scroll de l'arrière-plan : dans la visionneuse, seuls le texte (.lb-info)
    // et la bande de miniatures peuvent défiler. Tout le reste est bloqué → fini le
    // "double scroll" avec la page derrière (fiable même sur iOS où overflow:hidden ne
    // suffit pas). Le positionnement reste donc parfaitement stable.
    box.addEventListener('touchmove', function (e) {
      // On n'autorise le scroll QUE si l'élément touché peut réellement défiler
      // (texte plus long que la zone, ou miniatures plus larges). Sinon on bloque tout
      // → plus aucun chaînage vers la page derrière, même quand le texte est court.
      var info = e.target.closest('.lb-info');
      if (info && info.scrollHeight > info.clientHeight + 1) return;
      var th = e.target.closest('.lb-thumbs');
      if (th && th.scrollWidth > th.clientWidth + 1) return;
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    // Swipe horizontal simple : on ne déplace PAS l'image (positionnement droit et stable),
    // on bascule juste de photo au relâchement si le geste est franchement horizontal.
    var lbfx = null, lbfy = null;
    var lbFrame = box.querySelector('.lb-frame');
    if (lbFrame) {
      lbFrame.addEventListener('touchstart', function (e) {
        lbfx = e.touches[0].clientX; lbfy = e.touches[0].clientY;
      }, { passive: true });
      lbFrame.addEventListener('touchend', function (e) {
        if (lbfx === null) return;
        var dx = e.changedTouches[0].clientX - lbfx, dy = e.changedTouches[0].clientY - lbfy;
        if (st.photos.length > 1 && Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
          lbLastSwipe = Date.now();
          go(dx < 0 ? 1 : -1);
        }
        lbfx = null; lbfy = null;
      }, { passive: true });
    }
    lbThumbs.addEventListener('click', function (e) {
      var t = e.target.closest('.lb-thumb');
      if (!t) return;
      e.stopPropagation();
      var i = parseInt(t.getAttribute('data-i'), 10);
      if (!isNaN(i)) { st.idx = i; render(); }
    });
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.closest('.lb-close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    });
  })();

  // Trajectoire lumineuse (rail vert + voyant fuyant) le long des vitrines métiers
  (function () {
    var flows = Array.prototype.slice.call(document.querySelectorAll('.metiers-flow'));
    if (!flows.length) return;
    var items = flows.map(function (flow) {
      return { flow: flow, rail: flow.querySelector('.flow-rail'), fill: flow.querySelector('.flow-rail-fill'), dot: flow.querySelector('.flow-dot') };
    });
    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      items.forEach(function (it) {
        if (!it.rail) return;
        var r = it.flow.getBoundingClientRect();
        var startEdge = vh * 0.78, endEdge = vh * 0.4;
        var p = (startEdge - r.top) / ((startEdge - endEdge) + r.height);
        p = Math.max(0, Math.min(1, p));
        var railH = it.rail.clientHeight;
        if (it.fill) it.fill.style.height = (p * 100) + '%';
        if (it.dot) {
          it.dot.style.top = (p * railH) + 'px';
          it.dot.classList.toggle('on', p > 0.002 && p < 0.998);
        }
      });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  // Carrousel de témoignages
  (function () {
    var track = document.getElementById('testiTrack');
    if (!track) return;
    var cards = Array.prototype.slice.call(track.querySelectorAll('.testi-card'));
    var dotsWrap = document.getElementById('testiDots');
    var idx = 0, timer = null;
    cards.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Témoignage ' + (i + 1));
      b.addEventListener('click', function () { go(i); reset(); });
      dotsWrap.appendChild(b);
    });
    function go(i) {
      idx = (i + cards.length) % cards.length;
      cards.forEach(function (c, j) { c.classList.toggle('on', j === idx); });
      Array.prototype.forEach.call(dotsWrap.children, function (d, j) { d.classList.toggle('on', j === idx); });
    }
    function reset() { if (timer) clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 3500); }
    // Verrou de hauteur : le track est figé sur la carte la plus haute → plus de saut
    // quand on change de témoignage. Recalculé sur resize (largeur/police changent).
    function lockHeight() {
      var maxH = 0;
      cards.forEach(function (c) {
        var pp = c.style.position, pv = c.style.visibility;
        c.style.position = 'relative'; c.style.visibility = 'hidden';
        if (c.offsetHeight > maxH) maxH = c.offsetHeight;
        c.style.position = pp; c.style.visibility = pv;
      });
      if (maxH) track.style.minHeight = maxH + 'px';
    }
    var prev = document.getElementById('testiPrev'), next = document.getElementById('testiNext');
    if (prev) prev.addEventListener('click', function () { go(idx - 1); reset(); });
    if (next) next.addEventListener('click', function () { go(idx + 1); reset(); });
    go(0); reset();
    lockHeight();
    [250, 900].forEach(function (d) { setTimeout(lockHeight, d); }); // après chargement des polices
    var lhT = null;
    window.addEventListener('resize', function () { if (lhT) clearTimeout(lhT); lhT = setTimeout(lockHeight, 200); });
  })();

  // Sur mobile : on place le bloc témoignages ENTRE la pagination et la ligne CTA
  // (« Vous cherchez un exemple… »). Sur PC il reste dans l'en-tête à droite.
  (function () {
    var testi = document.getElementById('testi');
    var ctaLine = document.querySelector('.real-cta-line');
    if (!testi || !ctaLine) return;
    var home = testi.parentNode, homeNext = testi.nextSibling;
    function place() {
      if (window.matchMedia('(max-width: 640px)').matches) {
        if (testi.parentNode !== ctaLine.parentNode || testi.nextElementSibling !== ctaLine) {
          ctaLine.parentNode.insertBefore(testi, ctaLine);
        }
      } else if (testi.parentNode !== home) {
        home.insertBefore(testi, homeNext);
      }
    }
    place();
    var pt = null;
    window.addEventListener('resize', function () { if (pt) clearTimeout(pt); pt = setTimeout(place, 200); });
  })();

  // Allume le gros numéro de la vitrine au niveau de scroll
  (function () {
    var shows = Array.prototype.slice.call(document.querySelectorAll('.metiers-flow .ms-showcase'));
    if (!shows.length) return;
    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      shows.forEach(function (s) {
        var r = s.getBoundingClientRect();
        var mid = r.top + r.height / 2;
        s.classList.toggle('num-on', mid > vh * 0.2 && mid < vh * 0.8);
      });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  // Surlignance des encarts au niveau de scroll
  (function () {
    var spots = Array.prototype.slice.call(document.querySelectorAll('.spotlight'));
    if (!spots.length) return;
    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      spots.forEach(function (s) {
        var r = s.getBoundingClientRect();
        // s'allume dès que le haut franchit 80% du viewport ; reste allumé tant
        // qu'on est à son niveau ou plus bas → conserve les sections déjà passées
        // et suit le sens (monte/descend)
        s.classList.toggle('lit', r.top < vh * 0.8);
      });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  // Logos clients (mobile/tablette) : défilement auto repris en JS + swipe au doigt.
  // (L'animation CSS est coupée sous 1024px, on pilote scrollLeft ici pour que le
  //  défilement continue ET que l'utilisateur puisse faire défiler à la main.)
  var lRow = document.querySelector('.clients .lrow');
  var lTrack = lRow && lRow.querySelector('.ltrack');
  if (lRow && lTrack && window.matchMedia('(max-width: 1024px)').matches) {
    var lPaused = false, lLast = 0, lResumeT = null, lSpeed = 42, lPos = 0;
    var lStep = function (t) {
      if (!lTrack || lTrack.scrollWidth < 2) { requestAnimationFrame(lStep); return; } // rien à défiler
      if (!lLast) lLast = t;
      var dt = (t - lLast) / 1000; lLast = t;
      // Accumulateur flottant : on assigne scrollLeft (les fractions ne se perdent plus).
      if (!lPaused && dt > 0 && dt < 0.1) {
        lPos += lSpeed * dt;
        var half = lTrack.scrollWidth / 2;
        if (half > 0 && lPos >= half) lPos -= half;
        lRow.scrollLeft = lPos;
      }
      requestAnimationFrame(lStep);
    };
    requestAnimationFrame(lStep);
    var lPause = function () { lPaused = true; if (lResumeT) clearTimeout(lResumeT); };
    var lResumeSoon = function () {
      if (lResumeT) clearTimeout(lResumeT);
      lResumeT = setTimeout(function () { lPos = lRow.scrollLeft; lPaused = false; lLast = 0; }, 1400);
    };
    // Pendant que l'utilisateur fait défiler à la main, on suit sa position.
    lRow.addEventListener('scroll', function () { if (lPaused) lPos = lRow.scrollLeft; }, { passive: true });
    lRow.addEventListener('touchstart', lPause, { passive: true });
    lRow.addEventListener('touchend', lResumeSoon, { passive: true });
    lRow.addEventListener('touchcancel', lResumeSoon, { passive: true });
  }

  // Carrousel secteurs (mobile/tablette) : points de navigation synchronisés au scroll.
  var secMobile = document.querySelector('.sectors-mobile');
  if (secMobile) {
    var secCards = Array.prototype.slice.call(secMobile.querySelectorAll('.secm-card'));
    if (secCards.length > 1) {
      var secDots = document.createElement('div');
      secDots.className = 'secm-dots';
      secCards.forEach(function (c, i) {
        var b = document.createElement('button');
        b.setAttribute('type', 'button');
        b.setAttribute('aria-label', 'Secteur ' + (i + 1));
        b.addEventListener('click', function () {
          var raw = c.offsetLeft + c.clientWidth / 2 - secMobile.clientWidth / 2;
          var max = secMobile.scrollWidth - secMobile.clientWidth;
          secMobile.scrollTo({ left: Math.max(0, Math.min(max, raw)), behavior: 'smooth' });
        });
        secDots.appendChild(b);
      });
      secMobile.insertAdjacentElement('afterend', secDots);
      var secSyncRaf = false;
      var secSync = function () {
        secSyncRaf = false;
        var center = secMobile.scrollLeft + secMobile.clientWidth / 2;
        var best = 0, bestD = Infinity;
        secCards.forEach(function (c, i) {
          var cc = c.offsetLeft + c.clientWidth / 2;
          var d = Math.abs(cc - center);
          if (d < bestD) { bestD = d; best = i; }
        });
        Array.prototype.forEach.call(secDots.children, function (d, i) {
          d.classList.toggle('on', i === best);
        });
      };
      secMobile.addEventListener('scroll', function () {
        if (!secSyncRaf) { secSyncRaf = true; window.requestAnimationFrame(secSync); }
      }, { passive: true });
      setTimeout(secSync, 60); // laisse le layout se finaliser avant de marquer le 1er point
    }
  }

  // Scrollytelling secteurs : révélation des photos au fil du scroll
  var sectorsWrap = document.getElementById('sectors');
  if (sectorsWrap) {
    var sectors = Array.prototype.slice.call(sectorsWrap.querySelectorAll('.sector'));
    var railItems = Array.prototype.slice.call(sectorsWrap.querySelectorAll('.fan-index li'));
    var titles = Array.prototype.slice.call(sectorsWrap.querySelectorAll('.fan-title'));
    var gauge = sectorsWrap.querySelector('.fan-gauge-fill');
    var nSec = sectors.length;
    var onSectors = function () {
      var rect = sectorsWrap.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var total = rect.height - vh;
      var p = total > 0 ? (-rect.top) / total : 0;
      p = Math.max(0, Math.min(1, p));
      // f : index flottant 0 .. nSec-1
      var f = p * (nSec - 1);
      var active = Math.round(f);
      // Droite : grande photo paysage en fondu + léger zoom (Ken Burns).
      sectors.forEach(function (sec, i) {
        var d = f - i;
        var ad = Math.abs(d);
        var op = ad <= 0.5 ? 1 : Math.max(0, 1 - (ad - 0.5) * 1.7);
        var sc = 1.05 - 0.05 * op;        // l'image arrive en zoom et se pose
        sec.style.opacity = op.toFixed(3);
        sec.style.transform = 'scale(' + sc.toFixed(3) + ')';
        sec.style.zIndex = String(100 - Math.round(ad * 10));
      });
      // Gauche : menu de secteurs épuré (actif mis en avant).
      railItems.forEach(function (li, i) {
        li.classList.toggle('on', i === active);
      });
      titles.forEach(function (t, i) { t.classList.toggle('on', i === active); });
      if (gauge) gauge.style.setProperty('--p', (p * 100).toFixed(1));
    };
    onSectors();
    window.addEventListener('scroll', onSectors, { passive: true });
    window.addEventListener('resize', onSectors);

    // Clic sur un secteur : saut direct vers sa position de scroll
    railItems.forEach(function (li, i) {
      li.addEventListener('click', function () {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var top = sectorsWrap.getBoundingClientRect().top + window.scrollY;
        var total = sectorsWrap.offsetHeight - vh;
        var dest = top + (nSec > 1 ? (i / (nSec - 1)) : 0) * total;
        window.scrollTo({ top: Math.round(dest) + 2, behavior: 'smooth' });
      });
    });
  }

  // Liste d'attente réseaux (confirmation)
  var wlForm = document.getElementById('wlForm');
  if (wlForm) {
    wlForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = wlForm.querySelector('input[type="email"], input[name="wl-email"]');
      var email = emailInput ? emailInput.value : '';
      var hp = wlForm.querySelector('input[name="company_hp"]');
      var c = document.getElementById('wlConfirm');
      if (c) c.hidden = false;
      postLead({ type: 'waitlist', email: email, company_hp: hp ? hp.value : '', source_page: location.pathname });
      wlForm.reset();
    });
  }

  // Bandeau liste d'attente : masqué par défaut, révélé + scroll auto
  // uniquement au clic sur « Réserver ma place » (ou tout lien vers #liste-attente).
  (function () {
    var wl = document.getElementById('liste-attente');
    if (!wl) return;
    document.querySelectorAll('a[href="#liste-attente"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        wl.classList.add('revealed');
        requestAnimationFrame(function () {
          var y = wl.getBoundingClientRect().top + window.scrollY - 16;
          window.scrollTo({ top: y, behavior: 'smooth' });
          if (typeof requestCheck === 'function') requestCheck();
        });
      });
    });
  })();

  // Lien nav actif selon la page
  var path = location.pathname.split('/').pop();
  document.querySelectorAll('.nav a[data-page]').forEach(function (a) {
    if (a.getAttribute('data-page') === path) a.classList.add('active');
  });
})();