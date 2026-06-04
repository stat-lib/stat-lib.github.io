#!/usr/bin/env python3
"""Build the static Statlib website from Markdown source files."""

from __future__ import annotations

import html
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIR = ROOT / "content"

PAGES = {
    "index": "index.html",
    "roadmap": "roadmap.html",
    "projects": "projects.html",
    "contribute": "contribute.html",
}

NAV = [
    ("index.html", "About", "index"),
    ("tutorial/index.html", "Tutorial", None),
    ("roadmap.html", "Roadmap", "roadmap"),
    ("projects.html", "Projects", "projects"),
    ("contribute.html", "Contribute", "contribute"),
]


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---\n", 4)
    if end == -1:
        raise ValueError("frontmatter starts with --- but has no closing ---")
    raw = text[4:end]
    meta: dict[str, str] = {}
    for line in raw.splitlines():
        if not line.strip():
            continue
        key, value = line.split(":", 1)
        meta[key.strip()] = value.strip()
    return meta, text[end + 5 :]


def slugify(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"[*_`$]", "", text)
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "section"


def parse_heading_attrs(text: str) -> tuple[str, str | None, list[str]]:
    match = re.search(r"\s+\{([^}]+)\}\s*$", text)
    if not match:
        return text.strip(), None, []
    attrs = match.group(1).split()
    text = text[: match.start()].strip()
    ident: str | None = None
    classes: list[str] = []
    for attr in attrs:
        if attr.startswith("#"):
            ident = attr[1:]
        elif attr.startswith("."):
            classes.append(attr[1:])
    return text, ident, classes


def render_inline(source: str) -> str:
    parts: list[str] = []
    tokens: list[str] = []

    def stash(match: re.Match[str]) -> str:
        tokens.append(match.group(0))
        return f"\u0000{len(tokens) - 1}\u0000"

    source = re.sub(r"\$\$.*?\$\$|\$.*?\$", stash, source)
    source = re.sub(r"`([^`]+)`", lambda m: f"<code>{html.escape(m.group(1))}</code>", html.escape(source))
    def link(match: re.Match[str]) -> str:
        label = match.group(1)
        href = match.group(2)
        attrs = ""
        if href.startswith(("http://", "https://")):
            attrs = ' target="_blank" rel="noopener"'
        return f'<a href="{href}"{attrs}>{label}</a>'

    source = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, source)
    source = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", source)
    source = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", source)

    for part in re.split(r"(\u0000\d+\u0000)", source):
        if part.startswith("\u0000") and part.endswith("\u0000"):
            parts.append(tokens[int(part.strip("\u0000"))])
        else:
            parts.append(part)
    return "".join(parts)


