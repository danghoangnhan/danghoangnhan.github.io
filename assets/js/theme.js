/*
 * Theme toggle: light / dark / follow-system.
 *
 * The initial read is inlined in <head> (see _includes/theme-head.html) so the
 * correct theme is applied before first paint. This file only handles the
 * toggle button and broadcasting changes.
 *
 * Consumers subscribing to the `themechange` event: mermaid (it bakes colours
 * into generated SVG) and giscus (via postMessage).
 */
(function () {
  "use strict";

  var STORAGE_KEY = "theme";
  var root = document.documentElement;

  function systemPrefersDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function stored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function resolved() {
    var pref = stored();
    if (pref === "dark" || pref === "light") return pref;
    return systemPrefersDark() ? "dark" : "light";
  }

  function apply(theme) {
    root.dataset.theme = theme;
    // Bootstrap 5.3 recolours its own utilities from this attribute, which is
    // most of why dark mode here is 60 lines instead of 250.
    root.setAttribute("data-bs-theme", theme);

    var button = document.getElementById("theme-toggle");
    if (button) {
      var isDark = theme === "dark";
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
    }

    document.dispatchEvent(
      new CustomEvent("themechange", { detail: { theme: theme } })
    );

    // giscus renders in an iframe and cannot read our CSS.
    var frame = document.querySelector("iframe.giscus-frame");
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: isDark ? "dark" : "light" } } },
        "https://giscus.app"
      );
    }
  }

  function toggle() {
    var next = resolved() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* private mode: theme just won't persist */
    }
    apply(next);
  }

  document.addEventListener("DOMContentLoaded", function () {
    apply(resolved());
    var button = document.getElementById("theme-toggle");
    if (button) button.addEventListener("click", toggle);
  });

  // Follow the OS while the reader has not made an explicit choice.
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function () {
      if (!stored()) apply(resolved());
    });
})();
