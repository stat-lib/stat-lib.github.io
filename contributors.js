// Renders a live community activity board (commits, comments, issues/PRs opened) into #activity.
// The static list in contributors.md stays as the fallback if the API is unavailable.
(function () {
  "use strict";

  const REPO = "stat-lib/statlib";
  const API = `https://api.github.com/repos/${REPO}`;
  const WEEK = 7 * 24 * 3600;

  // Accounts that are not individual people.
  const HIDDEN = new Set(["formal-stat"]);

  // GitHub login -> display name and preferred homepage.
  const PEOPLE = {
    RemyDegenne: { name: "Rémy Degenne", url: "https://remydegenne.github.io/" },
    zixiaowang17: { name: "Zixiao Jolene Wang", url: "https://zixiaowang17.github.io/" },
    bocowgill: { name: "Bo Cowgill", url: "http://bocowgill.com" },
    "rajarshi-mukherjee24": { name: "Rajarshi Mukherjee", url: "https://rajarshi-mukherjee24.github.io/" },
    CoolRmal: { name: "Yongxi (Aaron) Lin", url: "https://coolrmal.github.io/" },
    richardkwo: { name: "Richard Guo", url: "https://unbiased.co.in" },
    qingyuanzhao: { name: "Qingyuan Zhao", url: "http://www.statslab.cam.ac.uk/~qz280/" },
    bjoernkjoshanssen: { name: "Bjørn Kjos-Hanssen", url: "http://math.hawaii.edu/wordpress/bjoern/" },
  };

  // Stacked bottom to top in this order; colors are set in site.css.
  const KINDS = [
    { key: "commits", one: "commit", many: "commits" },
    { key: "comments", one: "comment", many: "comments" },
    { key: "opened", one: "issue/PR opened", many: "issues/PRs opened" },
  ];

  const section = document.getElementById("activity");
  if (!section) return;

  const isPerson = (user) =>
    user && user.type !== "Bot" && !user.login.endsWith("[bot]") && !HIDDEN.has(user.login);
  const displayName = (login) => (PEOPLE[login] || {}).name || login;

  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "text") node.textContent = value;
      else node.setAttribute(key, value);
    }
    for (const child of [].concat(children)) if (child) node.append(child);
    return node;
  };

  const svg = (tag, attrs = {}) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  };

  const fmtDate = (seconds) =>
    new Date(seconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const fmtMonth = (seconds) =>
    new Date(seconds * 1000).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const count = (n, kind) => `${n.toLocaleString()} ${n === 1 ? kind.one : kind.many}`;

  // GitHub's commit stats bucket weeks starting Sunday 00:00 UTC; match that.
  const weekStart = (iso) => {
    const d = new Date(iso);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return d.getTime() / 1000;
  };

  const tooltip = el("div", { class: "gh-tooltip", role: "status", "aria-live": "polite" });
  document.body.append(tooltip);
  const showTip = (event, text) => {
    tooltip.textContent = text;
    tooltip.style.display = "block";
    const box = tooltip.getBoundingClientRect();
    let x = event.clientX + 12;
    if (x + box.width > window.innerWidth - 8) x = event.clientX - box.width - 12;
    tooltip.style.left = `${x + window.scrollX}px`;
    tooltip.style.top = `${event.clientY + window.scrollY - box.height - 10}px`;
  };
  const hideTip = () => { tooltip.style.display = "none"; };

  const weekTotal = (week, kinds) => kinds.reduce((sum, k) => sum + week[k.key], 0);

  // Stacked weekly columns. Every chart shares yMax so heights compare across people.
  function weeklyChart(weeks, yMax, kinds, { height, axis, label }) {
    const width = 600;
    const plotH = height - (axis ? 18 : 0);
    const slot = width / weeks.length;
    const barW = Math.max(1, Math.min(slot - 2, slot * 0.6));
    const gap = 2; // surface gap between stacked segments
    const root = svg("svg", {
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: "none",
      class: "gh-chart",
      role: "img",
      "aria-label": label,
    });
    root.style.height = `${height}px`;
    root.append(svg("line", { x1: 0, x2: width, y1: plotH, y2: plotH, class: "gh-baseline" }));

    weeks.forEach((week, i) => {
      const x = i * slot + (slot - barW) / 2;
      const present = kinds.filter((k) => week[k.key] > 0);
      let base = plotH;
      present.forEach((kind, j) => {
        const h = (week[kind.key] / yMax) * (plotH - 4);
        const top = base - h;
        const isTop = j === present.length - 1;
        const r = isTop ? Math.min(2, barW / 2, h) : 0;
        const bottom = j === 0 ? base : base - gap / 2;
        const segTop = isTop ? top : top + gap / 2;
        if (bottom - segTop > 0.5) {
          root.append(svg("path", {
            class: `gh-bar gh-${kind.key}`,
            d: `M${x},${bottom}V${segTop + r}Q${x},${segTop} ${x + r},${segTop}H${x + barW - r}Q${x + barW},${segTop} ${x + barW},${segTop + r}V${bottom}Z`,
          }));
        }
        base = top;
      });

      // Full-height hit target, larger than the mark.
      const hit = svg("rect", { x: i * slot, y: 0, width: slot, height: plotH, class: "gh-hit" });
      const parts = present.map((k) => count(week[k.key], k));
      const text = `Week of ${fmtDate(week.w)}: ${parts.length ? parts.join(", ") : "no activity"}`;
      hit.addEventListener("mousemove", (e) => { hit.classList.add("on"); showTip(e, text); });
      hit.addEventListener("mouseleave", () => { hit.classList.remove("on"); hideTip(); });
      root.append(hit);

      if (axis) {
        const prev = weeks[i - 1];
        if (!prev || fmtMonth(prev.w) !== fmtMonth(week.w)) {
          const t = svg("text", { x, y: height - 4, class: "gh-axis" });
          t.textContent = fmtMonth(week.w);
          root.append(t);
        }
      }
    });
    return root;
  }

  function legend(kinds) {
    return el("div", { class: "gh-legend" }, kinds.map((k) =>
      el("span", { class: "gh-legend-item" }, [el("span", { class: `gh-swatch gh-${k.key}` }), k.many])
    ));
  }

  function card(row, rank, grand, yMax, kinds) {
    const info = PEOPLE[row.user.login] || {};
    const meta = KINDS.filter((k) => row[k.key] > 0).map((k) => count(row[k.key], k));
    const pct = grand ? (row.total / grand) * 100 : 0;
    const share = el("div", { class: "gh-share", title: `${pct.toFixed(0)}% of all activity` }, [
      el("span", { class: "gh-share-fill" }),
    ]);
    share.firstChild.style.width = `${pct}%`;
    const node = el("li", { class: "gh-card" }, [
      el("span", { class: "gh-rank", text: `#${rank}` }),
      el("div", { class: "gh-person" }, [
        el("img", { src: `https://avatars.githubusercontent.com/${row.user.login}?s=96`, alt: "", class: "gh-avatar", loading: "lazy" }),
        el("div", { class: "gh-who" }, [
          el("a", { href: info.url || row.user.html_url, target: "_blank", rel: "noopener", class: "gh-name", text: displayName(row.user.login) }),
          el("a", { href: row.user.html_url, target: "_blank", rel: "noopener", class: "gh-login", text: `@${row.user.login}` }),
        ]),
        el("div", { class: "gh-meta", text: meta.join("  ·  ") }),
      ]),
      share,
    ]);
    if (row.weeks.length) {
      node.append(weeklyChart(row.weeks, yMax, kinds, { height: 56, axis: false, label: `Weekly activity by ${displayName(row.user.login)}` }));
    }
    return node;
  }

  function render(rows, weekStarts, commitWeeks) {
    // Commits only join the charts when GitHub returned weekly commit stats.
    const kinds = commitWeeks ? KINDS : KINDS.slice(1);
    const grand = rows.reduce((sum, r) => sum + r.total, 0);
    const view = el("div", { class: "gh-view" });

    if (weekStarts.length) {
      const combined = weekStarts.map((w, i) => {
        const week = { w };
        for (const k of KINDS) week[k.key] = rows.reduce((sum, r) => sum + r.weeks[i][k.key], 0);
        return week;
      });
      const combinedMax = Math.max(1, ...combined.map((w) => weekTotal(w, kinds)));
      view.append(el("div", { class: "gh-overview" }, [
        el("div", { class: "gh-overview-head" }, [
          el("div", { class: "gh-overview-title", text: `Activity per week · ${rows.length} people` }),
          legend(kinds),
        ]),
        weeklyChart(combined, combinedMax, kinds, { height: 120, axis: true, label: `Weekly activity in ${REPO}` }),
      ]));
    }

    const personMax = Math.max(1, ...rows.flatMap((r) => r.weeks.map((w) => weekTotal(w, kinds))));
    const grid = el("ol", { class: "gh-cards" });
    rows.forEach((r, i) => grid.append(card(r, i + 1, grand, personMax, kinds)));
    view.append(grid);
    section.querySelector("ul").replaceWith(view);
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // GitHub answers 202 while it computes statistics; poll briefly.
  async function loadStats() {
    for (let attempt = 0; attempt < 5; attempt++) {
      const res = await fetch(`${API}/stats/contributors`);
      if (res.status === 200) return res.json();
      if (res.status !== 202) throw new Error(`stats ${res.status}`);
      await sleep(1500 * (attempt + 1));
    }
    throw new Error("stats not ready");
  }

  // Follows GitHub's Link header to collect every page of a list endpoint.
  async function fetchAll(url, maxPages = 10) {
    const items = [];
    for (let page = 0; url && page < maxPages; page++) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${url} ${res.status}`);
      items.push(...(await res.json()));
      const next = /<([^>]+)>;\s*rel="next"/.exec(res.headers.get("Link") || "");
      url = next ? next[1] : null;
    }
    return items;
  }

  async function main() {
    const [stats, comments, issues] = await Promise.all([
      loadStats().catch(() => null),
      fetchAll(`${API}/issues/comments?per_page=100`).catch(() => []),
      fetchAll(`${API}/issues?state=all&per_page=100`).catch(() => []),
    ]);
    // Without weekly stats, fall back to plain commit totals.
    const totals = stats ? [] : await fetchAll(`${API}/contributors?per_page=100`).catch(() => []);

    const events = []; // [user, kind, weekStart]
    comments.forEach((c) => events.push([c.user, "comments", weekStart(c.created_at)]));
    issues.forEach((i) => events.push([i.user, "opened", weekStart(i.created_at)]));

    // Continuous week axis from the first activity to the current week.
    const starts = events.map((e) => e[2]);
    if (stats && stats[0]) starts.push(stats[0].weeks[0].w);
    const weekStarts = [];
    if (starts.length) {
      const end = weekStart(new Date().toISOString());
      for (let w = Math.min(...starts); w <= end; w += WEEK) weekStarts.push(w);
    }
    const index = new Map(weekStarts.map((w, i) => [w, i]));

    const people = new Map();
    const row = (user) => {
      if (!people.has(user.login)) {
        people.set(user.login, {
          user, commits: 0, comments: 0, opened: 0,
          weeks: weekStarts.map((w) => ({ w, commits: 0, comments: 0, opened: 0 })),
        });
      }
      return people.get(user.login);
    };

    (stats || []).filter((s) => isPerson(s.author)).forEach((s) => {
      const r = row(s.author);
      s.weeks.forEach((wk) => {
        if (!wk.c) return;
        r.commits += wk.c;
        const i = index.get(wk.w);
        if (i != null) r.weeks[i].commits += wk.c;
      });
    });
    totals.filter(isPerson).forEach((c) => { row(c).commits += c.contributions; });
    events.forEach(([user, kind, w]) => {
      if (!isPerson(user)) return;
      const r = row(user);
      r[kind] += 1;
      r.weeks[index.get(w)][kind] += 1;
    });

    const rows = [...people.values()]
      .map((r) => Object.assign(r, { total: r.commits + r.comments + r.opened }))
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total || a.user.login.localeCompare(b.user.login));
    if (rows.length) render(rows, weekStarts, Boolean(stats));
  }

  main().catch(() => {
    // Keep the static fallback list.
  });
})();
