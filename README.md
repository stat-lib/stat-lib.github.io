# Statlib Website

This repository serves the public Statlib website as static HTML.

## Editing Content

Most hand-written pages are sourced from Markdown files in `content/`:

- `content/index.md` builds `index.html`
- `content/roadmap.md` builds `roadmap.html`
- `content/projects.md` builds `projects.html`
- `content/contribute.md` builds `contribute.html`

Edit the Markdown files first, then regenerate the HTML:

```sh
python3 tools/build_site.py
```

Commit both the Markdown source and generated HTML. This keeps GitHub Pages deployment simple while allowing collaborators to edit the roadmap and project pages without touching HTML.

Pull requests run a build check that fails if the generated HTML is stale.

## Roadmap Format

Use ordinary Markdown headings and lists. Stable section links are written as heading attributes:

```md
### 1.4 Semiparametric Efficiency Theories {#sec-1-4 .section}

#### Definitions.

- **Parametric Submodels and Tangent spaces**
```

The roadmap table of contents is generated from headings marked with `.topic` and `.section`.

## Generated Files

Root HTML pages include a generated-file comment. Do not hand-edit those files unless you also move the same change back into `content/`.
