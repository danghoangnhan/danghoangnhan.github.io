/*
 * Copy-to-clipboard button on code blocks.
 *
 * kramdown + Rouge wrap a fence as:
 *   div.language-xxx.highlighter-rouge > div.highlight > pre.highlight > code
 *
 * Mermaid fences are skipped: mermaid.js replaces those nodes with rendered
 * SVG, so a copy button would either be destroyed or would copy diagram source
 * a reader cannot use.
 */
(function () {
  "use strict";

  if (!navigator.clipboard) return;

  var blocks = document.querySelectorAll(".article-post div.highlighter-rouge");

  Array.prototype.forEach.call(blocks, function (block) {
    if (block.classList.contains("language-mermaid")) return;

    var pre = block.querySelector("pre");
    if (!pre) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "copy-code";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code to clipboard");
    /*
     * The button announces its own result.
     *
     * The visible label flips to "Copied" but the accessible name is pinned by the
     * aria-label above, so a screen reader kept saying "Copy code to clipboard" and
     * the reader got no confirmation that anything had happened — the one piece of
     * feedback this control exists to give. aria-live on the button itself is
     * enough: it is not focus-dependent, and the button is the thing that changed.
     */
    button.setAttribute("aria-live", "polite");

    button.addEventListener("click", function () {
      var code = block.querySelector("code") || pre;
      // innerText, not textContent: it respects rendered line breaks.
      navigator.clipboard.writeText(code.innerText.replace(/\n$/, "")).then(
        function () {
          button.textContent = "Copied";
          button.setAttribute("aria-label", "Code copied to clipboard");
          button.classList.add("is-copied");
          setTimeout(function () {
            button.textContent = "Copy";
            button.setAttribute("aria-label", "Copy code to clipboard");
            button.classList.remove("is-copied");
          }, 1500);
        },
        function () {
          button.textContent = "Failed";
          button.setAttribute("aria-label", "Copying failed");
          setTimeout(function () {
            button.textContent = "Copy";
            button.setAttribute("aria-label", "Copy code to clipboard");
          }, 1500);
        }
      );
    });

    block.classList.add("has-copy-button");
    block.appendChild(button);
  });
})();
