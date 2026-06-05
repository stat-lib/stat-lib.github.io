# Statlib Website

This repository serves the public Statlib website as static HTML generated from Markdown.

## Update the Website

Edit Markdown files in `content/`, not the generated root HTML files.

- `content/index.md` builds `index.html`
- `content/roadmap.md` builds `roadmap.html`
- `content/projects.md` builds `projects.html`
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
