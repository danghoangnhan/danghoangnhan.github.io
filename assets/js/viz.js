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

  // --- matrices ------------------------------------------------------------

  function parseMatrix(str) {
    return str.split(";").map(function (row) {
      return row.split(",").map(function (v) {
        return parseFloat(v.trim());
      });
    });
  }

  // A vertical edge: bright on the left, dark on the right. The worked example
  // in the edge-detection post uses exactly this.
  function edgeInput(n) {
    var m = [];
    for (var r = 0; r < n; r++) {
      var row = [];
      for (var c = 0; c < n; c++) row.push(c < n / 2 ? 10 : 0);
      m.push(row);
    }
    return m;
  }

  var FILTERS = {
    vertical: [[1, 0, -1], [1, 0, -1], [1, 0, -1]],
    horizontal: [[1, 1, 1], [0, 0, 0], [-1, -1, -1]],
    sobel: [[1, 0, -1], [2, 0, -2], [1, 0, -1]],
    blur: [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
  };

  function padMatrix(m, p) {
    if (!p) return m;
    var n = m.length + 2 * p;
    var out = [];
    for (var r = 0; r < n; r++) {
      var row = [];
      for (var c = 0; c < n; c++) {
        var sr = r - p,
          sc = c - p;
        row.push(sr >= 0 && sr < m.length && sc >= 0 && sc < m[0].length ? m[sr][sc] : 0);
      }
      out.push(row);
    }
    return out;
  }

  function fmt(v) {
    return Math.round(v * 100) / 100;
  }

  /*
   * Draws a matrix of numbers as a <g>. Returns the group so the caller can
   * position it; `hl` marks a window of cells to emphasise.
   */
  function matrixGroup(m, cell, opts) {
    opts = opts || {};
    var g = svgEl("g", {});
    var rows = m.length,
      cols = m[0].length;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = c * cell,
          y = r * cell;
        var inHl =
          opts.hl &&
          r >= opts.hl.r &&
          r < opts.hl.r + opts.hl.rows &&
          c >= opts.hl.c &&
          c < opts.hl.c + opts.hl.cols;
        var isPad =
          opts.pad &&
          (r < opts.pad || c < opts.pad || r >= rows - opts.pad || c >= cols - opts.pad);
        var hidden = opts.revealUpTo != null && r * cols + c > opts.revealUpTo;

        g.appendChild(
          svgEl("rect", {
            x: x,
            y: y,
            width: cell,
            height: cell,
            fill: "currentColor",
            "fill-opacity": inHl ? "0.14" : isPad ? "0" : "0.05",
            stroke: "currentColor",
            "stroke-width": inHl ? "1.6" : "1",
            "stroke-dasharray": isPad ? "3 2" : "",
            "stroke-opacity": inHl ? "1" : "0.5"
          })
        );

        if (!hidden) {
          var t = svgEl("text", {
            x: x + cell / 2,
            y: y + cell / 2 + 4,
            "text-anchor": "middle",
            "font-size": "11",
            fill: "currentColor",
            "fill-opacity": isPad ? "0.45" : "1"
          });
          t.textContent = fmt(m[r][c]);
          g.appendChild(t);
        }
      }
    }

    if (opts.label) {
      var lbl = svgEl("text", {
        x: (cols * cell) / 2,
        y: -8,
        "text-anchor": "middle",
        "font-size": "12",
        fill: "currentColor",
        "fill-opacity": "0.75"
      });
      lbl.textContent = opts.label;
      g.appendChild(lbl);
    }
    return g;
  }

  // --- widget: convolution -------------------------------------------------

  /*
   * The convolution operation, stepped one filter position at a time. Output
   * cells are revealed as they are computed rather than shown up front — the
   * point is the sliding, not the answer.
   */
  function convolutionWidget(cfg) {
    var CCELL = 28;
    var base = cfg.values ? parseMatrix(cfg.values) : edgeInput(num(cfg, "n", 6, 3, 10));
    var kernel = FILTERS[cfg.filter] || (cfg.filter ? parseMatrix(cfg.filter) : FILTERS.vertical);

    var state = {
      p: num(cfg, "padding", 0, 0, 3),
      s: num(cfg, "stride", 1, 1, 4),
      pos: 0
    };

    var uid = "viz-" + Math.floor(Math.random() * 1e9).toString(36);
    var root = el("div", { class: "viz viz-convolution" });
    var figure = el("div", { class: "viz-figure" });
    var controls = el("div", { class: "viz-controls" });
    var readout = el("p", { class: "viz-readout", "aria-live": "polite" });

    var padC = control(uid + "-p", "padding p", state.p, 0, 3, function (v) {
      state.p = v;
      state.pos = 0;
      render();
    });
    var strC = control(uid + "-s", "stride s", state.s, 1, 4, function (v) {
      state.s = v;
      state.pos = 0;
      render();
    });
    controls.appendChild(padC.wrap);
    controls.appendChild(strC.wrap);

    var prev = button("‹ prev", function () {
      state.pos = Math.max(0, state.pos - 1);
      render();
    });
    var next = button("next ›", function () {
      state.pos = state.pos + 1;
      render();
    });
    var stepper = el("span", { class: "viz-stepper" });
    stepper.appendChild(prev);
    stepper.appendChild(next);
    controls.appendChild(stepper);

    function render() {
      var padded = padMatrix(base, state.p);
      var n = padded.length;
      var f = kernel.length;
      var out = Math.floor((n - f) / state.s) + 1;

      if (out < 1) {
        figure.textContent = "";
        readout.textContent =
          "No valid filter position: the " + f + "×" + f + " filter is larger than the " +
          n + "×" + n + " padded input.";
        prev.disabled = true;
        next.disabled = true;
        return;
      }

      var count = out * out;
      state.pos = Math.min(state.pos, count - 1);
      prev.disabled = state.pos === 0;
      next.disabled = state.pos === count - 1;

      var orow = Math.floor(state.pos / out),
        ocol = state.pos % out;
      var r0 = orow * state.s,
        c0 = ocol * state.s;

      // Every output value, so the grid can reveal them in order.
      var result = [];
      var terms = [];
      var i, j;
      for (i = 0; i < out; i++) {
        var rrow = [];
        for (j = 0; j < out; j++) {
          var acc = 0;
          for (var a = 0; a < f; a++) {
            for (var b = 0; b < f; b++) {
              var prod = padded[i * state.s + a][j * state.s + b] * kernel[a][b];
              acc += prod;
              if (i === orow && j === ocol && kernel[a][b] !== 0) {
                terms.push(
                  fmt(padded[i * state.s + a][j * state.s + b]) +
                    "·" +
                    (kernel[a][b] < 0 ? "(" + kernel[a][b] + ")" : kernel[a][b])
                );
              }
            }
          }
          rrow.push(acc);
        }
        result.push(rrow);
      }

      var inW = n * CCELL,
        fW = f * CCELL,
        outW = out * CCELL;
      var gap = 34;
      var w = 10 + inW + gap + fW + gap + outW + 10;
      var h = 26 + Math.max(n, f, out) * CCELL + 10;

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
        "A " + n + " by " + n + " input convolved with a " + f + " by " + f +
        " filter at stride " + state.s + ", giving a " + out + " by " + out +
        " output. Filter position " + (state.pos + 1) + " of " + count +
        " covers input rows " + (r0 + 1) + " to " + (r0 + f) +
        " and produces " + fmt(result[orow][ocol]) + ".";
      svg.appendChild(title);

      function place(g, x, y) {
        g.setAttribute("transform", "translate(" + x + "," + y + ")");
        svg.appendChild(g);
      }

      /*
       * Each grid is centred against the tallest of the three rather than
       * top-aligned, so the ∗ and = glyphs line up with the middle of every
       * grid instead of only the input's.
       */
      var top = 26;
      var tallest = Math.max(n, f, out);
      function midOf(rows) {
        return top + ((tallest - rows) * CCELL) / 2;
      }

      place(
        matrixGroup(padded, CCELL, {
          label: n + "×" + n + (state.p ? " padded" : " input"),
          hl: { r: r0, c: c0, rows: f, cols: f },
          pad: state.p
        }),
        10,
        midOf(n)
      );
      place(
        matrixGroup(kernel, CCELL, { label: f + "×" + f + " filter" }),
        10 + inW + gap,
        midOf(f)
      );
      place(
        matrixGroup(result, CCELL, {
          label: out + "×" + out + " output",
          hl: { r: orow, c: ocol, rows: 1, cols: 1 },
          revealUpTo: state.pos
        }),
        10 + inW + gap + fW + gap,
        midOf(out)
      );

      // The operator glyphs, on the shared centre line.
      var midY = top + (tallest * CCELL) / 2 + 6;
      [
        { x: 10 + inW + gap / 2, s: "∗" },
        { x: 10 + inW + gap + fW + gap / 2, s: "=" }
      ].forEach(function (op) {
        var t = svgEl("text", {
          x: op.x,
          y: midY,
          "text-anchor": "middle",
          "font-size": "17",
          fill: "currentColor"
        });
        t.textContent = op.s;
        svg.appendChild(t);
      });

      figure.textContent = "";
      figure.appendChild(svg);

      readout.textContent =
        "position " + (state.pos + 1) + " of " + count + ":   " +
        (terms.length ? terms.join(" + ") : "0") +
        " = " + fmt(result[orow][ocol]) +
        "      (zero-weight terms omitted)";
    }

    root.appendChild(figure);
    root.appendChild(controls);
    root.appendChild(readout);
    render();
    return root;
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
    shape: shapeWidget,
    convolution: convolutionWidget
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
