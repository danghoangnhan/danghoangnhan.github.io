/*
 * Builds a table of contents for long posts and highlights the section in view.
 *
 * kramdown's auto_ids is on by default, so every heading already carries an id
 * — nothing needs to change in the Markdown. Only posts with enough headings
 * get a TOC; short posts would just gain clutter.
 *
 * The markup is a <details> at every width. Above the rail breakpoint it is
 * forced open and the summary is styled as a plain heading, which is exactly what
 * it used to be. Below it the TOC used to be `display: none` outright, so nobody
 * on a phone or a tablet — most readers — could navigate a long post at all; the
 * longest here runs to 27 headings. Collapsed by default so it costs one line
 * above the article until someone wants it.
 */
(function () {
  "use strict";

  var MIN_HEADINGS = 4;
  var RAIL_BP = "(min-width: 1024px)"; // $rail-bp in _sass/_components.scss

  var container = document.getElementById("toc");
  var article = document.querySelector(".article-post");
  if (!container || !article) return;

  var headings = Array.prototype.slice.call(article.querySelectorAll("h2, h3"))
    .filter(function (h) {
      return h.id;
    });

  if (headings.length < MIN_HEADINGS) return;

  var list = document.createElement("ol");
  list.className = "toc-list";

  headings.forEach(function (h) {
    var li = document.createElement("li");
    li.className = "toc-" + h.tagName.toLowerCase();

    var a = document.createElement("a");
    a.href = "#" + h.id;
    a.textContent = h.textContent;
    a.dataset.target = h.id;

    li.appendChild(a);
    list.appendChild(li);
  });

  var details = document.createElement("details");
  details.className = "toc-details";

  var summary = document.createElement("summary");
  summary.className = "toc-heading";
  summary.textContent = "On this page";

  details.appendChild(summary);
  details.appendChild(list);
  container.appendChild(details);
  container.hidden = false;

  /*
   * Open on desktop, collapsed on mobile — and re-evaluated when the viewport
   * crosses the breakpoint, because CSS alone cannot reliably reveal a closed
   * <details> across browsers.
   *
   * Only forced when the reader has not touched it: `toggle` records intent, and
   * after that the rail leaves their choice alone.
   */
  var wide = window.matchMedia(RAIL_BP);
  var userChose = false;

  function syncOpen() {
    if (userChose) return;
    details.open = wide.matches;
  }

  details.addEventListener("toggle", function () {
    // The programmatic writes in syncOpen also fire this, so ignore anything that
    // already agrees with the breakpoint.
    if (details.open !== wide.matches) userChose = true;
  });

  syncOpen();
  if (wide.addEventListener) {
    wide.addEventListener("change", syncOpen);
  } else if (wide.addListener) {
    wide.addListener(syncOpen); // Safari < 14
  }

  // Scroll-spy. The trigger line sits just below the fixed navbar so the
  // highlighted entry matches what the reader is looking at.
  var links = {};
  Array.prototype.forEach.call(list.querySelectorAll("a"), function (a) {
    links[a.dataset.target] = a;
  });

  var current = null;

  /*
   * --nav-height rather than a hardcoded 80px.
   *
   * mediumish.js measures the navbar and publishes it precisely so nothing else
   * has to guess — four separate hardcoded guesses (57, 80, 90 and 110px) were
   * removed when it started doing that, and this one was missed. The bar grows
   * when the collapsed menu opens and when webfonts land, and at that point the
   * trigger line no longer matches the heading the reader can actually see.
   */
  function navHeight() {
    var v = getComputedStyle(document.documentElement).getPropertyValue("--nav-height");
    var n = parseInt(v, 10);
    return isNaN(n) ? 57 : n;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var link = links[entry.target.id];
        if (!link || link === current) return;
        if (current) current.classList.remove("is-active");
        link.classList.add("is-active");
        current = link;
      });
    },
    { rootMargin: "-" + (navHeight() + 20) + "px 0px -70% 0px", threshold: 0 }
  );

  headings.forEach(function (h) {
    observer.observe(h);
  });
})();
