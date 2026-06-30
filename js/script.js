/* ============================================================
   RECORD MEDIA — MAIN JAVASCRIPT
   ============================================================ */

(function () {
  'use strict';

  /* ── NAVBAR: sticky on scroll ──────────────────────────── */
  const navbar = document.querySelector('.navbar');

  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  /* ── OFF-CANVAS MOBILE / TABLET NAV DRAWER ──────────────────
     Enhances the existing .menu-toggle + .navbar__links into a
     left slide-in drawer. No per-page HTML is required: the
     backdrop and the drawer "Contact Us" CTA are created here.
     Accessibility: aria-expanded/controls, role=dialog + aria-modal,
     Escape to close, focus moved into the drawer and restored to the
     toggle on close, and a Tab focus-trap while open. */
  var menuToggle = document.querySelector('.menu-toggle');
  var navLinks = document.querySelector('.navbar__links');

  if (menuToggle && navLinks) {
    /* Ensure the drawer is identifiable for ARIA */
    if (!navLinks.id) navLinks.id = 'primary-nav';

    menuToggle.setAttribute('aria-controls', navLinks.id);
    menuToggle.setAttribute('aria-haspopup', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');

    /* Drawer dialog semantics apply ONLY in drawer mode (<=1024px).
       On desktop the same <ul> is an ordinary inline nav, so we strip
       the dialog role there to avoid misleading screen readers. */
    var drawerMq = window.matchMedia('(max-width: 1024px)');

    function syncDrawerRole() {
      if (drawerMq.matches) {
        navLinks.setAttribute('role', 'dialog');
        navLinks.setAttribute('aria-modal', 'true');
        navLinks.setAttribute('aria-label', 'Main menu');
      } else {
        navLinks.removeAttribute('role');
        navLinks.removeAttribute('aria-modal');
        navLinks.removeAttribute('aria-label');
      }
    }
    syncDrawerRole();
    if (drawerMq.addEventListener) {
      drawerMq.addEventListener('change', syncDrawerRole);
    } else if (drawerMq.addListener) {
      drawerMq.addListener(syncDrawerRole); /* older Safari */
    }

    /* Backdrop (created once, reused) */
    var backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);

    /* Surface the "Contact Us" CTA inside the drawer (it's hidden in
       the bar below desktop). Clone it so the desktop one is untouched. */
    var ctaSource = document.querySelector('.navbar__cta .btn-contact');
    if (ctaSource) {
      var ctaItem = document.createElement('li');
      ctaItem.className = 'navbar__drawer-cta';
      var ctaClone = ctaSource.cloneNode(true);
      ctaItem.appendChild(ctaClone);
      navLinks.appendChild(ctaItem);
    }

    var lastFocused = null;

    /* Focusable elements while the drawer is open: the toggle (acts as
       the close button) plus everything inside the drawer. Keeping the
       toggle in the loop lets keyboard users reach the close control. */
    function focusableItems() {
      var inside = navLinks.querySelectorAll('a[href], button:not([disabled])');
      return [menuToggle].concat(Array.prototype.slice.call(inside));
    }

    function openMenu() {
      lastFocused = document.activeElement;
      menuToggle.classList.add('active');
      navLinks.classList.add('open');
      backdrop.classList.add('open');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; /* lock body scroll */
      /* Move focus to the first link inside the drawer */
      var firstLink = navLinks.querySelector('a[href]');
      if (firstLink) firstLink.focus();
    }

    function closeMenu(restoreFocus) {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
      backdrop.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (restoreFocus !== false && lastFocused) lastFocused.focus();
    }

    function isOpen() {
      return navLinks.classList.contains('open');
    }

    menuToggle.addEventListener('click', function () {
      if (isOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    /* Close when the backdrop is clicked */
    backdrop.addEventListener('click', function () {
      closeMenu();
    });

    /* Close when any nav link is selected (don't steal focus — let the
       link navigate / scroll) */
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu(false);
      });
    });

    /* Keyboard: Escape closes; Tab is trapped inside the open drawer */
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
        return;
      }

      if (e.key === 'Tab') {
        var items = focusableItems();
        if (!items.length) return;
        var firstEl = items[0];
        var lastEl = items[items.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    });

    /* If the viewport grows back to desktop while the drawer is open,
       reset cleanly so the inline nav isn't left in a locked state. */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024 && isOpen()) {
        closeMenu(false);
      }
    });
  }

  /* ── WORKS TABS (Latest Works) ──────────────────────────── */
  const tabs       = document.querySelectorAll('.works-tab');
  const workCards  = document.querySelectorAll('.work-card');
  const worksEmpty = document.querySelector('.works-empty');

  function filterWorks(filter) {
    var visibleCount = 0;

    workCards.forEach(function (card) {
      var match = filter === 'all' || card.getAttribute('data-category') === filter;
      if (match) {
        visibleCount++;
        card.hidden = false;
        /* Restart the quick fade-in animation */
        card.classList.remove('work-card--in');
        void card.offsetWidth;          /* force reflow so the anim replays */
        card.classList.add('work-card--in');
      } else {
        card.hidden = true;
        card.classList.remove('work-card--in');
      }
    });

    /* Show the empty-state message when no card matches */
    if (worksEmpty) {
      worksEmpty.hidden = visibleCount > 0;
    }
  }

  if (tabs.length && workCards.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        filterWorks(tab.getAttribute('data-filter'));
      });
    });

    /* Run once on load so the initial active tab is applied */
    var activeTab = document.querySelector('.works-tab.active');
    if (activeTab) filterWorks(activeTab.getAttribute('data-filter'));
  }

  /* ── VIDEO LIGHTBOX (Latest Works) ──────────────────────── */
  var videoModal = document.getElementById('videoModal');
  var videoFrame = document.getElementById('videoFrame');

  /* Fallback pool of YouTube IDs — used when a card has no data-video */
  var videoPool = [
    'ScMzIvxBSi4', 'aqz-KE-bpKQ', 'LXb3EKWsInQ',
    '9bZkp7q19f0', 'kJQP7kiw5Fk', '60ItHLz5WEA'
  ];

  function openVideo(id) {
    if (!videoModal || !videoFrame) return;
    videoFrame.innerHTML =
      '<iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0" ' +
      'title="Video player" frameborder="0" ' +
      'allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" ' +
      'allowfullscreen></iframe>';
    videoModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeVideo() {
    if (!videoModal || !videoFrame) return;
    videoModal.hidden = true;
    videoFrame.innerHTML = '';            /* stops playback */
    document.body.style.overflow = '';
  }

  workCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var id = card.getAttribute('data-video');
      if (!id) {
        /* No video assigned → pick a random one from the pool */
        id = videoPool[Math.floor(Math.random() * videoPool.length)];
      }
      openVideo(id);
    });
  });

  if (videoModal) {
    videoModal.querySelector('.video-modal__close').addEventListener('click', closeVideo);
    videoModal.querySelector('.video-modal__backdrop').addEventListener('click', closeVideo);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !videoModal.hidden) closeVideo();
    });
  }

  /* ── TEAM CAROUSEL (infinite drag / swipe scroll) ───────── */
  document.querySelectorAll('.team-cards').forEach(function (track) {
    /* Wrap the track for layout consistency */
    var wrap = document.createElement('div');
    wrap.className = 'team-carousel';
    track.parentNode.insertBefore(wrap, track);
    wrap.appendChild(track);

    /* Clone the original set twice → three identical copies in a row.
       We keep the scroll position inside the MIDDLE copy and wrap it back
       whenever it crosses a boundary, so the loop is seamless in both
       directions (scrolling left OR right never hits an edge). */
    var originals = Array.prototype.slice.call(track.children);
    var setWidth = 0;

    function buildClones() {
      for (var pass = 0; pass < 2; pass++) {
        originals.forEach(function (card) {
          var clone = card.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          track.appendChild(clone);
        });
      }
    }

    function measure() {
      /* Width of one original set = total / 3 (three identical copies) */
      setWidth = track.scrollWidth / 3;
    }

    function recenter() {
      /* Park the viewport at the start of the middle copy */
      track.scrollLeft = setWidth;
    }

    /* Keep scrollLeft within [setWidth, 2*setWidth) by hopping a whole set.
       If a wrap happens mid-drag, shift the drag's anchor by the same delta
       so the next pointermove stays continuous (no visual jump). */
    function wrap2() {
      if (setWidth <= 0) return;
      var delta = 0;
      if (track.scrollLeft < setWidth) {
        delta = setWidth;
      } else if (track.scrollLeft >= setWidth * 2) {
        delta = -setWidth;
      }
      if (delta) {
        track.scrollLeft += delta;
        if (isDown) startScroll += delta;
      }
    }

    /* ── Drag / swipe to scroll ── */
    var isDown = false;
    var startX = 0;
    var startScroll = 0;
    var moved = false;

    buildClones();
    measure();
    recenter();
    window.addEventListener('resize', function () {
      measure();
      recenter();
    });

    /* Wrap on any scroll (drag, wheel, trackpad, momentum) */
    track.addEventListener('scroll', wrap2);

    track.addEventListener('pointerdown', function (e) {
      isDown = true;
      moved = false;
      startX = e.pageX;
      startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
    });

    track.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });

    function endDrag() {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('is-dragging');
    }

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', endDrag);

    /* Block the click that follows a real drag (so cards don't "click") */
    track.addEventListener(
      'click',
      function (e) {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );
  });

  /* ── SCROLL REVEAL (fade-in) ─────────────────────────────── */
  var fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ── COUNTER ANIMATION ──────────────────────────────────── */
  var counters    = document.querySelectorAll('.stat-item__num');
  var counterDone = false;

  function animateCounters() {
    if (counterDone) return;
    counters.forEach(function (counter) {
      var target   = parseInt(counter.getAttribute('data-target'), 10);
      var suffix   = counter.getAttribute('data-suffix') || '';
      var duration = 1800;
      var start    = 0;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased    = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = target + suffix;
        }
      }

      requestAnimationFrame(step);
    });
    counterDone = true;
  }

  if (counters.length) {
    var counterSection = counters[0].closest('.stats-section');
    if (counterSection && 'IntersectionObserver' in window) {
      var counterObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          animateCounters();
          counterObs.disconnect();
        }
      }, { threshold: 0.3 });
      counterObs.observe(counterSection);
    }
  }

  /* ── NEWSLETTER FORM ─────────────────────────────────────── */
  var newsletterForms = document.querySelectorAll('.footer__newsletter-form');

  newsletterForms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        input.value = '';
        var btn = form.querySelector('button');
        if (btn) {
          var orig = btn.textContent;
          btn.textContent = 'Done!';
          setTimeout(function () {
            btn.textContent = orig;
          }, 2000);
        }
      }
    });
  });

  /* ── CONTACT FORM ────────────────────────────────────────── */
  var contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('.form-submit button');
      if (btn) {
        var orig = btn.textContent;
        btn.textContent = 'Message Sent!';
        btn.style.background = '#1a7a2a';
        btn.style.color = '#fff';
        btn.style.border = '1.5px solid #1a7a2a';
        setTimeout(function () {
          btn.textContent = orig;
          btn.style.background = '';
          btn.style.color = '';
          btn.style.border = '';
        }, 3000);
      }
    });
  }

  /* ── SERVICE PAGE: keyboard navigation between sections ── */
  var serviceSections = document.querySelectorAll('.service-section');

  if (serviceSections.length > 1) {
    var current = 0;

    document.querySelectorAll('.service-nav-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        var dir = pill.classList.contains('service-nav-pill--top') ? -1 : 1;
        current = Math.max(0, Math.min(serviceSections.length - 1, current + dir));
        serviceSections[current].scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ── SMOOTH SCROLL for anchor links ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── TICKER: duplicate content for seamless loop ─────────── */
  var tracks = document.querySelectorAll('.ticker-track');

  tracks.forEach(function (track) {
    /* Content already duplicated in HTML for seamless loop */
  });

})();
