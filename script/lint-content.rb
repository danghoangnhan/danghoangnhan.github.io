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

# Languages that may appear in `lang:`, and the locale each one requires.
LOCALES = YAML.safe_load_file(File.join(ROOT, "_data", "languages.yml"))

Failure = Struct.new(:file, :message)
failures = []
warnings = []

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
