---
title: Contribute — Statlib
intro: false
---

# Contribute

Statlib is built collaboratively, and contributions of every kind are welcome: questions, examples, formalization requests, project proposals, and pull requests.

Have a question, example, or formalization request? Start a discussion on the [Statlib Zulip channel](https://leanprover.zulipchat.com/#narrow/channel/579630-Project-announcements/topic/Statlib/with/599909008).

Open a pull request against [stat-lib/statlib](https://github.com/stat-lib/statlib). New to the codebase? The [Projects](projects.html) page lists current directions and maintainers: a good place to find something to work on.

Code follows [Mathlib's style and naming conventions](https://leanprover-community.github.io/contribute/style.html). AI-assisted contributions must be understood by the contributor and disclosed in the PR description.

## Edit the Website {#edit-the-website .section-block}

The public pages are generated from Markdown source files in `content/`. To update the roadmap, projects, or contribution guidance, edit the matching Markdown file and run:

`python3 tools/build_site.py`

Then open a pull request with both the Markdown source change and the regenerated HTML. This keeps the website easy to review while still serving plain static files through GitHub Pages.
