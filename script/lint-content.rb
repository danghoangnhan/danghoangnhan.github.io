#!/usr/bin/env ruby
# frozen_string_literal: true

#
# Content lint for _posts.
#
# Every check here corresponds to a defect that shipped to production and stayed
# there, invisible to the existing CI. That check is `jekyll build` plus
# `html-proofer --disable-external`, which can tell you a link is broken and
# nothing else: not that a post is empty, not that its title describes a different
# article, not that all 25 posts share one meta description. Those are the bugs
# this site actually had.
#
# Deliberately dependency-free — plain Ruby and a hand-rolled front-matter parse,
# so `ruby script/lint-content.rb` works without bundler and adds nothing to the
# Gemfile.
#
# Exit codes: 0 clean, 1 one or more errors.
#

require "yaml"
require "set"

# CONTENT_LINT_ROOT lets the checks be pointed at a fixture tree, which is how
# they are tested — a linter nobody has ever seen fail is not a guardrail.
ROOT = ENV.fetch("CONTENT_LINT_ROOT", File.expand_path("..", __dir__))
POSTS = File.join(ROOT, "_posts")

# Body text below this is a stub, not an article. Measured in characters. The four posts deleted in this
# pass measured 0, 23, 46 and 66 characters; the shortest real post is ~890.
MIN_BODY_CHARS = 400

# Widget names assets/js/viz.js can render. Must match the WIDGETS table there.
VIZ_TYPES = %w[shape convolution pooling iou nms filter].freeze

# Languages that may appear in `lang:`, and the locale each one requires.
LOCALES = YAML.safe_load_file(File.join(ROOT, "_data", "languages.yml"))

Failure = Struct.new(:file, :message)
failures = []
warnings = []

