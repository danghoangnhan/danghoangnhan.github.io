/*
 * Hide the fixed navbar on scroll-down, reveal it on scroll-up.
 *
 * This is all that survives of the original jQuery version. The rest of that
 * file drove elements that do not exist in any layout (.back-to-top), or that
 * only render behind an unset config key (.alertbar), or set a margin from a
 * missing <header> element (which produced an invalid declaration the browser
 * discarded anyway). Bootstrap 5 has no jQuery dependency, so dropping those
 * let jquery.min.js go with them.
 *
 * The visual movement comes from the inline `top` below plus the
 * `transition: top .2s ease-in-out` on .mediumnavigation in screen.css.
 */
(function () {
  "use strict";

  var nav = document.querySelector("nav.mediumnavigation");
  if (!nav) return;

  var DELTA = 5; // ignore scroll jitter smaller than this
  var lastScrollTop = 0;
  var ticking = false;

  function update() {
    ticking = false;

    var st = window.pageYOffset || document.documentElement.scrollTop;
    var navHeight = nav.offsetHeight;

    if (Math.abs(lastScrollTop - st) <= DELTA) return;

    if (st > lastScrollTop && st > navHeight) {
      // Scrolling down and clear of the navbar: tuck it away.
      nav.classList.remove("nav-down");
      nav.classList.add("nav-up");
      nav.style.top = -navHeight + "px";
    } else if (st + window.innerHeight < document.documentElement.scrollHeight) {
      // Scrolling up, and not just rubber-banding at the bottom.
      nav.classList.remove("nav-up");
      nav.classList.add("nav-down");
      nav.style.top = "0px";
    }

    lastScrollTop = st;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
})();
