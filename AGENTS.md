# Agent rules

A React app for learning the Georgian alphabet (Mkhedruli script).

## Requirements

- `SPEC.md` at the repo root is the source of truth for product behavior and
  acceptance criteria. Follow it.
- If requirements conflict, or an essential detail is missing or ambiguous, ask
  before building it. Don't invent important behavior.
- Inspect the existing code before changing it. Reuse what's there and preserve
  code that already works.
- Build working features, not UI mockups.

## Layout

- The Vite app lives at the repo root; run every npm command from here.
- Entry point: `src/main.tsx` → `src/App.tsx`. Global styles and the Tailwind
  theme (`@theme`): `src/index.css`.
- Audio files go in `src/assets/audio/`, one mp3 per letter named by the
  Georgian letter itself (`ა.mp3` … `ჰ.mp3`). Never use URL-encoded names like
  `%E1%83%90.mp3`, because the dev server decodes them and can't find the file.
- Import audio (`import url from './assets/audio/ა.mp3'`, or `import.meta.glob`
  for the whole set) rather than referencing it by path, so Vite fingerprints
  the files and the build includes only what's used.

## Stack

- React 19, TypeScript 6, Vite 8, ESLint 10 (flat config).
- Package manager is npm. Don't use yarn or pnpm, and don't commit other
  lockfiles.
- Tests use Vitest with jsdom and React Testing Library
  (`@testing-library/react`, `@testing-library/dom`). Test setup and shared
  helpers live in `src/test/`.
- Styling uses Tailwind CSS v4 (`tailwindcss` + `@tailwindcss/vite`). Don't add
  CSS Modules or per-component stylesheets.
- The letter picker uses Embla Carousel (`embla-carousel-react`), following
  Embla's iOS picker example.
- There is no router or state library. Avoid unnecessary dependencies, and ask
  before adding any new one.

## Commands

- `npm run dev`: start the dev server
- `npm run build`: type-check (`tsc -b`), then run the production build
- `npm run lint`: run ESLint
- `npm test`: run the Vitest tests once (`npm run test:watch` to keep watching)

## Before finishing a task

- Training and scoring logic must have tests. Write or update them along with
  the logic.
- `npm run lint`, `npm test` and `npm run build` must all pass.
- Fix errors your changes introduce. Don't hide them by disabling lint rules,
  adding `@ts-ignore`/`@ts-expect-error`, using `any` or skipping tests.
- In your final report, state clearly:
  - which checks you ran and their results
  - any missing assets, such as a letter without an audio file
  - any feature left incomplete

## TypeScript and React

- TypeScript strict mode is on (TypeScript 6 enables it by default). Don't turn
  off `strict` or any of its flags.
- Keep the code modular. Put training, scoring and other logic in plain `.ts`
  modules, separate from components, so it can be tested without rendering.
- Use function components and hooks only.
- Put one component per file, with a PascalCase filename that matches the
  component.
- Type props explicitly, with no `any`.
- Use `import type` for type-only imports (`verbatimModuleSyntax` is on).
- Don't use `enum`, `namespace` or constructor parameter properties
  (`erasableSyntaxOnly` is on). Use union types or `as const` objects instead.
- Import local modules with their file extension, as the existing code does:
  `import App from './App.tsx'`.
- A `.tsx` file that exports components should export nothing else
  (react-refresh lint rule). Shared constants and helpers belong in `.ts` files.

## UI

- Design mobile-first. Center the app in a container with a maximum width of
  about 430px, and make sure it works on narrow phone screens.
- Style with the theme tokens from `src/index.css` (`bg-surface`, `text-muted`,
  `gap-gutter`, `min-h-button`…). The default Tailwind palette is turned off, so
  color utilities only accept theme colors.
- There's no `tailwind-merge`, so `cx()` doesn't resolve conflicts. Never give
  one element two utilities for the same property (e.g. `bg-surface` and
  `bg-accent`), because the generated CSS order decides which wins, not the
  class order. That includes classes a parent passes in: a component's
  `className` prop may only carry properties the component doesn't set itself,
  and its doc comment says which. Anything that would collide becomes a prop
  instead (like `PrimaryButton`'s `variant` and `compact`).

## Georgian content and audio

- Keep letter data (character, name, transliteration, pronunciation) in a single
  typed data module. Components read from it and never hard-code letters.
- Use real Unicode Mkhedruli characters. The 33 modern letters are U+10D0–U+10F0
  (ა–ჰ). Archaic letters (U+10F1 onward) are excluded unless a task asks for
  them.
- Transliteration follows Georgia's 2002 national romanization system.
- Never invent linguistic facts. If you're unsure of a letter's name, sound or
  example word, flag it instead of guessing.
- Put `lang="ka"` on elements that contain Georgian text, and make sure the font
  stack includes a font that covers Georgian.
- Don't apply `text-transform: uppercase` (including Tailwind's `uppercase`
  class) or `.toUpperCase()` to Georgian text. Unicode maps Mkhedruli to
  Mtavruli capitals, which many fonts can't render.
- Play the real audio files from `src/assets/audio/`. Never replace them with
  placeholders, speech synthesis or generated tones. If a letter's file is
  missing, report it rather than faking the sound.

## Git

- Commit only when asked.
- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  messages: `type(scope): description`, e.g.
  `feat(letters): add Mkhedruli letter data`.
- Don't add `Co-Authored-By` or other AI attribution lines to commit messages.
