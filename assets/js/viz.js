/*
 * Interactive figures for the CNN series.
 *
 * Authored in a post as a fenced block, the same way Mermaid is:
 *
 *   ```viz
 *   type: shape
 *   n: 7
 *   f: 3
 *   s: 2
 *   ```
 *
 * `viz` is not a Rouge lexer, so kramdown emits a bare `<pre><code
 * class="language-viz">` rather than the div.highlighter-rouge wrapper it gives
 * a highlighted fence. This script replaces the <pre> with the rendered widget.
 * The same is true of ```mermaid, which is why copy-code.js never attaches a
 * button to either — it selects div.highlighter-rouge, which neither produces.
 *
 * Loading is gated per post on `viz: true` (see _includes/viz.html), and
 * script/lint-content.rb fails the build if a fence and its flag disagree, or
 * if a block names a `type:` this file cannot render.
 *
 * Everything is drawn as SVG with stroke/fill="currentColor", which is what
 * makes these theme-aware for free: dark mode is a CSS colour change and the
 * figure follows it. There is deliberately no `themechange` listener here —
 * unlike Mermaid, which bakes colours into its output and has to re-render.
 * Do not introduce a hardcoded colour; it would break that property silently.
 *
 * SVG rather than <canvas> is also an accessibility decision. CI runs pa11y-ci
 * at WCAG2AA over /poolinglayers/ and /intersection-over-union/, both of which
 * carry widgets, so every control here is a real focusable element with a
 * label and every result lands in a live region.
 */
