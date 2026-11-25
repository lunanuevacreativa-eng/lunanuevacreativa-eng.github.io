(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile menu toggle */
  var menuBtn = document.querySelector('.menu-btn');
  var mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuBtn.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      });
    });
  }

  /* Split hero headline words while preserving .hl highlighter blocks */
  function splitWords(el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    var words = [];
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        var parts = node.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            var wrap = document.createElement('span');
            wrap.className = 'word-wrap';
            var inner = document.createElement('span');
            inner.className = 'word-inner';
            inner.textContent = part;
            wrap.appendChild(inner);
            frag.appendChild(wrap);
            words.push(inner);
          }
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        var wrapEl = document.createElement('span');
        wrapEl.className = 'word-wrap';
        var clone = node.cloneNode(true);
        clone.classList.add('word-inner');
        wrapEl.appendChild(clone);
        el.replaceChild(wrapEl, node);
        words.push(clone);
      }
    });
    return words;
  }

  if (reduce || typeof window.gsap === 'undefined') {
    return;
  }

  var gsap = window.gsap;
  if (typeof window.ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(window.ScrollTrigger);
  }

  /* Hero cascade (< 1.1s total) */
  var splitTarget = document.querySelector('[data-split]');
  var heroWords = splitTarget ? splitWords(splitTarget) : [];
  var heroStagger = document.querySelectorAll('.hero-stagger');

  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  if (heroWords.length) {
    tl.from(heroWords, {
      yPercent: 105,
      opacity: 0,
      duration: 0.62,
      stagger: 0.045
    });
  }
  if (heroStagger.length) {
    tl.from(heroStagger, {
      y: 18,
      opacity: 0,
      duration: 0.55,
      stagger: 0.08
    }, heroWords.length ? '-=0.45' : 0);
  }

  /* Subtle floating badge */
  var badge = document.querySelector('.float-subtle');
  if (badge) {
    gsap.to(badge, {
      y: -5,
      duration: 2.6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  /* Scroll reveals (ease-out, transform + opacity + clip-path only) */
  if (typeof window.ScrollTrigger !== 'undefined') {
    document.querySelectorAll('.rule-line').forEach(function (line) {
      gsap.from(line, {
        scaleX: 0,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: line,
          start: 'top 88%',
          once: true
        }
      });
    });

    document.querySelectorAll('.reveal').forEach(function (el) {
      gsap.from(el, {
        y: 22,
        opacity: 0,
        duration: 0.62,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      });
    });

    document.querySelectorAll('.reveal-clip').forEach(function (el, idx) {
      gsap.from(el, {
        clipPath: 'inset(0 0 12% 0)',
        y: 18,
        opacity: 0,
        duration: 0.72,
        delay: (idx % 3) * 0.07,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      });
    });
  }
})();
