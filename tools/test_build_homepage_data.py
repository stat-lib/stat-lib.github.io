from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import build_homepage_data


class ExtractTodosTest(unittest.TestCase):
    def test_extracts_only_structured_todo_declarations(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "Statlib" / "Topic" / "Def.lean"
            source.parent.mkdir(parents=True)
            source.write_text(
                """+/-!
The word TODO in prose is not a task.
-/

-- TODO: an ordinary implementation note

/- TODO(#42): Prove the planned result.
theorem Topic.planned_result (p : Prop) : p → p
-/
""",
                encoding="utf-8",
            )
            with patch.object(build_homepage_data, "git_output", return_value="abc123"):
                sha, todos = build_homepage_data.extract_todos(root)

        self.assertEqual(sha, "abc123")
        self.assertEqual(len(todos), 1)
        self.assertEqual(todos[0]["name"], "Topic.planned_result")
        self.assertEqual(todos[0]["module"], "Statlib.Topic.Def")
        self.assertEqual(todos[0]["summary"], "Prove the planned result.")
        self.assertEqual(
            todos[0]["issue_url"],
            "https://github.com/stat-lib/statlib/issues/42",
        )


if __name__ == "__main__":
    unittest.main()
