/* Shared interactions. Everything degrades gracefully: with JS off, all
   content is visible and unfiltered. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // hero intro — only reveal once the tab is actually visible, so the
  // fade/blur entrance can never freeze mid-way in a backgrounded tab.
  var hero = document.querySelector('.hero');
  if (hero) {
    var reveal = function () { hero.classList.add('ready'); };
    if (document.visibilityState === 'hidden') {
      var onVis = function () {
        if (document.visibilityState !== 'hidden') {
          document.removeEventListener('visibilitychange', onVis);
          requestAnimationFrame(reveal);
        }
      };
      document.addEventListener('visibilitychange', onVis);
      setTimeout(reveal, 5000); // safety net
    } else {
      requestAnimationFrame(function () { requestAnimationFrame(reveal); });
    }
  }

  // scroll reveals
  if (!reduce && 'IntersectionObserver' in window) {
    var els = Array.prototype.slice.call(document.querySelectorAll(
      '.section-head, .section-top, .manifesto p, .net-card, .feature-card, .audience-card, .stop, .checks li, .person, .show-card, .collab, .prose, .grid-2 > *, .spotlight-grid > *, .cta-inner'
    ));
    els.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = ((i % 5) * 55) + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // program journey: light the stop nearest the middle of the viewport
  var stops = document.querySelectorAll('.journey .stop');
  if (stops.length && 'IntersectionObserver' in window) {
    var jo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('on', en.isIntersecting); });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    stops.forEach(function (s) { jo.observe(s); });
  }

  // program journey: fill the connecting line as you scroll through it
  var journey = document.querySelector('.journey');
  var jfill = journey && journey.querySelector('.j-fill');
  if (journey && jfill && !reduce) {
    var updateFill = function () {
      var r = journey.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      var prog = Math.max(0, Math.min(1, (vh * 0.5 - r.top) / (r.height || 1)));
      var maxH = journey.clientHeight - 14 - 64;
      jfill.style.height = Math.max(0, prog * maxH) + 'px';
    };
    window.addEventListener('scroll', updateFill, { passive: true });
    window.addEventListener('resize', updateFill);
    updateFill();
  }

  // pointer light on cards
  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.net-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }
})();
