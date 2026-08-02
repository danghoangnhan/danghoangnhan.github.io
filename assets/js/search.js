/*
 * Client-side search over search.json.
 *
 * Deliberately hand-rolled rather than lunr/Fuse/Pagefind. The corpus is a couple
 * of dozen posts, so substring-and-token scoring is entirely adequate and ships no
 * dependency. The index is fetched on first interaction, not on page load, so it
 * costs nothing to readers who never search.
 */
(function () {
  "use strict";

  var input = document.getElementById("site-search");
  var results = document.getElementById("site-search-results");
  var status = document.getElementById("site-search-status");
  if (!input || !results) return;

  // Tolerated rather than required: the live region is an enhancement, and its
  // absence should not take the whole search box down with it.
  if (!status) status = { textContent: "" };

  var index = null;
  var pending = null;
  var debounceTimer = null;
  var activeIndex = -1;
  // Monotonic id for the most recent query, so a slow response for an old query
  // cannot overwrite the results of a newer one.
  var queryToken = 0;

  var WEIGHT = { title: 10, categories: 5, body: 1 };
  var MAX_RESULTS = 8;

  /*
   * Fetch the index once, and hand every caller the SAME promise while it is in
   * flight.
   *
   * This used to track a boolean and return `Promise.resolve(index)` whenever a
   * fetch was already running — which resolved with null, because `index` is not
   * assigned until the fetch lands. search() then hit `if (!data) return;` and
   * rendered nothing at all: no results, no message, no pending state. Since the
   * index is warmed on focus, every query typed in the first few hundred
   * milliseconds after clicking the box fell into exactly that window, and on a
   * slow connection a short query left the box looking broken until the reader
   * pressed another key.
   *
   * Memoising the promise means a query typed during the fetch renders the moment
   * the index arrives.
   */
  function loadIndex() {
    if (index) return Promise.resolve(index);
    if (pending) return pending;

    pending = fetch(input.dataset.index)
      .then(function (r) {
        if (!r.ok) throw new Error("search index " + r.status);
        return r.json();
      })
      .then(function (data) {
        index = data;
        pending = null;
        return index;
      })
      .catch(function (err) {
        // Cleared so a later keystroke retries rather than being stuck on a
        // rejected promise forever.
        pending = null;
        message("Search is unavailable right now.");
        throw err;
      });

    return pending;
  }

  /*
   * A non-selectable row: the loading, empty and error states.
   *
   * role="presentation" because a listbox may contain only options, and this is a
   * message rather than something the reader can choose. aria-live on the results
   * container (see _includes/search.html) is what actually announces it.
   */
  function message(text) {
    results.innerHTML =
      '<li role="presentation" class="search-empty">' + escapeHtml(text) + "</li>";
    setExpanded(true);
  }

  function score(post, terms) {
    // Every field is defaulted. A post with an empty body is not hypothetical —
    // this site shipped one for two years — and `post.b.toLowerCase()` on it threw
    // a TypeError that took the whole result loop down with it, so one bad entry
    // in the index broke search for every query.
    var title = (post.t || "").toLowerCase();
    // search.json ships categories as an array so the same field can be rendered
    // as chips; scoring still wants one flat haystack.
    var cats = (post.c || []).join(" ").toLowerCase();
    var body = (post.b || "").toLowerCase();
    var total = 0;

    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      var hit = 0;
      if (title.indexOf(term) !== -1) hit += WEIGHT.title;
      if (cats.indexOf(term) !== -1) hit += WEIGHT.categories;
      var occurrences = body.split(term).length - 1;
      if (occurrences > 0) hit += WEIGHT.body * Math.min(occurrences, 5);
      // Every term must appear somewhere, so the search behaves like AND.
      if (hit === 0) return 0;
      total += hit;
    }
    return total;
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /*
   * Open/close the listbox and keep aria-expanded honest.
   *
   * aria-expanded used to be hardcoded false in the markup and never touched, so
   * the combobox told assistive tech it was collapsed the whole time it was
   * showing results. Closing also drops the active descendant, or the input
   * keeps pointing at the id of an option that is no longer in the document.
   */
  function setExpanded(isOpen) {
    results.hidden = !isOpen;
    input.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (!isOpen) {
      activeIndex = -1;
      input.removeAttribute("aria-activedescendant");
    }
  }

  function render(matches, query) {
    activeIndex = -1;
    input.removeAttribute("aria-activedescendant");

    if (!query) {
      results.innerHTML = "";
      setExpanded(false);
      return;
    }

    if (matches.length === 0) {
      message("No posts match “" + query + "”");
      return;
    }

    // Announced through the aria-live region on the results list. Without it a
    // screen-reader user got no signal that anything had happened at all: the
    // options appear silently, and aria-activedescendant only speaks once the
    // reader starts arrowing.
    var count =
      matches.length === 1 ? "1 result" : matches.length + " results";
    status.textContent = count + " for " + query;

    results.innerHTML = matches
      .map(function (m, i) {
        // Same chip vocabulary as the cards and the post header, so a result
        // reads identically wherever the reader meets it. Spans rather than
        // links because they sit inside the option's own anchor.
        var chips = (m.c || [])
          .map(function (c) {
            return '<span class="post-tag">' + escapeHtml(c) + "</span>";
          })
          .join("");

        var lang = (m.l || "en").toUpperCase();

        // The excerpt disambiguates results. Several posts on this site have had
        // near-identical titles, and a title-plus-date row gave the reader no way
        // to tell which one they wanted.
        var excerpt = m.e
          ? '<span class="search-excerpt">' + escapeHtml(m.e) + "</span>"
          : "";

        return (
          '<li role="presentation">' +
          // tabindex="-1": this is a combobox, so focus stays in the input and the
          // selection is tracked with aria-activedescendant. Leaving the anchors
          // in the tab order meant Tab walked into the popup instead of leaving
          // the control, which is the opposite of what the pattern promises.
          '<a role="option" tabindex="-1" aria-selected="false" id="site-search-opt-' +
          i +
          '" href="' +
          escapeHtml(m.u) +
          '"><span class="search-title">' +
          escapeHtml(m.t) +
          "</span>" +
          excerpt +
          '<span class="search-meta">' +
          chips +
          '<span class="post-tag post-tag--lang">' +
          escapeHtml(lang) +
          '</span><span class="search-date">' +
          escapeHtml(m.d) +
          "</span></span></a></li>"
        );
      })
      .join("");

    setExpanded(true);
  }

  function search() {
    var query = input.value.trim();
    if (query.length < 2) {
      render([], "");
      return;
    }

    var token = ++queryToken;

    // Only shown if the index has not arrived yet, which is the case for the
    // first query after focus. Previously this window rendered nothing.
    if (!index) message("Searching…");

    loadIndex()
      .then(function (data) {
        // A response for a query the reader has already moved on from. Without
        // this guard a slow first fetch could paint stale results over a newer,
        // already-rendered set.
        if (token !== queryToken) return;

        var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        var scored = [];

        for (var i = 0; i < data.length; i++) {
          var s = score(data[i], terms);
          if (s > 0) scored.push({ post: data[i], score: s });
        }

        scored.sort(function (a, b) {
          return b.score - a.score;
        });

        render(
          scored.slice(0, MAX_RESULTS).map(function (x) {
            return x.post;
          }),
          query
        );
      })
      .catch(function () {
        // loadIndex has already rendered the failure row and re-thrown so callers
        // can tell. Swallowing it here keeps a dead network from logging an
        // unhandled rejection on every keystroke.
      });
  }

  function items() {
    return Array.prototype.slice.call(results.querySelectorAll('[role="option"]'));
  }

  /*
   * Move the selection. Focus deliberately stays in the input.
   *
   * This used to call .focus() on the result link, which moved DOM focus out of
   * the combobox — that is why arrow keys needed a second listener bound to the
   * list, and why Enter appeared to work (the browser was activating a focused
   * anchor, not anything this file did). The combobox pattern keeps focus put
   * and points at the selection with aria-activedescendant instead.
   */
  function highlight(next) {
    var list = items();
    if (list.length === 0) return;

    list.forEach(function (el) {
      el.classList.remove("is-active");
      el.setAttribute("aria-selected", "false");
    });

    activeIndex = (next + list.length) % list.length;
    var el = list[activeIndex];
    el.classList.add("is-active");
    el.setAttribute("aria-selected", "true");
    input.setAttribute("aria-activedescendant", el.id);

    // The list caps at 60vh and scrolls; without this the selection walks off
    // the bottom and the reader is arrowing through something they cannot see.
    if (el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }

  // Warm the index as soon as intent is shown, so the first query feels instant.
  // The rejection is swallowed: loadIndex already renders the failure row, and an
  // unhandled rejection here would fire on nothing more than focusing the box.
  input.addEventListener(
    "focus",
    function () {
      loadIndex().catch(function () {});
    },
    { once: true }
  );

  input.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(search, 150);
  });

  // One handler, because focus never leaves the input. Arrows wrap in both
  // directions: from nothing selected, Down takes the first and Up the last.
  input.addEventListener("keydown", function (e) {
    var list = items();

    if (e.key === "ArrowDown") {
      e.preventDefault();
      highlight(activeIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      highlight(activeIndex - 1);
    } else if (e.key === "Enter") {
      /*
       * Enter goes to the highlighted result, or to the first one if the reader
       * has not arrowed at all.
       *
       * That second case used to do nothing whatsoever. The input is not inside a
       * <form> and there is no /search/ results page, so typing a query and
       * pressing Enter — which is what most people do — left the reader staring at
       * a dropdown, having pressed the key that normally means "go". Taking the
       * top hit is the least surprising reading of the gesture and needs no new
       * page.
       */
      var target = activeIndex >= 0 ? list[activeIndex] : list[0];
      if (target) {
        e.preventDefault();
        window.location.href = target.getAttribute("href");
      }
    } else if (e.key === "Escape") {
      /*
       * First Escape closes the popup, a second clears the query. This used to
       * wipe the input on the first press, so a reader dismissing the dropdown to
       * look at the page behind it lost what they had typed and had to type it
       * again. The two-step is what the ARIA combobox pattern specifies.
       */
      if (!results.hidden) {
        setExpanded(false);
      } else {
        input.value = "";
        render([], "");
      }
    }
  });

  // Tab out, or focus moving anywhere else, closes the popup. Only the outside
  // click was handled before, so a keyboard user who tabbed past the search box
  // left an open listbox floating over the page with no way to dismiss it.
  // relatedTarget is checked so clicking a result still navigates rather than
  // having the list yanked out from under the pointer.
  input.addEventListener("blur", function (e) {
    if (e.relatedTarget && results.contains(e.relatedTarget)) return;
    setExpanded(false);
  });

  document.addEventListener("click", function (e) {
    if (!results.contains(e.target) && e.target !== input) {
      setExpanded(false);
    }
  });
})();
