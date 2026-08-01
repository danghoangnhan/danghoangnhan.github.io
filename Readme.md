# danghoangnhan.github.io

[![CI](https://github.com/danghoangnhan/danghoangnhan.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/danghoangnhan/danghoangnhan.github.io/actions/workflows/ci.yml)
[![Deploy](https://github.com/danghoangnhan/danghoangnhan.github.io/actions/workflows/pages.yml/badge.svg)](https://github.com/danghoangnhan/danghoangnhan.github.io/actions/workflows/pages.yml)

Just some nerd's personal blog — developer, motorcycle enthusiast, cat person.

Mostly programming notes and research write-ups: computer vision and CNNs,
federated learning, LLM papers, and the occasional data-engineering deep dive.
Some hobby posts too, whenever I have time.

Live at **<https://danghoangnhan.github.io>**.

## Running locally

Requires **Ruby 3.4.10** (pinned in [`.ruby-version`](.ruby-version)).

On Windows, install the *Ruby+Devkit* variant — the plain one cannot build
native gems:

```powershell
winget install RubyInstallerTeam.RubyWithDevKit.3.4
```

Then, in a new terminal:

```powershell
gem install bundler
bundle install
bundle exec jekyll serve --livereload
```

The site is served at <http://127.0.0.1:4000>.

If `bundle install` fails building `wdm`, drop it from the `Gemfile` and use
`bundle exec jekyll serve --force-polling` instead.

### Building the way CI does

```powershell
$env:JEKYLL_ENV = "production"
bundle exec jekyll build
```

`JEKYLL_ENV=production` matters — the analytics snippet is gated on it.

### After changing the Gemfile

The lockfile must stay cross-platform or CI cannot resolve the
platform-specific `sass-embedded` gem:

```powershell
bundle lock --add-platform x86_64-linux
bundle lock --add-platform x64-mingw-ucrt
```

## How it is built and deployed

Jekyll 4.4, deployed to GitHub Pages by
[`.github/workflows/pages.yml`](.github/workflows/pages.yml).

This deliberately does **not** use GitHub's classic Pages build or
`actions/jekyll-build-pages` — both pin `github-pages` v232, which means Jekyll
3.10 and a fixed plugin allowlist that silently ignores `jekyll-archives`.
Building from this repository's own `Gemfile` is what makes the category
archives work and keeps the toolchain reproducible.

Pull requests are built by [`ci.yml`](.github/workflows/ci.yml), which also runs
an HTML link check.

> `htmlproofer` cannot run on Windows — it binds libcurl through `ethon`, and
> there is no `libcurl.dll`. It works on the Linux CI runner, so let the PR
> build do that check.

## Comments

Comments are [giscus](https://giscus.app), backed by GitHub Discussions — no ads
or trackers. Threads live in the repository's **Announcements** category, which is
announcement-format, so only maintainers can open a thread and readers cannot
create discussions just by visiting a post.

`_includes/comments.html` switches on `giscus.repo_id` **and** `giscus.category_id`
both being set, and otherwise falls back to a Disqus embed. Deleting either id from
`_config.yml` and restoring `disqus: 'https-danghoangnhan-github-io'` is therefore a
complete rollback.

The theme is not left to giscus. `data-theme="preferred_color_scheme"` would make
the comment iframe follow the OS while the page follows the reader's stored choice,
so `_includes/comments.html` builds the giscus `<script>` in JS and sets the
resolved theme on it, and `assets/js/theme.js` re-syncs it over `postMessage`.

There is no import path from Disqus to giscus, so anything worth keeping from the
old threads has to come out of the Disqus admin by hand.

## Writing a post

Add a file to `_posts/` named `YYYY-MM-DD-slug.md`:

```yaml
---
layout: post
title: Your title
author: danghoangnhan
categories: [ deep-learning, computer-vision ]
image: assets/images/something.png
featured: false
hidden: false
---
```

Categories are lowercase-hyphenated and drive the `/category/<name>/` archive
pages. Existing ones: `android`, `cnn`, `computer-vision`, `data-engineering`,
`deep-learning`, `devops`, `federated-learning`, `leetcode`, `llm`,
`reinforcement-learning`.

Post URLs come from the title slug (`permalink: /:title/`), so **renaming a post
file or its title changes its URL**.

Use `<!--more-->` to mark where the homepage excerpt should stop. Math is
rendered client-side by KaTeX; `$$…$$` works in Markdown.

## License

Dual-licensed — see [LICENSE](LICENSE):

- **Code** (layouts, includes, styles, scripts, workflows): MIT
- **Content** (posts, page copy, original images): CC BY 4.0

Figures reproduced from third-party papers or courses belong to their owners and
are not covered by the CC BY grant.
