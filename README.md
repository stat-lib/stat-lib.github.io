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

Commit both files: the Markdown source and the regenerated HTML.

## Markdown Rules

- Use normal Markdown paragraphs, links, headings, and `-` bullet lists.
- Keep stable section IDs when renaming headings, because other pages may link to them.
- External links are automatically opened in a new tab.
- The roadmap table of contents is generated automatically from `.topic` and `.section` headings.

Roadmap section example:

```md
## Classical Cores (1920's-1990's) {#topic-i .topic}

### 1.4 Semiparametric Efficiency Theories {#sec-1-4 .section}

#### Definitions.

- **Parametric Submodels and Tangent spaces**
```

Project section example:

```md
## 1. Semiparametric Efficiency Theory {#semiparametric-efficiency-theory .project}

#### Milestones.

- Contiguity
- Local asymptotic normality
```

## Pull Requests

Before opening a PR:

```sh
python3 tools/build_site.py
git status
```

Include the changed `content/*.md` files and the regenerated `.html` files. CI fails if the generated HTML is stale.
