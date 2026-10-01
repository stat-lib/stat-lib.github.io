# Statlib Website

This repository serves the public Statlib website as static HTML generated from Markdown.

## Update the Website

Edit Markdown files in `content/`, not the generated root HTML files.

- `content/index.md` builds `index.html`
- `content/roadmap.md` builds `roadmap.html`
- `content/todos.md` builds `todos.html`
- `content/contribute.md` builds `contribute.html`

After editing Markdown, rebuild the HTML:

```sh
python3 tools/build_site.py
```
## Pull Requests

Before opening a PR:

```sh
python3 tools/build_site.py
git status
```

Include the changed `content/*.md` files and the regenerated `.html` files. CI fails if the generated HTML is stale.

## Homepage Data

The homepage reads `data/homepage.json`, a same-origin snapshot generated from the public
`stat-lib/statlib` repository. Visitors never call the GitHub API directly.

The `Refresh homepage data` workflow updates the snapshot each Monday and can also be run
manually. It extracts structured `/- TODO: ... -/` theorem comments from Lean source files and
collects the last 52 weeks of repository activity. If GitHub activity cannot be refreshed, the
generator retains the last successful activity snapshot.
