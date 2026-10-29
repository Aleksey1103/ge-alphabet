@AGENTS.md

## Skills

Before starting a task, check the table below and the available skills. If one
fits, invoke it with the Skill tool and follow its instructions rather than
improvising.

| Skill        | Triggers                                                                                                                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `commit`     | Every time you're about to run `git commit`. Also whenever the user says "commit", "commit changes", "commit this", "make a commit", "save this to git", "checkpoint my work" or "write a commit message", or asks to split, reword or amend a commit. |
| `new-screen` | Whenever the user asks to create, add, build or implement a screen, page or view, such as "add the settings screen" or "implement screen 5.2".                                                                                                         |

Project-specific skills go in `.claude/skills/`. When a workflow keeps repeating
here (e.g. adding letters or a new exercise type), suggest turning it into a
skill and add a row for it to the table.
