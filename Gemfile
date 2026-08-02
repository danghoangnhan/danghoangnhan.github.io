source "https://rubygems.org"

# Single source of truth for the Ruby version, shared with ruby/setup-ruby in CI.
ruby file: ".ruby-version"

# Jekyll proper, NOT the `github-pages` gem. That gem pins Jekyll 3.10 and a fixed
# plugin allowlist which silently drops jekyll-paginate-v2. Building it ourselves
# via GitHub Actions is what unlocks Jekyll 4 and arbitrary plugins.
gem "jekyll", "~> 4.4.1"

group :jekyll_plugins do
  # jekyll-feed removed: its generator no-ops when the source already contains a
  # feed.xml, and this repo hand-writes one. Carrying it meant a dependency, a
  # Dependabot subscription and a "Jekyll Feed: Generating feed for posts" line in
  # every build log, for a gem that produced nothing.
  gem "jekyll-sitemap",  "~> 1.4.0"
  gem "jekyll-seo-tag",  "~> 2.9.0"
  # Replaces the old jekyll-archives setup and paginates archive pages.
  # Ignored by GitHub's legacy builder; works because we control the build.
  gem "jekyll-paginate-v2", "~> 3.0.0"

  # Citations for the CNN series, which cites ~15 papers across 25 posts.
  #
  # The alternative was a hand-written "## References" list per post, which is what
  # the DQN and Luigi posts do. That does not scale here: the same seven papers
  # (AlexNet, VGG, ResNet, GoogLeNet, MobileNet v1/v2, EfficientNet) are cited from
  # a dozen posts each, and a hand-maintained list means the same entry copied a
  # dozen times, drifting apart on every correction. _bibliography/references.bib
  # is one entry per paper, cited by key.
  #
  # Pulls in citeproc-ruby, csl and csl-styles. csl-styles vendors the CSL
  # definitions, so the build needs no network beyond bundler — which matters
  # because CI builds with JEKYLL_ENV=production on a clean runner.
  #
  # Ignored by GitHub's legacy builder.
  gem "jekyll-scholar", "~> 7.3"
end

# Windows and JRuby ship no system tzdata.
platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Native directory watching for `jekyll serve` on Windows. If this fails to build,
# drop the line and use `bundle exec jekyll serve --force-polling`.
gem "wdm", "~> 0.2.0", platforms: :windows

# Deliberately NOT listed: webrick, csv, base64, json. Jekyll 4.4.1 declares all
# four as runtime dependencies, so adding them here is redundant. The widely
# repeated "add webrick on Ruby 3+" advice applies to Jekyll 4.2/4.3, not 4.4.
