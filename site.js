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
      '.section-head, .manifesto p, .net-card, .sessions li, .checks li, .person, .show-card, .collab, .prose, .grid-2 > *, .cta-inner'
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
