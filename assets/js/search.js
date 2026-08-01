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
        results.innerHTML =
          '<li class="search-empty">Search is unavailable right now.</li>';
        results.hidden = false;
        throw err;
      });
  }

  function score(post, terms) {
    var title = post.t.toLowerCase();
    var cats = post.c.toLowerCase();
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

  function render(matches, query) {
    activeIndex = -1;

    if (!query) {
      results.hidden = true;
      results.innerHTML = "";
      return;
    }

    if (matches.length === 0) {
      results.innerHTML =
        '<li class="search-empty">No posts match &ldquo;' +
        escapeHtml(query) +
        '&rdquo;</li>';
      results.hidden = false;
      return;
    }

    results.innerHTML = matches
      .map(function (m) {
        return (
          '<li role="option"><a href="' +
          m.u +
          '"><span class="search-title">' +
          escapeHtml(m.t) +
          '</span><span class="search-meta">' +
          escapeHtml(m.d) +
          (m.c ? " &middot; " + escapeHtml(m.c) : "") +
          "</span></a></li>"
        );
      })
      .join("");
    results.hidden = false;
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
    return Array.prototype.slice.call(results.querySelectorAll('li[role="option"] a'));
  }

  function highlight(next) {
    var list = items();
    if (list.length === 0) return;
    list.forEach(function (el) {
      el.classList.remove("is-active");
    });
    activeIndex = (next + list.length) % list.length;
    list[activeIndex].classList.add("is-active");
    list[activeIndex].focus();
  }

  // Warm the index as soon as intent is shown, so the first query feels instant.
  input.addEventListener("focus", loadIndex, { once: true });

  input.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(search, 150);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      highlight(0);
    } else if (e.key === "Escape") {
      input.value = "";
      render([], "");
      input.blur();
    }
  });

  results.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      highlight(activeIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (activeIndex <= 0) {
        activeIndex = -1;
        input.focus();
      } else {
        highlight(activeIndex - 1);
      }
    } else if (e.key === "Escape") {
      render([], "");
      input.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (!results.contains(e.target) && e.target !== input) {
      results.hidden = true;
    }
  });
})();
