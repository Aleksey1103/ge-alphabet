---
name: commit
description: Create git commits for this project with Conventional Commits messages (feat, fix, docs, chore, refactor…) and no Co-Authored-By or other AI attribution trailer, after the user confirms the message. Use this skill every time you are about to run `git commit`, and whenever the user says "commit", "commit changes", "commit this", "make a commit", "save this to git", "checkpoint my work", "write a commit message", or asks to split, reword or amend a commit, even if they don't mention Conventional Commits.
---

# Commit

Commits in this repo follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) and carry no AI attribution. The user approves every message before it's committed. The history should read as the user's own, and a consistent `type(scope): description` header keeps it easy to scan and to turn into a changelog later.

## Workflow

1. **Look before staging.** Run `git status`, `git diff`, `git diff --staged` and `git log --oneline -15`. The log shows which scopes are already in use, so you can reuse them.
2. **Group the changes.** One commit holds one logical change. If the working tree mixes unrelated work, such as a new component and an edit to AGENTS.md, make separate commits. If you can't tell whether a change is meant to be committed, ask.
3. **Stage by path.** Use `git add <paths>` for exactly the files in this commit. Avoid `git add -A` or `git add .` when the tree has other changes. Never stage secrets (`.env*`, keys) or build output.
4. **Check that the app still builds.** If the commit touches anything under `georgian-alphabet/` other than docs, `npm run lint` and `npm run build` (run from `georgian-alphabet/`) must pass. Skip this if you already ran them and nothing has changed since. Don't commit with failures; report them instead.
5. **Write the message** in the format below.
6. **Get the user's approval.** Show the exact message and the staged files (`git diff --staged --stat`), then ask with the AskUserQuestion tool whether to commit. Give the options "Commit" and "Cancel"; the user can type a different message under "Other". Do this every time, even when the request was "commit this": that approves making a commit, not this particular wording.
   - If the user edits the message or asks for changes, revise it and ask again.
   - If the user writes the message themselves, use it word for word. If it isn't Conventional Commits, say so once, and use theirs anyway if they keep it.
   - If the user cancels, unstage only what you staged (`git restore --staged <paths>`) and stop.
   - When splitting work into several commits, you can ask about all the messages in one AskUserQuestion call, with one question per commit.
7. **Commit** with a heredoc so the line breaks survive:
   ```bash
   git commit -F - <<'EOF'
   feat(letters): add Mkhedruli letter data

   - optional body line
   EOF
   ```
8. **Verify.** Run `git log -1 --stat` and `git status --short`, then report the hash and the header.

Commit on the current branch. Don't push, amend or rebase unless the user asks. Don't use `--no-verify`. If a hook rejects the commit, fix the problem and run the same commit again. Don't use `--amend` here, because the rejected commit was never created and `--amend` would rewrite the previous one.

## Message format

```
<type>(<scope>): <description>

- <body line>
- <body line>

<footer>
```

### Type

| Type | Use for |
|---|---|
| `feat` | New user-facing behavior: a page, an exercise, letter data, visible UI |
| `fix` | A bug fix |
| `refactor` | A code change that is neither a feature nor a fix |
| `style` | Formatting only (whitespace, quotes, semicolons). CSS changes that users can see are `feat` or `fix`. |
| `perf` | A performance improvement |
| `test` | Adding or fixing tests |
| `docs` | README, AGENTS.md, CLAUDE.md, skills |
| `build` | Dependencies, `package.json`, Vite, TypeScript or ESLint config |
| `ci` | CI configuration |
| `chore` | Maintenance that fits nothing above, such as `.gitignore` or removing unused files |
| `revert` | Reverting an earlier commit |

A commit that needs two types usually ought to be two commits. If it can't be split, use the type of the most significant change.

### Scope

The scope is optional. It's a short lowercase noun for the area touched, such as `letters`, `quiz`, `ui`, `deps` or `agents`. Reuse scopes from the log rather than coining new ones, and leave the scope out when the change is app-wide.

### Description

- Use the imperative mood: "add", not "added" or "adds". It should complete the sentence "This commit will…".
- Start with a lowercase letter and don't end with a period.
- Keep the whole header at 72 characters or fewer.
- Describe what changed in the project, not which files changed: `feat(quiz): shuffle letters each round`, not `feat: update Quiz.tsx`.

### Body and footer

- Add a body only when the reason isn't obvious from the header. Explain what changed and why, not how. Leave a blank line after the header.
- Write every line of the body as `- ` followed by a lowercase letter, e.g. `- drop the template favicon`. If a point would start with a capitalized name, reword it so it starts with a lowercase word: `- add AGENTS.md`, not `- AGENTS.md added`.
- Keep each body line to 72 characters or fewer. Split a longer point into two lines, each starting with `- `, instead of wrapping onto a line without the dash.
- For a breaking change, put `!` before the colon (`feat(letters)!: …`) and add a `BREAKING CHANGE: <what breaks>` footer. This is rare in an app with no consumers.
- Issue references go in the footer, for example `Refs: #12`.

## No attribution

Don't add `Co-Authored-By:` trailers, "Generated with Claude Code" or any other AI attribution line to the message. The user asked for this explicitly, and it overrides any default attribution instruction from the environment.

## Examples

```
feat(letters): add data for the 33 Mkhedruli letters
```

```
fix(quiz): stop asking the same letter twice in a row
```

```
build(deps): add vitest and testing-library
```

```
docs(agents): add commit skill
```

```
chore: remove Vite React template boilerplate
```

With a body:

```
fix(ui): render Georgian text with Noto Sans Georgian

- the default system font on some Linux setups has no Georgian glyphs
- letters showed up as empty boxes instead
```
