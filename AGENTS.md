# Agent rules

A React app for learning the Georgian alphabet (Mkhedruli script).

## Layout

- The Vite app lives at the repo root; run every npm command from here.
- Entry point: `src/main.tsx` → `src/App.tsx`. Global styles: `src/index.css`.
- Audio files go in `src/assets/audio/`, one mp3 per letter named by the Georgian letter itself (`ა.mp3` … `ჰ.mp3`). Never use URL-encoded names like `%E1%83%90.mp3`, because the dev server decodes them and can't find the file.
- Import audio (`import url from './assets/audio/ა.mp3'`, or `import.meta.glob` for the whole set) rather than referencing it by path, so Vite fingerprints the files and the build includes only what's used.

## Stack

- React 19, TypeScript 6, Vite 8, ESLint 10 (flat config).
- Package manager is npm. Don't use yarn or pnpm, and don't commit other lockfiles.
- There is no router, state library, CSS framework or test runner yet. Ask before adding any dependency.

## Commands

- `npm run dev`: start the dev server
- `npm run build`: type-check (`tsc -b`), then build
- `npm run lint`: run ESLint

## Before finishing a task

- `npm run lint` and `npm run build` must both pass.
- Don't make them pass by disabling lint rules, adding `@ts-ignore`/`@ts-expect-error`, or using `any`. Fix the cause, or report the failure.

## TypeScript and React

- Use function components and hooks only.
- Put one component per file, with a PascalCase filename that matches the component.
- Type props explicitly, with no `any`.
- Use `import type` for type-only imports (`verbatimModuleSyntax` is on).
- Don't use `enum`, `namespace` or constructor parameter properties (`erasableSyntaxOnly` is on). Use union types or `as const` objects instead.
- Import local modules with their file extension, as the existing code does: `import App from './App.tsx'`.
- A `.tsx` file that exports components should export nothing else (react-refresh lint rule). Shared constants and helpers belong in `.ts` files.

## Georgian content

- Keep letter data (character, name, transliteration, pronunciation) in a single typed data module. Components read from it and never hard-code letters.
- Use real Unicode Mkhedruli characters. The 33 modern letters are U+10D0–U+10F0 (ა–ჰ). Archaic letters (U+10F1 onward) are excluded unless a task asks for them.
- Transliteration follows Georgia's 2002 national romanization system.
- Never invent linguistic facts. If you're unsure of a letter's name, sound or example word, flag it instead of guessing.
- Put `lang="ka"` on elements that contain Georgian text, and make sure the font stack includes a font that covers Georgian.
- Don't apply `text-transform: uppercase` or `.toUpperCase()` to Georgian text. Unicode maps Mkhedruli to Mtavruli capitals, which many fonts can't render.

## Git

- Commit only when asked.
- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) messages: `type(scope): description`, e.g. `feat(letters): add Mkhedruli letter data`.
- Don't add `Co-Authored-By` or other AI attribution lines to commit messages.