(function () {
  "use strict";

  var hosts = document.querySelectorAll(
    ".article-post div.language-viz, .article-post pre > code.language-viz"
  );
  if (!hosts.length) return;

  var NS = "http://www.w3.org/2000/svg";
  // Cell edge in SVG user units. Large enough to read a two-digit number in,
  // and the figures carry width/height attributes so this is the size actually
  // rendered rather than something max-width stretches.
  var CELL = 34;

  // --- small helpers -------------------------------------------------------

  function svgEl(name, attrs) {
    var el = document.createElementNS(NS, name);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        el.setAttribute(k, attrs[k]);
      });
    }
    return el;
  }

  function el(name, attrs, text) {
    var node = document.createElement(name);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        node.setAttribute(k, attrs[k]);
      });
    }
    if (text != null) node.textContent = text;
    return node;
  }

  /*
   * `key: value` per line. Blank lines and # comments ignored. Deliberately not
   * YAML — a hand-rolled parse of five keys is smaller than any dependency, and
   * this repo has no JavaScript build step to add one through.
   */
  function parseConfig(text) {
    var cfg = {};
    text.split("\n").forEach(function (line) {
      var t = line.trim();
      if (!t || t.charAt(0) === "#") return;
      var i = t.indexOf(":");
      if (i < 0) return;
      cfg[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    });
    return cfg;
  }

  function num(cfg, key, dflt, min, max) {
    var v = parseInt(cfg[key], 10);
    if (isNaN(v)) v = dflt;
    return Math.max(min, Math.min(max, v));
  }

  // Output size for a conv/pool layer. The formula the whole series turns on.
  function outSize(n, f, p, s) {
    return Math.floor((n + 2 * p - f) / s) + 1;
  }

  /*
   * A labelled numeric control. Native <input type="number"> with a real
   * <label>, because pa11y runs axe and htmlcs over two of these posts and a
   * div-with-a-click-handler fails both.
   */
  function control(id, labelText, value, min, max, onInput) {
    var wrap = el("span", { class: "viz-control" });
    var input = el("input", {
      type: "number",
      id: id,
      value: value,
      min: min,
      max: max,
      step: 1
    });
    wrap.appendChild(el("label", { for: id }, labelText));
    wrap.appendChild(input);
    input.addEventListener("input", function () {
      var v = parseInt(input.value, 10);
      if (isNaN(v)) return;
      onInput(Math.max(min, Math.min(max, v)));
    });
    return { wrap: wrap, input: input };
  }

  function button(labelText, onClick) {
    var b = el("button", { type: "button", class: "viz-button" }, labelText);
    b.addEventListener("click", onClick);
    return b;
  }

  // --- widget: shape -------------------------------------------------------

  /*
   * The output-size formula, made pokeable. A 1-D strip rather than a grid
   * because the thing worth seeing is which input cells the floor drops, and
   * that is a property of one axis repeated.
   */
  function shapeWidget(cfg) {
    var state = {
      n: num(cfg, "n", 7, 1, 24),
      f: num(cfg, "f", 3, 1, 11),
      p: num(cfg, "p", 0, 0, 5),
      s: num(cfg, "s", 2, 1, 6),
      pos: 0
    };

    var root = el("div", { class: "viz viz-shape" });
    var controls = el("div", { class: "viz-controls" });
    var figure = el("div", { class: "viz-figure" });
    var readout = el("p", { class: "viz-readout", "aria-live": "polite" });

    var uid = "viz-" + Math.floor(Math.random() * 1e9).toString(36);

    ["n", "f", "p", "s"].forEach(function (key) {
      var labels = {
        n: "input n",
        f: "filter f",
        p: "padding p",
        s: "stride s"
      };
      var limits = { n: [1, 24], f: [1, 11], p: [0, 5], s: [1, 6] };
      var c = control(
        uid + "-" + key,
        labels[key],
        state[key],
        limits[key][0],
        limits[key][1],
        function (v) {
          state[key] = v;
          state.pos = 0;
          render();
        }
      );
      controls.appendChild(c.wrap);
    });

    var prev = button("‹ prev", function () {
      state.pos = Math.max(0, state.pos - 1);
      render();
    });
    var next = button("next ›", function () {
      state.pos = Math.min(outSize(state.n, state.f, state.p, state.s) - 1, state.pos + 1);
      render();
    });
    var stepper = el("span", { class: "viz-stepper" });
    stepper.appendChild(prev);
    stepper.appendChild(next);
    controls.appendChild(stepper);

    function render() {
      var n = state.n,
        f = state.f,
        p = state.p,
        s = state.s;
      var total = n + 2 * p;
      var out = outSize(n, f, p, s);

      // A filter wider than its padded input has no valid position at all.
      if (out < 1) {
        figure.textContent = "";
        readout.textContent =
          "No valid filter position: f = " + f + " is wider than the padded input, " + total + ".";
        prev.disabled = true;
        next.disabled = true;
        return;
      }

      state.pos = Math.min(state.pos, out - 1);
      prev.disabled = state.pos === 0;
      next.disabled = state.pos === out - 1;

      var lastCovered = (out - 1) * s + f - 1;
      var dropped = total - 1 - lastCovered;

      var w = total * CELL + 20;
      var h = dropped > 0 ? 102 : 84;
      /*
       * width/height attributes as well as the viewBox, deliberately.
       *
       * With only a viewBox the SVG has no intrinsic size, so `max-width: 100%`
       * scales it to the full article column — a seven-cell strip rendered at
       * 700px wide with 12px labels blown up to fit. The attributes give it a
       * natural size; max-width then only ever shrinks it, on narrow screens.
       */
      var svg = svgEl("svg", {
        viewBox: "0 0 " + w + " " + h,
        width: w,
        height: h,
        role: "img",
        "aria-labelledby": uid + "-title",
        style: "max-width:100%;height:auto"
      });
      var title = svgEl("title", { id: uid + "-title" });
      title.textContent =
        "An input strip of " + n + " cells with " + p + " padding either side. " +
        "A filter of width " + f + " at stride " + s + " has " + out + " valid positions" +
        (dropped > 0 ? ", leaving " + dropped + " cells never covered." : ".");
      svg.appendChild(title);

      var i;
      for (i = 0; i < total; i++) {
        var isPad = i < p || i >= p + n;
        var x = 10 + i * CELL;
        svg.appendChild(
          svgEl("rect", {
            x: x,
            y: 36,
            width: CELL,
            height: CELL,
            fill: isPad ? "none" : "currentColor",
            "fill-opacity": isPad ? "0" : "0.06",
            stroke: "currentColor",
            "stroke-width": "1",
            "stroke-dasharray": isPad ? "4 3" : "",
            "stroke-opacity": "0.55"
          })
        );
        // Cells past the last valid filter position are what the floor discards.
        if (i > lastCovered) {
          svg.appendChild(
            svgEl("line", {
              x1: x + 5,
              y1: 36 + CELL - 5,
              x2: x + CELL - 5,
              y2: 41,
              stroke: "currentColor",
              "stroke-width": "1.4",
              "stroke-opacity": "0.6"
            })
          );
        }
      }

      // The current filter window.
      var wx = 10 + state.pos * s * CELL;
      svg.appendChild(
        svgEl("rect", {
          x: wx,
          y: 31,
          width: f * CELL,
          height: CELL + 10,
          fill: "currentColor",
          "fill-opacity": "0.14",
          stroke: "currentColor",
          "stroke-width": "2"
        })
      );
      var lbl = svgEl("text", {
        x: wx + (f * CELL) / 2,
        y: 22,
        "text-anchor": "middle",
        "font-size": "12",
        fill: "currentColor"
      });
      lbl.textContent = "position " + (state.pos + 1) + " of " + out;
      svg.appendChild(lbl);

      if (dropped > 0) {
        /*
         * Anchored to the right edge rather than centred under the dropped
         * cells. Those cells are always at the end of the strip, so a centred
         * label runs past the viewBox and gets clipped — which is exactly what
         * happened the first time this rendered.
         */
        var dl = svgEl("text", {
          x: w - 10,
          y: 92,
          "text-anchor": "end",
          "font-size": "12",
          fill: "currentColor",
          "fill-opacity": "0.75"
        });
        dl.textContent = dropped === 1 ? "1 cell dropped" : dropped + " cells dropped";
        svg.appendChild(dl);
      }

      figure.textContent = "";
      figure.appendChild(svg);

      readout.textContent =
        "floor((" + n + " + 2×" + p + " − " + f + ") / " + s + ") + 1 = " + out +
        (dropped > 0
          ? "   — the last " +
            (dropped === 1 ? "cell is" : dropped + " cells are") +
            " never covered"
          : "");
    }

    root.appendChild(figure);
    root.appendChild(controls);
    root.appendChild(readout);
    render();
    return root;
  }

  // --- dispatch ------------------------------------------------------------

  var WIDGETS = {
    shape: shapeWidget
  };

  Array.prototype.forEach.call(hosts, function (node) {
    var host = node.closest("div.language-viz") || node.closest("pre");
    if (!host || !host.parentNode) return;

    var cfg = parseConfig(host.textContent);
    var build = WIDGETS[cfg.type];

    /*
     * An unknown or missing type leaves the fence alone rather than throwing or
     * blanking it. The reader sees the config, which is at least honest about
     * what was intended, and the rest of the page still renders.
     */
    if (!build) return;

    try {
      host.replaceWith(build(cfg));
    } catch (e) {
      // Never take the page down over a figure.
      if (window.console && console.warn) console.warn("viz: " + cfg.type, e);
    }
  });
})();
