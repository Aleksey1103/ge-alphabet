---
name: new-screen
description:
  Create a new screen for this app from its description in SPEC.md. If SPEC.md
  doesn't describe the screen yet, work the description out with the user in
  conversation and add it to SPEC.md first. Then plan the work in plan mode, and
  only after the plan is approved build the screen in its own folder with tests
  and run lint, tests and build. Use this skill whenever the user asks to
  create, add, build, implement or scaffold a screen, page or view, for example
  "add the settings screen", "implement screen 5.2", "make a stats page" or
  "build the new screen from the spec", even if they don't mention SPEC.md or
  plan mode.
---

# New screen

SPEC.md is the source of truth for what the app does, so a screen is built from
its section in SPEC.md and not from a one-line request. When that section is
missing or incomplete, write it with the user first, so the code and the spec
can't drift apart. Then plan the work in plan mode and get it approved before
any code changes. A new screen usually affects navigation, session state and
existing tests across the app, and the user should agree on that before it's
built.

## 1. Find the screen in SPEC.md

Read all of SPEC.md, not just the screens section. Each screen has a
`### 5.x. <Name> Screen` section under "5. Application Screens". A screen also
affects the session rules, error handling, the test list and the definition of
done.

Also look in `src/screens/` and `src/App.tsx`. If the screen already exists in
the code, this isn't a creation task. Tell the user, and ask whether they want
the existing screen changed to match the spec.

The description is complete when it answers these questions:

- What is the screen for? Which screens lead to it, and where can the user go
  from it? Cover every way in and out.
- What does it display?
- What does every control do, including disabled, empty and error states?
- What data does it read or change, and how does that affect other screens (for
  example, which letters a session contains)?

If it answers all of them, go to step 3. If the section is missing or leaves a
question open, go to step 2. Don't fill gaps with guesses. AGENTS.md asks you to
ask instead, and a guess written into the spec becomes product behavior.

## 2. Write the description with the user

Tell the user that the screen isn't described yet, or which parts are missing.
Then work the description out with them in conversation:

1. Ask them to describe the screen in their own words: what it's for, what it
   shows, what the user does there and where it leads. Don't ask again about
   anything they've already told you.
2. Check their answer against the questions in step 1 and against the rest of
   the spec. Ask about anything missing or conflicting, a few questions at a
   time. When the answer is a choice between concrete options, ask with
   AskUserQuestion: put your recommended option first, and add an ASCII mockup
   as a preview when the options differ in layout. Ask open questions in plain
   text. Watch for:
   - conflicts with existing rules, such as a screen that changes the session
     size while the spec says every session has all 33 letters
   - inconsistent data lists (overlaps, duplicates, a missing comma). Check them
     with a short script, not by eye.
   - Georgian facts you can't verify, such as letter names or sounds. Flag them,
     and don't guess.
3. When nothing essential is still open, edit SPEC.md:
   - Add a `### 5.x. <Name> Screen` section in the style of the existing ones: a
     short purpose line, a "Display:" list, bold subheadings for parts with
     their own rules, and example UI text written as `such as "…"`.
   - Place it where it comes in the user's path through the app, and renumber
     the sections after it.
   - Update everything else the screen changes: the screen count and order at
     the top of section 5, the screens that lead to it or from it, the session
     and data rules, error handling, the test list under "Testing Requirements",
     and "Definition of Done".
   - Run `npx prettier --write SPEC.md`.
4. Tell the user what you added, section by section. List every choice they
   didn't make themselves, so they can correct it. Then go on to step 3. The
   plan review is their next checkpoint.

## 3. Plan in plan mode

Enter plan mode with the EnterPlanMode tool. If it's listed only as a deferred
tool, load it with ToolSearch first. If you're already in plan mode, continue.

Explore the code the screen will touch, then write a plan with these parts:

- **Spec**: the SPEC.md sections it implements.
- **Navigation**: how `App.tsx` reaches the screen. Today `App.tsx` picks the
  screen from `state.phase` of `useTrainingSession`. Say whether the screen
  needs a new phase, its own app-level state or a reducer change, and keep the
  transitions explicit (SPEC section 10).
- **Logic**: new or changed `.ts` modules in `state/`, `utils/`, `data/` or
  `hooks/`, each with its tests. Keeping logic out of components lets it be
  tested without rendering.
- **UI**: the screen folder `src/screens/<Name>Screen/` (`<Name>Screen.tsx`,
  `index.ts`, `<Name>Screen.test.tsx`), the existing components it reuses
  (`Screen`, `ScreenHeading`, `PrimaryButton` and others), and any new
  components, each in its own `src/components/<Name>/` folder.
- **Tests**: which spec test items each new test covers, and which existing
  tests change, such as the user flow in `App.test.tsx`.
- **Open questions**: anything the spec still doesn't settle. Ask them with
  AskUserQuestion before you finish the plan.

Call ExitPlanMode to get the user's approval. If they ask for changes, revise
the plan and ask again.

## 4. Build it

Follow the approved plan and AGENTS.md. These conventions apply to screens in
this repo:

- Each screen has its own folder. Its `index.ts` holds one line,
  `export {default} from './<Name>Screen.tsx';`. Other modules import the screen
  through that file, with the extension:
  `import SettingsScreen from './screens/SettingsScreen/index.ts'`.
- Write `export default function <Name>Screen(...)` with a
  `type <Name>ScreenProps` above it. `App.tsx` owns the state and passes the
  screen the data and callbacks it needs as props.
- Wrap the content in `Screen` (the `<main>`, which scrolls when the content
  doesn't fit) and give it a title with `ScreenHeading` (the heading takes focus
  so screen readers announce the new screen). Put bottom actions in an `mt-auto`
  block, as `HomeScreen` and `ResultsScreen` do.
- Read letters from the data modules and never hard-code them. Put `lang="ka"`
  on Georgian text.
- Use only theme tokens, and never give one element two utilities for the same
  property.

Write the tests along with the code, not after it.

## 5. Check and report

Run `npm run lint`, `npm test`, `npm run build`, and `npx prettier --check` on
the files you changed. Fix whatever your changes broke, without disabling rules
or skipping tests.

In the report, give what AGENTS.md asks for: the checks you ran and their
results, any missing assets, and anything left incomplete. Also say where the
build differs from the approved plan, if it does. Don't commit unless the user
asks. When they do, use the `commit` skill.
