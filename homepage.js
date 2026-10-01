// Renders the cached homepage snapshot. The browser never calls the GitHub API directly.
(function () {
  "use strict";

  const DATA_URL = "data/homepage.json";
  const KINDS = [
    { key: "commits", one: "commit", many: "commits" },
    { key: "comments", one: "comment", many: "comments" },
    { key: "opened", one: "issue/PR opened", many: "issues/PRs opened" },
  ];

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
    new Date(seconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  const fmtMonth = (seconds) =>
    new Date(seconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
  const fmtUpdated = (value) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  const count = (number, kind) =>
    `${number.toLocaleString()} ${number === 1 ? kind.one : kind.many}`;
  const weekTotal = (week) =>
    KINDS.reduce((sum, kind) => sum + week[kind.key], 0);

  const tooltip = el("div", {
    class: "gh-tooltip",
    role: "status",
    "aria-live": "polite",
  });
  document.body.append(tooltip);

  const showTip = (event, text) => {
    tooltip.textContent = text;
    tooltip.style.display = "block";
    const box = tooltip.getBoundingClientRect();
    let x = event.clientX + 12;
    if (x + box.width > window.innerWidth - 8) {
      x = event.clientX - box.width - 12;
    }
    tooltip.style.left = `${x + window.scrollX}px`;
    tooltip.style.top = `${event.clientY + window.scrollY - box.height - 10}px`;
  };

  const hideTip = () => {
    tooltip.style.display = "none";
  };

  function weeklyChart(weeks, yMax, { height, axis, label }) {
    const width = 600;
    const plotHeight = height - (axis ? 18 : 0);
    const slot = width / weeks.length;
    const barWidth = Math.max(1, Math.min(slot - 2, slot * 0.6));
    const gap = 2;
    const root = svg("svg", {
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: "none",
      class: "gh-chart",
      role: "img",
      "aria-label": label,
    });
    root.style.height = `${height}px`;
    root.append(
      svg("line", {
        x1: 0,
        x2: width,
        y1: plotHeight,
        y2: plotHeight,
        class: "gh-baseline",
      }),
    );

    weeks.forEach((week, index) => {
      const x = index * slot + (slot - barWidth) / 2;
      const present = KINDS.filter((kind) => week[kind.key] > 0);
      let base = plotHeight;
      present.forEach((kind, kindIndex) => {
        const segmentHeight = (week[kind.key] / yMax) * (plotHeight - 4);
        const top = base - segmentHeight;
        const isTop = kindIndex === present.length - 1;
        const radius = isTop ? Math.min(2, barWidth / 2, segmentHeight) : 0;
        const bottom = kindIndex === 0 ? base : base - gap / 2;
        const segmentTop = isTop ? top : top + gap / 2;
        if (bottom - segmentTop > 0.5) {
          root.append(
            svg("path", {
              class: `gh-bar gh-${kind.key}`,
              d: `M${x},${bottom}V${segmentTop + radius}Q${x},${segmentTop} ${x + radius},${segmentTop}H${x + barWidth - radius}Q${x + barWidth},${segmentTop} ${x + barWidth},${segmentTop + radius}V${bottom}Z`,
            }),
          );
        }
        base = top;
      });

      const hit = svg("rect", {
        x: index * slot,
        y: 0,
        width: slot,
        height: plotHeight,
        class: "gh-hit",
      });
      const parts = present.map((kind) => count(week[kind.key], kind));
      const text = `Week of ${fmtDate(week.w)}: ${parts.length ? parts.join(", ") : "no activity"}`;
      hit.addEventListener("mousemove", (event) => {
        hit.classList.add("on");
        showTip(event, text);
      });
      hit.addEventListener("mouseleave", () => {
        hit.classList.remove("on");
        hideTip();
      });
      root.append(hit);

      if (axis) {
        const previous = weeks[index - 1];
        if (!previous || fmtMonth(previous.w) !== fmtMonth(week.w)) {
          const textNode = svg("text", {
            x,
            y: height - 4,
            class: "gh-axis",
          });
          textNode.textContent = fmtMonth(week.w);
          root.append(textNode);
        }
      }
    });
    return root;
  }

  function legend() {
    return el(
      "div",
      { class: "gh-legend" },
      KINDS.map((kind) =>
        el("span", { class: "gh-legend-item" }, [
          el("span", { class: `gh-swatch gh-${kind.key}` }),
          kind.many,
        ]),
      ),
    );
  }

  function activityCard(person, rank, grandTotal, yMax, startIndex) {
    const meta = KINDS.filter((kind) => person[kind.key] > 0).map((kind) =>
      count(person[kind.key], kind),
    );
    const share = grandTotal ? (person.total / grandTotal) * 100 : 0;
    const shareBar = el(
      "div",
      { class: "gh-share", title: `${share.toFixed(0)}% of all activity` },
      [el("span", { class: "gh-share-fill" })],
    );
    shareBar.firstChild.style.width = `${share}%`;
    return el("li", { class: "gh-card" }, [
      el("span", { class: "gh-rank", text: `#${rank}` }),
      el("div", { class: "gh-person" }, [
        el("img", {
          src: person.avatar_url,
          alt: "",
          class: "gh-avatar",
          loading: "lazy",
        }),
        el("div", { class: "gh-who" }, [
          el("a", {
            href: person.homepage_url,
            target: "_blank",
            rel: "noopener",
            class: "gh-name",
            text: person.name,
          }),
          el("a", {
            href: person.profile_url,
            target: "_blank",
            rel: "noopener",
            class: "gh-login",
            text: `@${person.login}`,
          }),
        ]),
        el("div", { class: "gh-meta", text: meta.join("  ·  ") }),
      ]),
      shareBar,
      weeklyChart(person.weeks.slice(startIndex), yMax, {
        height: 56,
        axis: false,
        label: `Weekly activity by ${person.name}`,
      }),
    ]);
  }

  function renderTodos(data) {
    const board = document.getElementById("todo-board");
    if (!board) return;
    board.replaceChildren();
    board.setAttribute("aria-busy", "false");

    if (!data.todos.length) {
      board.append(el("p", { class: "data-status", text: "No open statements." }));
      return;
    }

    const list = el("ol", { class: "todo-list" });
    data.todos.forEach((todo) => {
      const actions = [
        el("a", {
          href: todo.source_url,
          target: "_blank",
          rel: "noopener",
          text: "View source",
        }),
      ];
      if (todo.issue_url) {
        actions.push(
          el("a", {
            href: todo.issue_url,
            target: "_blank",
            rel: "noopener",
            text: "Open issue",
          }),
        );
      }
      list.append(
        el("li", { class: "todo-item" }, [
          el("div", { class: "todo-title" }, [
            el("h3", {}, [
              el("a", {
                href: todo.source_url,
                target: "_blank",
                rel: "noopener",
                text: todo.name,
              }),
            ]),
            el("span", { class: "tag", text: todo.module }),
          ]),
          el("p", { text: todo.summary }),
          el("div", { class: "todo-actions" }, actions),
          el("details", { class: "todo-statement" }, [
            el("summary", { text: "Statement" }),
            el("code", { text: todo.statement }),
          ]),
        ]),
      );
    });
    board.append(
      el("div", { class: "data-summary" }, [
        el("span", {
          text: `${data.todos.length} open statement${data.todos.length === 1 ? "" : "s"}`,
        }),
        el("span", { text: `Updated ${fmtUpdated(data.generated_at)}` }),
      ]),
      list,
    );
  }

  function renderActivity(data) {
    const board = document.getElementById("activity-board");
    if (!board) return;
    board.replaceChildren();
    board.setAttribute("aria-busy", "false");
    const activity = data.activity;
    const rows = activity.people;
    if (!rows.length) {
      board.append(
        el("p", { class: "data-status", text: "No activity in this period." }),
      );
      return;
    }

    const combined = activity.week_starts.map((week, index) => ({
      w: week,
      commits: rows.reduce(
        (sum, person) => sum + person.weeks[index].commits,
        0,
      ),
      comments: rows.reduce(
        (sum, person) => sum + person.weeks[index].comments,
        0,
      ),
      opened: rows.reduce(
        (sum, person) => sum + person.weeks[index].opened,
        0,
      ),
    }));
    const firstActiveWeek = combined.findIndex((week) => weekTotal(week) > 0);
    const startIndex = firstActiveWeek > 0 ? firstActiveWeek - 1 : 0;
    const visibleCombined = combined.slice(startIndex);
    const combinedMax = Math.max(1, ...visibleCombined.map(weekTotal));
    const personMax = Math.max(
      1,
      ...rows.flatMap((person) => person.weeks.slice(startIndex).map(weekTotal)),
    );
    const grandTotal = rows.reduce((sum, person) => sum + person.total, 0);
    const cards = el("ol", { class: "gh-cards" });
    rows.forEach((person, index) => {
      cards.append(
        activityCard(person, index + 1, grandTotal, personMax, startIndex),
      );
    });

    board.append(
      el("div", { class: "data-summary" }, [
        el("span", { text: `${rows.length} contributors` }),
        el("span", { text: `Updated ${fmtUpdated(data.generated_at)}` }),
      ]),
      el("div", { class: "gh-view" }, [
        el("div", { class: "gh-overview" }, [
          el("div", { class: "gh-overview-head" }, [
            el("div", { class: "gh-overview-title", text: "Activity per week" }),
            legend(),
          ]),
          weeklyChart(visibleCombined, combinedMax, {
            height: 120,
            axis: true,
            label: `Weekly activity in ${activity.repository}`,
          }),
        ]),
        cards,
      ]),
    );
  }

  function showError(boardId) {
    const board = document.getElementById(boardId);
    if (!board) return;
    board.setAttribute("aria-busy", "false");
    board.replaceChildren(
      el("p", {
        class: "data-status",
        text: "The latest snapshot is temporarily unavailable.",
      }),
    );
  }

  fetch(DATA_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`snapshot ${response.status}`);
      return response.json();
    })
    .then((data) => {
      renderTodos(data);
      renderActivity(data);
    })
    .catch(() => {
      showError("todo-board");
      showError("activity-board");
    });
})();
