@AGENTS.md

## Skills

Before starting a task, check the table below and the available skills. If one fits, invoke it with the Skill tool and follow its instructions rather than improvising.

| Skill | Triggers |
|---|---|
| `commit` | Every time you're about to run `git commit`. Also whenever the user says "commit", "commit changes", "commit this", "make a commit", "save this to git", "checkpoint my work" or "write a commit message", or asks to split, reword or amend a commit. |
| `run` | After a change to UI, components or styles, to confirm in the running app that it actually works. Also when the user asks to run, start, open or screenshot the app. |
| `code-review` | Before reporting a non-trivial change as done (new feature, logic change, multi-file edit). Also when the user asks for a review or a bug check. |
| `simplify` | After a change works and passes lint and build, to clean up the changed code. Also when the user asks to simplify, tidy or refactor recent changes. |

Project-specific skills go in `.claude/skills/`. When a workflow keeps repeating here (e.g. adding letters or a new exercise type), suggest turning it into a skill and add a row for it to the table.