class MarkdownRenderer:
    def __init__(self, page_key: str, meta: dict[str, str]):
        self.page_key = page_key
        self.meta = meta
        self.lines: list[str] = []
        self.pending_paragraph: list[str] = []
        self.open_list = False
        self.list_class: str | None = None
        self.next_list_class: str | None = None
        self.open_topic = False
        self.open_section = False
        self.seen_h2 = False
        self.intro_mode = meta.get("intro", "false").lower() == "true"
        self.roadmap_toc: list[tuple[str, str, list[tuple[str, str]]]] = []

    def flush_paragraph(self) -> None:
        if not self.pending_paragraph:
            return
        text = " ".join(part.strip() for part in self.pending_paragraph).strip()
        cls = ' class="intro"' if self.intro_mode and not self.seen_h2 else ""
        self.lines.append(f"<p{cls}>{render_inline(text)}</p>")
        self.pending_paragraph = []

    def close_list(self) -> None:
        if self.open_list:
            self.lines.append("</ul>")
            self.open_list = False
            self.list_class = None

    def close_section(self) -> None:
        self.close_list()
        self.flush_paragraph()
        if self.open_section:
            self.lines.append("</section>")
            self.open_section = False

    def close_topic(self) -> None:
        self.close_section()
        if self.open_topic:
            self.lines.append("</section>")
            self.open_topic = False

    def open_container(self, level: int, text: str, ident: str | None, classes: list[str]) -> None:
        class_attr = f' class="{" ".join(classes)}"' if classes else ""
        id_attr = f' id="{ident}"' if ident else ""
        if level == 2 and "topic" in classes:
            self.close_topic()
            self.lines.append(f"<section{id_attr}{class_attr}>")
            self.open_topic = True
            self.seen_h2 = True
            self.lines.append(f"<h2>{render_inline(text)}</h2>")
            return
        if level == 2 and classes:
            self.close_topic()
            self.lines.append(f"<section{id_attr}{class_attr}>")
            self.open_section = True
            self.seen_h2 = True
            self.lines.append(f"<h2>{render_inline(text)}</h2>")
            return
        if level == 3 and classes:
            self.close_section()
            self.lines.append(f"<section{id_attr}{class_attr}>")
            self.open_section = True
            self.lines.append(f"<h3>{render_inline(text)}</h3>")
            return

        tag = f"h{level}"
        self.lines.append(f"<{tag}{id_attr}{class_attr}>{render_inline(text)}</{tag}>")
        if level == 2:
            self.seen_h2 = True

    def handle_heading(self, level: int, text: str) -> None:
        self.close_list()
        self.flush_paragraph()
        text, ident, classes = parse_heading_attrs(text)
        ident = ident or (slugify(text) if level > 1 and classes else None)
        if level == 4:
            if self.page_key == "roadmap":
                self.lines.append(f'<div class="sub-group">{render_inline(text)}</div>')
                self.next_list_class = "items"
            else:
                self.lines.append(f'<p class="section-label">{render_inline(text)}</p>')
            return
        self.open_container(level, text, ident, classes)

    def handle_list_item(self, text: str) -> None:
        self.flush_paragraph()
        list_class = self.next_list_class
        self.next_list_class = None
        if self.page_key == "roadmap" and self.open_section:
            list_class = list_class or "items"
        if not self.open_list:
            class_attr = f' class="{list_class}"' if list_class else ""
            self.lines.append(f"<ul{class_attr}>")
            self.open_list = True
            self.list_class = list_class
        self.lines.append(f"<li>{render_inline(text.strip())}</li>")

    def collect_roadmap_toc(self, body: str) -> None:
        current_topic: tuple[str, str, list[tuple[str, str]]] | None = None
        for raw in body.splitlines():
            match = re.match(r"^(#{2,3})\s+(.+)$", raw)
            if not match:
                continue
            level = len(match.group(1))
            text, ident, classes = parse_heading_attrs(match.group(2))
            if level == 2 and "topic" in classes:
                current_topic = (ident or slugify(text), text, [])
                self.roadmap_toc.append(current_topic)
            elif level == 3 and "section" in classes and current_topic:
                current_topic[2].append((ident or slugify(text), text))

    def insert_roadmap_toc(self) -> None:
        self.lines.append('<div class="topic-toc">')
        self.lines.append('<div class="topic-toc-title">Contents</div>')
        for topic_id, topic_title, sections in self.roadmap_toc:
            self.lines.append(f'<div class="topic-toc-part"><a href="#{topic_id}">{render_inline(topic_title)}</a></div>')
            self.lines.append('<ul class="topic-toc-sub">')
            for section_id, section_title in sections:
                self.lines.append(f'<li><a href="#{section_id}">{render_inline(section_title)}</a></li>')
            self.lines.append("</ul>")
        self.lines.append("</div>")

    def render(self, body: str) -> str:
        if self.page_key == "roadmap":
            self.collect_roadmap_toc(body)

        for raw in body.splitlines():
            line = raw.rstrip()
            if not line.strip():
                self.close_list()
                self.flush_paragraph()
                continue
            if line.strip() == "[[roadmap-toc]]":
                self.close_list()
                self.flush_paragraph()
                self.insert_roadmap_toc()
                continue
            heading = re.match(r"^(#{1,6})\s+(.+)$", line)
            if heading:
                self.handle_heading(len(heading.group(1)), heading.group(2))
                continue
            item = re.match(r"^-\s+(.+)$", line)
            if item:
                self.handle_list_item(item.group(1))
                continue
            self.close_list()
            self.pending_paragraph.append(line)

        self.close_topic()
        self.flush_paragraph()
        return "\n".join(self.lines)


def nav_html(active_key: str) -> str:
    links = []
    for href, label, key in NAV:
        active = ' class="active"' if key == active_key else ""
        links.append(f'    <a href="{href}"{active}>{label}</a>')
    return "\n".join(
        [
            "<nav>",
            '  <a href="index.html" class="brand">Statlib</a>',
            '  <div class="links">',
            *links,
            "  </div>",
            "</nav>",
        ]
    )


def render_page(page_key: str, meta: dict[str, str], body_html: str) -> str:
    title = meta.get("title", "Statlib")
    description = meta.get("description")
    math = meta.get("math", "false").lower() == "true"
    head = [
        "<!doctype html>",
        '<html lang="en">',
        "<head>",
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        f"<title>{html.escape(title)}</title>",
    ]
    if description:
        head.append(f'<meta name="description" content="{html.escape(description)}">')
    head.extend(
        [
            '<link rel="stylesheet" href="site.css?v=20260603-clean">',
            "</head>",
            '<body class="site-page">',
            "",
            "<!-- Generated from content/*.md by tools/build_site.py. Edit Markdown source, not this file. -->",
            nav_html(page_key),
            "",
            "<main>",
            '  <div class="wrap">',
            indent(body_html, "    "),
            "  </div>",
            "</main>",
        ]
    )
    if math:
        head.extend(
            [
                "",
                "<script>",
                "  window.MathJax = {",
                "    tex: { inlineMath: [['$', '$']], displayMath: [['$$', '$$']] },",
                "    svg: { fontCache: 'global' }",
                "  };",
                "</script>",
                '<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" async></script>',
            ]
        )
    head.extend(["", "</body>", "</html>", ""])
    return "\n".join(head)


def indent(text: str, prefix: str) -> str:
    return "\n".join(prefix + line if line else line for line in text.splitlines())


def build() -> None:
    for page_key, output_name in PAGES.items():
        source = CONTENT_DIR / f"{page_key}.md"
        meta, body = parse_frontmatter(source.read_text(encoding="utf-8"))
        renderer = MarkdownRenderer(page_key, meta)
        body_html = renderer.render(body)
        output = render_page(page_key, meta, body_html)
        (ROOT / output_name).write_text(output, encoding="utf-8")


if __name__ == "__main__":
    build()
