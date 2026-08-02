/*
 * Client-side search over search.json.
 *
 * Deliberately hand-rolled rather than lunr/Fuse/Pagefind. The corpus is ~29
 * posts / ~18k words, so substring-and-token scoring is entirely adequate and
 * ships no dependency. The index is fetched on first interaction, not on page
 * load, so it costs nothing to readers who never search.
 */
(function () {
  "use strict";

  var input = document.getElementById("site-search");
  var results = document.getElementById("site-search-results");
  if (!input || !results) return;

  var index = null;
  var loading = false;
  var debounceTimer = null;
  var activeIndex = -1;

  var WEIGHT = { title: 10, categories: 5, body: 1 };
  var MAX_RESULTS = 8;

  function loadIndex() {
    if (index || loading) return Promise.resolve(index);
    loading = true;
    return fetch(input.dataset.index)
      .then(function (r) {
        if (!r.ok) throw new Error("search index " + r.status);
        return r.json();
      })
      .then(function (data) {
        index = data;
        loading = false;
        return index;
      })
      .catch(function (err) {
        loading = false;
        // Same two rules as render(): role="presentation" because a listbox may
        // only hold options, and setExpanded so aria-expanded does not go stale.
        results.innerHTML =
          '<li role="presentation" class="search-empty">Search is unavailable right now.</li>';
        setExpanded(true);
        throw err;
      });
  }

  function score(post, terms) {
    var title = post.t.toLowerCase();
    // search.json now ships categories as an array so the same field can be
    // rendered as chips; scoring still wants one flat haystack.
    var cats = (post.c || []).join(" ").toLowerCase();
    var body = post.b.toLowerCase();
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
    return s
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
      // role="presentation": a listbox may only contain options, and this row is
      // a message rather than something selectable.
      results.innerHTML =
        '<li role="presentation" class="search-empty">No posts match &ldquo;' +
        escapeHtml(query) +
        "&rdquo;</li>";
      setExpanded(true);
      return;
    }

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

        return (
          '<li role="presentation">' +
          '<a role="option" aria-selected="false" id="site-search-opt-' +
          i +
          '" href="' +
          escapeHtml(m.u) +
          '"><span class="search-title">' +
          escapeHtml(m.t) +
          '</span><span class="search-meta">' +
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

    loadIndex().then(function (data) {
      if (!data) return;
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
  input.addEventListener("focus", loadIndex, { once: true });

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
      // Only intercept when something is selected, so Enter on a bare query
      // still does whatever the form would normally do.
      if (activeIndex >= 0 && list[activeIndex]) {
        e.preventDefault();
        window.location.href = list[activeIndex].getAttribute("href");
      }
    } else if (e.key === "Escape") {
      input.value = "";
      render([], "");
    }
  });

  document.addEventListener("click", function (e) {
    if (!results.contains(e.target) && e.target !== input) {
      setExpanded(false);
    }
  });
})();
