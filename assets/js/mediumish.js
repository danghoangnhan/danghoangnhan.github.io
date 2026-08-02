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
  var measuring = false;

  /*
   * Publish the navbar's real height so CSS can offset against it.
   *
   * The stylesheets used to hardcode four different guesses at this number
   * — .site-content margin-top: 57px, .post-rail top: 90px, its
   * max-height: calc(100vh - 110px), and scroll-margin-top: 80px on headings.
   * They cannot all be right, and none of them moved when the search field and
   * theme toggle were added to the bar. When the navbar renders taller than the
   * rail's assumed 90px (it wraps at some widths, and grows outright when the
   * menu is collapsed and open), the sticky share block ends up underneath it.
   *
   * offsetHeight is already read below for the hide-on-scroll logic, so this
   * measures nothing new — it just stops CSS from having to guess.
   */
  function publishNavHeight() {
    measuring = false;
    document.documentElement.style.setProperty(
      "--nav-height",
      nav.offsetHeight + "px"
    );
  }

  function scheduleMeasure() {
    if (measuring) return;
    measuring = true;
    window.requestAnimationFrame(publishNavHeight);
  }

  function update() {
    ticking = false;

    var st = window.pageYOffset || document.documentElement.scrollTop;
    var navHeight = nav.offsetHeight;

    if (Math.abs(lastScrollTop - st) <= DELTA) return;

    /*
     * Never hide the bar while the collapsed menu is open.
     *
     * offsetHeight includes the expanded menu, so `top: -navHeight` slid the whole
     * open menu off the top of the screen — it stayed open in Bootstrap's state,
     * just invisible, and any keyboard focus inside it went with it. On a phone
     * that is one flick after tapping the hamburger.
     */
    var menu = document.getElementById("navbarMediumish");
    if (menu && menu.classList.contains("show")) {
      lastScrollTop = st;
      return;
    }

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

  publishNavHeight();
  window.addEventListener("resize", scheduleMeasure, { passive: true });

  // The collapsed menu changes the bar's height by a lot, and Bootstrap animates
  // it — so measure when the transition finishes, not when the click lands.
  var collapse = document.getElementById("navbarMediumish");
  if (collapse) {
    collapse.addEventListener("shown.bs.collapse", publishNavHeight);
    collapse.addEventListener("hidden.bs.collapse", publishNavHeight);
  }

  // Webfonts land after first paint and reflow the bar. `document.fonts` is
  // guarded because the JS-off/older-browser path must degrade to the CSS
  // fallback rather than throw here and abandon the scroll handler above.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(publishNavHeight);
  }
})();
