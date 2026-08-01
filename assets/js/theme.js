/*
 * Theme toggle: light / dark / follow-system.
 *
 * The theme contract itself — reading the preference, writing the attributes —
 * lives in _includes/theme-head.html, which has to run inline before first paint.
 * This file consumes it through window.siteTheme and owns the toggle button plus
 * the two consumers that CSS cannot reach: mermaid (it bakes colours into the
 * generated SVG) and giscus (it renders in a cross-origin iframe).
 */
(function () {
  "use strict";

  var T = window.siteTheme;
  // theme-head.html missing: degrade to "no toggle" rather than throwing and
  // taking the rest of the page's scripts down with us.
  if (!T) return;

  var GISCUS_ORIGIN = "https://giscus.app";

  // theme-head.html already wrote this before first paint, so it is the theme the
  // page actually rendered with — the baseline for "did anything change".
  var current = document.documentElement.dataset.theme;

  // Last theme we told giscus about, so we can tell stale from in-sync below.
  var giscusTheme = null;

  function sendGiscusTheme(theme) {
    var frame = document.querySelector("iframe.giscus-frame");
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.postMessage(
      { giscus: { setConfig: { theme: theme } } },
      GISCUS_ORIGIN
    );
    giscusTheme = theme;
  }

  // Everything that has to happen alongside the attribute write. isDark is
  // computed once at the top: it used to be declared inside `if (button)` and
  // read further down, so it was undefined whenever the toggle was absent.
  function syncDependents(theme) {
    var isDark = theme === "dark";

    var button = document.getElementById("theme-toggle");
    if (button) {
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
    }

    // Only on an actual change. The DOMContentLoaded call below re-applies the
    // theme the page already painted with, and firing themechange for that made
    // _includes/mermaid.html throw away and re-render every diagram, identically,
    // on every load of a diagram post.
    if (theme !== current) {
      current = theme;
      document.dispatchEvent(
        new CustomEvent("themechange", { detail: { theme: theme } })
      );
    }

    sendGiscusTheme(theme);
  }

  function apply(theme) {
    T.set(theme);
    syncDependents(theme);
  }

  function toggle() {
    var next = T.resolve() === "dark" ? "light" : "dark";
    T.store(next);
    apply(next);
  }

  document.addEventListener("DOMContentLoaded", function () {
    // The attribute write is redundant here (theme-head.html already did it) but
    // idempotent, and it is the one path that self-heals if that write was lost.
    apply(T.resolve());
    var button = document.getElementById("theme-toggle");
    if (button) button.addEventListener("click", toggle);
  });

  // Follow the OS while the reader has not made an explicit choice.
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function () {
      if (!T.stored()) apply(T.resolve());
    });

  // The giscus iframe is data-loading="lazy", so its document does not load until
  // it scrolls into view, and setConfig sent before that is dropped. Any message
  // from the frame proves it is live, so reconcile then.
  //
  // The staleness guard is load-bearing: setConfig triggers a re-render, which
  // emits resizeHeight, which would otherwise trigger another setConfig. It also
  // covers toggling the theme while the frame is still unloaded.
  window.addEventListener("message", function (event) {
    if (event.origin !== GISCUS_ORIGIN) return;
    if (!event.data || typeof event.data !== "object" || !event.data.giscus) return;
    var theme = T.resolve();
    if (giscusTheme !== theme) sendGiscusTheme(theme);
  });
})();
