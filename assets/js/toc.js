/*
 * Builds a table of contents for long posts and highlights the section in view.
 *
 * kramdown's auto_ids is on by default, so every heading already carries an id
 * — nothing needs to change in the Markdown. Only posts with enough headings
 * get a TOC; short posts would just gain clutter.
 */
(function () {
  "use strict";

  var MIN_HEADINGS = 4;

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

  var heading = document.createElement("p");
  heading.className = "toc-heading";
  heading.textContent = "On this page";

  container.appendChild(heading);
  container.appendChild(list);
  container.hidden = false;

  // Scroll-spy. rootMargin pulls the trigger line up near the top of the
  // viewport so the highlighted entry matches what the reader is looking at.
  var links = {};
  Array.prototype.forEach.call(list.querySelectorAll("a"), function (a) {
    links[a.dataset.target] = a;
  });

  var current = null;

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
    { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
  );

  headings.forEach(function (h) {
    observer.observe(h);
  });
})();
