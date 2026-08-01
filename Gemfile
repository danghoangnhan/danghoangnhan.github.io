source "https://rubygems.org"

# Single source of truth for the Ruby version, shared with ruby/setup-ruby in CI.
ruby file: ".ruby-version"

# Jekyll proper, NOT the `github-pages` gem. That gem pins Jekyll 3.10 and a fixed
# plugin allowlist which silently drops jekyll-archives. Building it ourselves via
# GitHub Actions is what unlocks Jekyll 4 and arbitrary plugins.
gem "jekyll", "~> 4.4.1"

group :jekyll_plugins do
  gem "jekyll-feed",     "~> 0.17.0"
  gem "jekyll-sitemap",  "~> 1.4.0"
  gem "jekyll-seo-tag",  "~> 2.9.0"
  # Ignored by GitHub's legacy builder; starts working once we control the build.
  gem "jekyll-archives", "~> 2.3.0"
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
