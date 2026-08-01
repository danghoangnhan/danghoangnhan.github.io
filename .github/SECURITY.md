# Security policy

This repository builds a static personal blog. There is no server, no database, and
no user data — so the realistic issue space is third-party front-end dependencies
(loaded from a CDN), workflow permissions, and anything that could inject content
into a published page.

## Reporting

Please **do not open a public issue** for a security problem.

Use GitHub's private reporting instead: **Security → Report a vulnerability** on this
repository. That opens a draft advisory visible only to the maintainer.

If that is unavailable, email <danghoangnhan.1@gmail.com>.

I will acknowledge within a few days. Since this is a personal site, please treat any
timeline as best-effort.

## Scope

In scope:

- Vulnerable or compromised front-end dependencies pinned in `_layouts/`
- Subresource Integrity (SRI) hashes that are missing or wrong
- GitHub Actions workflow issues (excessive permissions, script injection, unpinned actions)
- Anything allowing content injection into a published page

Out of scope:

- Findings against `github.io` infrastructure itself — report those to GitHub
- Missing security headers that GitHub Pages does not allow a static site to set
- Dead links and typos — those are ordinary [bug reports](../../issues/new/choose)
