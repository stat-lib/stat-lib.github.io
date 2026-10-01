#!/usr/bin/env python3
"""Build the cached data used by the Statlib homepage.

TODOs are extracted from structured Lean comments. Community activity is fetched only by the
scheduled GitHub Action, never by a visitor's browser.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "data" / "homepage.json"
REPOSITORY = "stat-lib/statlib"
HIDDEN_ACCOUNTS = {"formal-stat"}
PEOPLE = {
    "RemyDegenne": ("Rémy Degenne", "https://remydegenne.github.io/"),
    "zixiaowang17": ("Zixiao Jolene Wang", "https://zixiaowang17.github.io/"),
    "bocowgill": ("Bo Cowgill", "http://bocowgill.com"),
    "rajarshi-mukherjee24": (
        "Rajarshi Mukherjee",
        "https://rajarshi-mukherjee24.github.io/",
    ),
    "CoolRmal": ("Yongxi (Aaron) Lin", "https://coolrmal.github.io/"),
    "richardkwo": ("Richard Guo", "https://unbiased.co.in"),
    "qingyuanzhao": ("Qingyuan Zhao", "http://www.statslab.cam.ac.uk/~qz280/"),
    "bjoernkjoshanssen": (
        "Bjørn Kjos-Hanssen",
        "http://math.hawaii.edu/wordpress/bjoern/",
    ),
}
TODO_BLOCK = re.compile(r"/-\s*TODO(?:\((#\d+)\))?:\s*(.*?)-/", re.DOTALL)
DECLARATION = re.compile(
    r"(?m)^\s*(theorem|lemma|def|instance)\s+([A-Za-z0-9_'.]+)"
)


def git_output(repo: Path, *args: str) -> str:
    process = subprocess.run(
        ["git", "-C", str(repo), *args],
        check=True,
        capture_output=True,
        text=True,
    )
    return process.stdout.strip()


def one_line(text: str) -> str:
    return " ".join(text.split())


def extract_todos(statlib_root: Path) -> tuple[str, list[dict[str, Any]]]:
    sha = git_output(statlib_root, "rev-parse", "HEAD")
    source_root = statlib_root / "Statlib"
    if not source_root.is_dir():
        raise ValueError(f"{source_root} does not exist")

    todos: list[dict[str, Any]] = []
    for path in sorted(source_root.rglob("*.lean")):
        text = path.read_text(encoding="utf-8")
        relative = path.relative_to(statlib_root).as_posix()
        module = relative.removesuffix(".lean").replace("/", ".")
        for block in TODO_BLOCK.finditer(text):
            body = block.group(2).strip()
            declaration = DECLARATION.search(body)
            if declaration is None:
                continue
            line = text.count("\n", 0, block.start()) + 1
            description = one_line(body[: declaration.start()].strip())
            statement = one_line(body[declaration.start() :].strip())
            issue = block.group(1)
            item = {
                "name": declaration.group(2),
                "kind": declaration.group(1),
                "module": module,
                "summary": description,
                "statement": statement,
                "source_url": (
                    f"https://github.com/{REPOSITORY}/blob/{sha}/{relative}#L{line}"
                ),
            }
            if issue:
                number = issue.removeprefix("#")
                item["issue_url"] = (
                    f"https://github.com/{REPOSITORY}/issues/{number}"
                )
            todos.append(item)
    return sha, todos


def github_token() -> str | None:
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if token:
        return token
    try:
        process = subprocess.run(
            ["gh", "auth", "token"],
            check=True,
            capture_output=True,
            text=True,
        )
    except (FileNotFoundError, subprocess.CalledProcessError):
        return None
    return process.stdout.strip() or None


def github_get(path: str, token: str | None) -> tuple[Any, dict[str, str]]:
    request = urllib.request.Request(
        f"https://api.github.com{path}",
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "statlib-homepage-data",
            **({"Authorization": f"Bearer {token}"} if token else {}),
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response), dict(response.headers.items())
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GitHub API returned {error.code}: {detail}") from error


def github_pages(
    endpoint: str,
    token: str | None,
    params: dict[str, str],
    max_pages: int = 10,
) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for page in range(1, max_pages + 1):
        query = urllib.parse.urlencode({**params, "per_page": "100", "page": str(page)})
        payload, _ = github_get(f"{endpoint}?{query}", token)
        if not isinstance(payload, list):
            raise RuntimeError(f"Expected a list from {endpoint}")
        items.extend(payload)
        if len(payload) < 100:
            break
    return items


def week_start(value: datetime) -> int:
    value = value.astimezone(timezone.utc)
    value = value.replace(hour=0, minute=0, second=0, microsecond=0)
    days_since_sunday = (value.weekday() + 1) % 7
    return int((value - timedelta(days=days_since_sunday)).timestamp())


def parse_time(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def is_person(user: dict[str, Any] | None) -> bool:
    if not user or not user.get("login"):
        return False
    login = user["login"]
    return (
        user.get("type") != "Bot"
        and not login.endswith("[bot]")
        and login not in HIDDEN_ACCOUNTS
    )


def build_activity(now: datetime) -> dict[str, Any]:
    token = github_token()
    current_week = week_start(now)
    week_starts = [
        current_week - (51 - index) * 7 * 24 * 3600 for index in range(52)
    ]
    cutoff = datetime.fromtimestamp(week_starts[0], timezone.utc)
    cutoff_iso = cutoff.isoformat().replace("+00:00", "Z")

    commits = github_pages(
        f"/repos/{REPOSITORY}/commits",
        token,
        {"since": cutoff_iso},
    )
    comments = github_pages(
        f"/repos/{REPOSITORY}/issues/comments",
        token,
        {"since": cutoff_iso},
    )
    issues = github_pages(
        f"/repos/{REPOSITORY}/issues",
        token,
        {"state": "all"},
    )

    index = {value: position for position, value in enumerate(week_starts)}
    people: dict[str, dict[str, Any]] = {}

    def row(user: dict[str, Any]) -> dict[str, Any]:
        login = user["login"]
        if login not in people:
            display_name, homepage = PEOPLE.get(login, (login, user["html_url"]))
            people[login] = {
                "login": login,
                "name": display_name,
                "profile_url": user["html_url"],
                "homepage_url": homepage,
                "avatar_url": user["avatar_url"],
                "commits": 0,
                "comments": 0,
                "opened": 0,
                "weeks": [
                    {"w": value, "commits": 0, "comments": 0, "opened": 0}
                    for value in week_starts
                ],
            }
        return people[login]

    def add(user: dict[str, Any] | None, kind: str, created_at: str) -> None:
        if not is_person(user):
            return
        position = index.get(week_start(parse_time(created_at)))
        if position is None:
            return
        person = row(user)
        person[kind] += 1
        person["weeks"][position][kind] += 1

    for commit in commits:
        created_at = commit.get("commit", {}).get("author", {}).get("date")
        if created_at:
            add(commit.get("author"), "commits", created_at)
    for comment in comments:
        add(comment.get("user"), "comments", comment["created_at"])
    for issue in issues:
        if parse_time(issue["created_at"]) >= cutoff:
            add(issue.get("user"), "opened", issue["created_at"])

    rows = list(people.values())
    for person in rows:
        person["total"] = person["commits"] + person["comments"] + person["opened"]
    rows.sort(key=lambda person: (-person["total"], person["login"].lower()))
    return {
        "repository": REPOSITORY,
        "window": "52 weeks",
        "week_starts": week_starts,
        "people": rows,
    }


def validate(payload: Any) -> None:
    if not isinstance(payload, dict):
        raise ValueError("homepage data must be an object")
    required = {"generated_at", "statlib_sha", "todos", "activity"}
    missing = required.difference(payload)
    if missing:
        raise ValueError(f"homepage data is missing: {', '.join(sorted(missing))}")
    if not isinstance(payload["todos"], list):
        raise ValueError("todos must be a list")
    for todo in payload["todos"]:
        for key in ("name", "kind", "module", "summary", "source_url"):
            if not isinstance(todo.get(key), str) or not todo[key]:
                raise ValueError(f"invalid TODO field {key}")
    activity = payload["activity"]
    if not isinstance(activity, dict) or not isinstance(activity.get("people"), list):
        raise ValueError("activity.people must be a list")
    if len(activity.get("week_starts", [])) != 52:
        raise ValueError("activity must contain 52 week starts")


def read_existing(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    payload = json.loads(path.read_text(encoding="utf-8"))
    validate(payload)
    return payload


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--statlib-root", type=Path)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--refresh-activity", action="store_true")
    parser.add_argument("--validate-only", action="store_true")
    args = parser.parse_args()

    existing = read_existing(args.output)
    if args.validate_only:
        if existing is None:
            raise ValueError(f"{args.output} does not exist")
        return
    if args.statlib_root is None:
        parser.error("--statlib-root is required unless --validate-only is used")

    statlib_root = args.statlib_root.resolve()
    sha, todos = extract_todos(statlib_root)
    if args.refresh_activity:
        try:
            activity = build_activity(datetime.now(timezone.utc))
        except (OSError, RuntimeError, ValueError) as error:
            if existing is None:
                raise
            print(f"Keeping the previous activity snapshot: {error}")
            activity = existing["activity"]
    elif existing is not None:
        activity = existing["activity"]
    else:
        raise ValueError("an initial activity snapshot requires --refresh-activity")

    content = {"statlib_sha": sha, "todos": todos, "activity": activity}
    previous_content = (
        {key: existing[key] for key in content} if existing is not None else None
    )
    generated_at = (
        existing["generated_at"]
        if previous_content == content
        else datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    )
    payload = {"generated_at": generated_at, **content}
    validate(payload)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