# Every @entry{key, ...} in the shared bibliography.
#
# Parsed with a regex rather than bibtex-ruby on purpose: this script is
# deliberately dependency-free so `ruby script/lint-content.rb` runs without
# bundler, and the only thing needed here is the key.
#
# Empty when the file is absent, which is not an error — the cite check below is
# skipped in that case rather than failing every post at once.
BIB = File.join(ROOT, "_bibliography", "references.bib")
BIB_KEYS = if File.exist?(BIB)
             File.read(BIB, encoding: "UTF-8").scan(/^@\w+\s*\{\s*([^,\s]+)\s*,/).flatten.to_set
           else
             Set.new
           end

def split_front_matter(raw)
  # A UTF-8 BOM is invisible in an editor and Jekyll copes with it, but it makes
  # `start_with?("---")` false and the whole file look like it has no front
  # matter. Strip it rather than reporting a bogus error.
  raw = raw.sub(/\A﻿/, "")
  return [nil, raw] unless raw.start_with?("---")

  parts = raw.split(/^---\s*\R?$/, 3)
  return [nil, raw] if parts.length < 3

  # Malformed YAML used to escape as a bare Psych backtrace, which aborted the run
  # and hid every remaining check behind one bad file. Report it as what it is.
  begin
    [YAML.safe_load(parts[1], permitted_classes: [Date, Time]) || {}, parts[2]]
  rescue Psych::SyntaxError => e
    [:invalid, e.message]
  end
end

posts = Dir.glob(File.join(POSTS, "*.{md,markdown}")).sort
abort "no posts found under #{POSTS}" if posts.empty?

titles = Hash.new { |h, k| h[k] = [] }

posts.each do |path|
  name = File.basename(path)
  raw = File.read(path, encoding: "UTF-8")

  front, body = split_front_matter(raw)

  if front == :invalid
    failures << Failure.new(name, "front matter is not valid YAML: #{body.to_s.lines.first.to_s.strip}")
    next
  end

  if front.nil?
    failures << Failure.new(name, "no YAML front matter")
    next
  end

  # --- a post has to actually say something -------------------------------
  #
  # _posts/2023-03-03-generic.md was front matter and nothing else for two years.
  # It was `hidden: true`, so no listing showed it — but series-nav.html linked
  # every reader of the CNN course straight at it, and they got a title, a
  # featured image, a comment thread and no article.
  stripped = body.to_s.strip
  if stripped.length < MIN_BODY_CHARS
    failures << Failure.new(name, "body is #{stripped.length} characters; a post needs at least #{MIN_BODY_CHARS}")
  end

  # --- title ---------------------------------------------------------------
  title = front["title"].to_s.strip
  if title.empty?
    failures << Failure.new(name, "no title")
  else
    titles[title.downcase] << name
  end

  # --- description ---------------------------------------------------------
  #
  # Without one, jekyll-seo-tag falls back to site.description, so every post
  # presents Google and every social preview with the same sentence. All 25 posts
  # did exactly that.
  desc = front["description"].to_s.strip
  if desc.empty?
    failures << Failure.new(name, "no description: (feeds meta description, og:description, the RSS summary and the post card)")
  elsif desc.length < 50
    warnings << Failure.new(name, "description is only #{desc.length} characters; ~120-160 reads best in search results")
  end

  # --- one h1 per page -----------------------------------------------------
  #
  # _layouts/post.html renders `title:` as the article's h1. An `# ` heading in
  # the body makes a second one, directly under the first, usually saying almost
  # the same thing. 18 of 29 posts did this.
  # Fenced code is skipped: a shell snippet whose comments start with "# " is not
  # a heading, and flagging it would fail CI on a perfectly good post.
  in_fence = false
  h1 = stripped.lines.find do |l|
    in_fence = !in_fence if l.start_with?("```", "~~~")
    !in_fence && l.start_with?("# ")
  end
  if h1
    failures << Failure.new(name, "body starts a level-1 heading (#{h1.strip.inspect}); the layout already renders title: as the h1 — use ##")
  end

  # --- image ---------------------------------------------------------------
  # The leading slash is load-bearing, which is why this checks the SHAPE of the
  # value and not just that the file exists.
  #
  # jekyll-seo-tag's ImageDrop only calls absolute_url directly when the path
  # starts with "/". Otherwise it does File.join(page.url, path) first, so
  # `image: assets/images/cnn1.png` on /poolinglayers/ emits
  # https://…/poolinglayers/assets/images/cnn1.png — a 404, on og:image,
  # twitter:image and the BlogPosting JSON-LD alike. Every post on this site had
  # that shape, so every social preview was a broken image, and an existence check
  # against the source tree passed on all of them because the FILE is fine; it is
  # the emitted URL that is wrong.
  image = front["image"].to_s.strip
  if image.empty?
    warnings << Failure.new(name, "no image:; jekyll-seo-tag reads page.image only, so this post emits no og:image at all")
  elsif image.end_with?(".svg")
    failures << Failure.new(name, "image: is an SVG; og:image is not rendered as SVG by Facebook, LinkedIn or X, so the post previews blank")
  elsif image.start_with?("http")
    # An absolute URL is emitted verbatim; nothing local to check.
  elsif !image.start_with?("/")
    failures << Failure.new(name, "image: #{image} needs a leading slash, or jekyll-seo-tag resolves it against the post's own URL and og:image 404s")
  elsif !File.exist?(File.join(ROOT, image.sub(%r{\A/}, "")))
    failures << Failure.new(name, "image: #{image} does not exist")
  end

  # --- language and locale travel together ---------------------------------
  #
  # jekyll-seo-tag builds og:locale as `page.locale || site.locale || page.lang`,
  # and Open Graph wants language_TERRITORY. A post with `lang: vi` and no
  # `locale:` ships the invalid `og:locale: vi`. The right value is already in
  # _data/languages.yml.
  lang = front["lang"].to_s.strip
  unless lang.empty?
    unless LOCALES.key?(lang)
      failures << Failure.new(name, "lang: #{lang} is not a key in _data/languages.yml")
    end

    expected = LOCALES.dig(lang, "locale")
    actual = front["locale"].to_s.strip
    if expected && actual != expected
      failures << Failure.new(name, "lang: #{lang} requires locale: #{expected} (found #{actual.empty? ? 'nothing' : actual})")
    end
  end

  # --- citations resolve ---------------------------------------------------
  #
  # jekyll-scholar renders an unknown key as the literal text "(missing
  # reference)" and returns. No link, no anchor, no warning, exit 0 — and
  # html-proofer sees nothing wrong because no broken href was ever emitted. A
  # typo'd or renamed key therefore ships to production looking like prose.
  #
  # Keys are case-sensitive: BibTeX::Bibliography looks them up in a String-keyed
  # Hash, so `{% cite He2016resnet %}` misses `@inproceedings{he2016resnet, ...}`.
  unless BIB_KEYS.empty?
    body.to_s.scan(/\{%-?\s*cite\s+([^%]+?)\s*-?%\}/) do |match|
      # One tag may cite several keys: {% cite a b c %}. Trailing --options are
      # not keys.
      match[0].split(/\s+/).reject { |k| k.start_with?("--") }.each do |key|
        next if BIB_KEYS.include?(key)

        failures << Failure.new(name, "{% cite #{key} %} is not a key in _bibliography/references.bib (renders as \"(missing reference)\")")
      end
    end
  end

  # --- a bibliography with nothing in it -----------------------------------
  #
  # {% bibliography --cited %} on a post that cites nothing renders
  # <ol class="bibliography"></ol> — an empty list under a "References" heading.
  # Valid HTML, invisible to html-proofer, and it looks like the references
  # failed to load. Upstream has an open issue asking for it to be suppressible;
  # until then the fix is to not write the heading.
  has_bibliography = body.to_s.match?(/\{%-?\s*bibliography/)
  has_cite = body.to_s.match?(/\{%-?\s*cite\s/)
  if has_bibliography && !has_cite
    failures << Failure.new(name, "has {% bibliography %} but no {% cite %}; it renders an empty <ol> under the References heading")
  end

  # --- math and diagrams are opt-in ----------------------------------------
  #
  # KaTeX and Mermaid each load only when the post sets its flag, and both fail
  # soft: KaTeX is configured `throwOnError: false`, and an unconverted Mermaid
  # fence is just a code block. So a post that uses either and forgets the flag
  # builds clean, passes html-proofer, and ships showing raw TeX or raw
  # `flowchart LR` to readers. Nothing else in CI looks at this.
  #
  # Fenced code is skipped for the same reason the h1 check skips it: a shell
  # snippet costing `$$5.00` is not display math, and a ```mermaid fence is the
  # thing being looked for, not evidence of one.
  in_fence = false
  fence_lang = nil
  math_delims = 0
  has_mermaid_fence = false
  has_viz_fence = false
  viz_types = []
  stripped.each_line do |line|
    if line.start_with?("```", "~~~")
      if in_fence
        in_fence = false
        fence_lang = nil
      else
        in_fence = true
        fence_lang = line.strip.delete_prefix("```").delete_prefix("~~~").strip.downcase
        has_mermaid_fence = true if fence_lang == "mermaid"
        has_viz_fence = true if fence_lang == "viz"
      end
      next
    end
    # Collect the `type:` of each viz block so an unknown one can be reported.
    viz_types << Regexp.last_match(1).strip if in_fence && fence_lang == "viz" && line =~ /^\s*type:\s*(\S+)/
    math_delims += line.scan("$$").length unless in_fence
  end

  if math_delims.odd?
    failures << Failure.new(name, "odd number of $$ delimiters (#{math_delims}); one of them is unclosed and will render as literal text")
  end

  uses_math = math_delims.positive?
  if uses_math && !front["katex"]
    failures << Failure.new(name, "body uses $$ math but front matter has no `katex: true`; KaTeX never loads and the formulas ship as raw TeX")
  end
  if !uses_math && front["katex"]
    warnings << Failure.new(name, "front matter sets katex: but the body has no $$ math; the post loads KaTeX for nothing")
  end

  if has_mermaid_fence && !front["mermaid"]
    failures << Failure.new(name, "body has a ```mermaid fence but front matter has no `mermaid: true`; it renders as a code block")
  end
  if !has_mermaid_fence && front["mermaid"]
    warnings << Failure.new(name, "front matter sets mermaid: but the body has no ```mermaid fence")
  end

  # Same contract for the interactive figures in assets/js/viz.js, which fail
  # soft in the same way: without the flag the script never loads and the fence
  # ships as a visible block of config.
  if has_viz_fence && !front["viz"]
    failures << Failure.new(name, "body has a ```viz fence but front matter has no `viz: true`; it renders as a code block")
  end
  if !has_viz_fence && front["viz"]
    warnings << Failure.new(name, "front matter sets viz: but the body has no ```viz fence")
  end

  # A `type:` viz.js does not know leaves the fence on the page untouched — the
  # renderer deliberately does not throw or blank it — so a typo is invisible
  # here and obvious to a reader. Keep this list in step with WIDGETS in
  # assets/js/viz.js.
  (viz_types - VIZ_TYPES).each do |t|
    failures << Failure.new(name, "```viz block has unknown type: #{t} (known: #{VIZ_TYPES.join(', ')})")
  end
  if has_viz_fence && viz_types.empty?
    failures << Failure.new(name, "```viz block has no `type:` line, so nothing is rendered")
  end

  # --- filenames become URLs ----------------------------------------------
  #
  # `2023-03-27-simple-convolution-neural-network-example copy.md` published at
  # /simple-convolution-neural-network-example-copy/ for two years.
  if name.match?(/\s/)
    warnings << Failure.new(name, "filename contains a space, which is slugified into the public URL")
  end
  if name.match?(/copy/i)
    failures << Failure.new(name, "filename contains 'copy'; it is baked into the public URL")
  end
end

# --- duplicate titles ------------------------------------------------------
#
# Three posts were titled "Strided Convolutions", two "EfficientNet" and two
# "Data Augmentation" — and two of those titles described a different article
# than the one under them. Listings, search, the feed and the series nav all show
# the title, so readers had no way to tell them apart.
titles.each do |title, files|
  next if files.length < 2

  failures << Failure.new(files.join(", "), "duplicate title #{title.inspect}")
end

# --- report ----------------------------------------------------------------
warnings.each { |w| puts "warning: #{w.file}: #{w.message}" }

if failures.empty?
  puts "content lint: #{posts.length} posts OK#{warnings.empty? ? '' : " (#{warnings.length} warnings)"}"
  exit 0
end

puts
failures.each { |f| puts "error: #{f.file}: #{f.message}" }
puts
puts "content lint: #{failures.length} error#{'s' if failures.length != 1} across #{posts.length} posts"
exit 1
