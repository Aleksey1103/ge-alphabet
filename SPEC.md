# Project: Georgian Alphabet Learning App

## 1. Role and Objective

Act as a senior React developer and UI/UX designer. Build a complete,
functional, mobile-first web application for learning the Georgian alphabet
through audio recognition exercises.

The application should help users learn to associate the sounds of Georgian
letters with their written forms.

Do not create just a prototype or static mockup. Implement the complete training
flow, audio playback, letter selection, scoring system, and session management.

## 2. Technology Stack

Use the following technologies:

- React
- TypeScript
- Vite
- Tailwind CSS v4, integrated with the official `@tailwindcss/vite` plugin
- Embla Carousel (`embla-carousel-react`) for the letter picker
- React Hooks for state management

Style components with Tailwind utility classes. Do not use CSS Modules or
per-component stylesheets. Keep custom CSS in the single global stylesheet,
limited to what utilities cannot express cleanly, such as theme tokens, base
element styles, and keyframes.

Keep the architecture simple and avoid unnecessary dependencies. Build the
letter picker on Embla Carousel, following its iOS picker example, and do not
add other carousel libraries.

The application must work well on modern mobile browsers, including iOS Safari
and Android Chrome.

## 3. Layout and Responsive Design

Design the application exclusively with a mobile-first approach.

Requirements:

- The main application container must have a maximum width of approximately
  430px.
- On mobile devices, the container must occupy the full available width.
- On larger screens, center the application horizontally and maintain the same
  narrow mobile layout.
- The application must not expand into a desktop dashboard or desktop-specific
  layout.
- Use `100dvh` where appropriate to account for mobile browser viewport
  behavior.
- Prevent unwanted horizontal scrolling.
- Account for device safe areas using `env(safe-area-inset-top)` and
  `env(safe-area-inset-bottom)`.
- Keep primary buttons large enough for comfortable touch interaction, ideally
  at least 48px high.
- Ensure the interface remains usable on small screens.

## 4. Visual Design

Use a dark blue color theme with a modern, minimal, educational aesthetic.

Suggested color palette:

- Main background: `#071426`
- Card and panel background: `#10233F`
- Secondary surface: `#173354`
- Primary accent: `#4F8CFF`
- Success: `#35D39A`
- Error: `#FF647C`
- Primary text: `#F4F7FF`
- Secondary text: `#9FB2CD`

Centralize colors as Tailwind theme variables in an `@theme` block in the global
stylesheet, so the theme can be adjusted in one place and each color is
available both as a utility (such as `bg-surface` or `text-accent`) and as a CSS
variable. Do not hard-code hex values in components, including arbitrary values
such as `bg-[#10233F]`.

Design guidelines:

- Use rounded cards and buttons.
- Use clear visual hierarchy and generous spacing.
- Make Georgian letters the visual focus of the training interface.
- Use subtle transitions and animations.
- Avoid excessive decoration, gradients, and unnecessary UI elements.
- Provide distinct visual states for selected letters, correct answers, and
  incorrect answers.
- Maintain sufficient contrast for accessibility.

## 5. Application Screens

Implement four main screens. The user moves through them in this order: main
screen, settings screen, training screen, results screen.

### 5.1. Main Screen

Display:

- Application title, such as "Learn Georgian".
- A prominent Georgian alphabet visual element.
- A short description explaining that the user will hear sounds and select the
  matching letters.
- A primary button, such as "Get Started".

Clicking the button must navigate to the settings screen.

### 5.2. Settings Screen

The settings screen sets the letters for the next training session.

Display:

- A back button that returns to the main screen. Changes the user hasn't started
  a session with are dropped.
- A title, such as "Choose Letters".
- A select with the letter presets listed below.
- A letter picker with all 33 letters.
- The number of checked letters, such as "5 letters selected".
- A primary "Start Training" button.

**Letter presets**

The select lists these presets in this order:

| Preset              | Letters                                                                   |
| ------------------- | ------------------------------------------------------------------------- |
| All letters         | All 33 letters                                                            |
| Vowels              | ა, ე, ი, ო, უ                                                             |
| Single sound        | ა, ბ, გ, დ, ე, ვ, ზ, ი, ლ, მ, ნ, ო, ჟ, რ, ს, უ, ღ, შ, ძ, ჯ                |
| Familiar P sound    | პ, ფ                                                                      |
| Familiar T sound    | თ, ტ                                                                      |
| Familiar Ch sound   | ჩ, ჭ                                                                      |
| Familiar Tz sound   | ც, წ                                                                      |
| Familiar H sound    | ხ, ჰ                                                                      |
| Familiar K sound    | კ, ქ, ყ                                                                   |
| All familiar sounds | თ, კ, პ, ტ, ფ, ქ, ყ, ჩ, ც, წ, ჭ, ხ, ჰ (the six "Familiar … sound" groups) |
| Custom              | None                                                                      |

"Single sound" and "All familiar sounds" share no letters, and together they
cover all 33.

**Letter picker**

- Display all 33 letters in alphabetical order as a grid of toggle tiles that
  fits the container without horizontal scrolling.
- Tapping a tile checks or unchecks that letter and changes no other letter.
- Make checked tiles clearly distinct, with an icon or other mark as well as
  color, and expose each tile's checked state to screen readers.

**Select and picker behavior**

The picker is the source of truth for the session's letters. The select is a
shortcut for filling the picker.

- Choosing a preset checks exactly its letters and unchecks all others.
- Choosing "Custom" unchecks every letter.
- After every change, the select shows the preset whose letters exactly match
  the checked letters, or "Custom" when none match. Switching to "Custom" this
  way leaves the checked letters as they are.
- The first time the screen opens, "All letters" is selected and all 33 letters
  are checked. Later, the screen opens with the letters of the last started
  session.

**Start button**

- Clicking "Start Training" creates a new training session from the checked
  letters and navigates to the training screen.
- Disable the button when fewer than 2 letters are checked, and show a short
  hint, such as "Choose at least 2 letters".

### 5.3. Training Screen

Divide the available screen height into two vertically stacked sections.

**Upper section: Audio**

- Display the current exercise number out of the session's total, such as
  "Question 3 of 20".
- Display a short instruction, such as "Listen and find the letter".
- Provide a prominent audio playback button.
- Allow the user to replay the current sound as many times as needed.
- Provide a secondary "Slow" button next to the main playback button that plays
  the current sound at half speed (0.5×). The main button always plays at normal
  speed.
- Show a visual indication while audio is playing, on the button that started
  the playback.
- Never automatically play the next sound before the previous exercise has been
  resolved.

The audio button must play the actual audio associated with the current Georgian
letter sound.

**Lower section: Letter Carousel**

- Display the letters in a vertical, iOS-style picker wheel: the letters sit on
  a 3D drum that turns behind a fixed selection band in the middle.
- The wheel offers only the session's letters, in alphabetical order. It must
  work with as few as 2 letters. When there are too few letters to fill the
  drum, repeat them around it so it still loops smoothly. Screen readers
  announce each letter by its position in the session's set, such as "პ, 1 of
  2".
- The wheel loops: after the session's last letter it continues with its first
  letter, in both directions.
- Users spin the wheel by swiping or dragging vertically. It coasts with
  momentum and always stops with one letter in the selection band.
- The letter that stops in the selection band after the user spins the wheel
  becomes the selected letter. Tapping a visible letter, or choosing one with
  the keyboard, turns it into the band and selects it.
- Each exercise, and the second attempt, starts with no selection. The wheel
  stays where it was, and nothing is selected until the user spins it, taps a
  letter or uses the keyboard.
- The rejected first answer cannot be selected on the second attempt. If the
  wheel stops on it, it rolls on to the next letter in the direction it was
  spinning.
- The wheel cannot be spun while feedback is shown. After a failed exercise it
  turns to the correct letter.
- The currently selected letter must be clearly highlighted.
- Display a prominent "Confirm Answer" button below the carousel.
- Disable the confirmation button when no letter is selected or while an answer
  is being processed.

The upper and lower sections should remain visually distinct and usable on small
screens. Use a flexible layout rather than fixed heights that could cause
content to overflow.

### 5.4. Results Screen

When all exercises have been completed, display:

- Final score.
- Number of correct first attempts.
- Number of correct second attempts.
- Number of failed exercises.
- Total number of exercises.
- Accuracy percentage.
- A "Restart Training" button.
- An "Exit to Home" button.

Restarting must create a new session with the same letters and a newly
randomized exercise order, and reset all session statistics.

Exiting must return to the main screen.

## 6. Georgian Alphabet and Audio Data

Create a centralized, strongly typed data source for the Georgian alphabet.

Use the standard 33-letter modern Georgian Mkhedruli alphabet.

Each letter entry should contain:

- A stable unique ID.
- The Georgian character.
- Its Georgian letter name.
- A Latin transliteration.
- An audio asset path or another explicit audio source.
- Any metadata needed to display the letter or play its sound.

Use a data structure similar to:

```ts
type GeorgianLetter = {
  id: string;
  character: string;
  name: string;
  transliteration: string;
  audioSrc: string;
};
```

Keep the alphabet data separate from UI components and training logic.

Define the letter presets from section 5.2 in a typed data module as well. Make
them reference letters by ID instead of repeating the letter data.

### Audio requirements

Actual audio playback is essential. Do not substitute the letter's written
character, a generic beep, or a browser-generated tone for the real sound.

Use recorded audio assets for Georgian letter sounds. Organize the files
consistently, for example:

```text
public/
  audio/
    letters/
      an.mp3
      ban.mp3
      gan.mp3
      ...
```

The filenames above are examples; use a consistent naming scheme that matches
the data source.

If audio files are not supplied, implement the audio integration and clearly
document where the real recordings must be added. Do not claim the app is fully
audio-functional until the recordings exist and have been verified.

Prefer recordings from a reliable Georgian-language source. Ensure that each
audio asset actually corresponds to the intended letter sound. Distinguish
letter names from individual phonetic sounds where necessary.

Implement audio playback with the HTML Audio API or another lightweight
browser-compatible solution.

Slow playback must use the same recording with its playback rate set to 0.5,
keeping the original pitch. Do not add separate slowed-down recordings or
synthesize a slow version. When a failed playback is retried, retry at the speed
the user requested.

Handle missing files and playback errors gracefully. Display a helpful message
and provide a retry option instead of silently failing.

## 7. Training Session Logic

Each training session must contain every letter checked on the settings screen
exactly once, and no other letters. A session needs at least 2 letters.

When the user starts or restarts a session:

1. Create a new array containing the session's letters.
2. Randomize their order using a proper Fisher–Yates shuffle.
3. Initialize the session index to the first exercise.
4. Reset the score and attempt statistics.
5. Clear any previous selections, feedback messages, and attempt state.
6. Load the first exercise.

The audio for each exercise must correspond to the letter the user is expected
to identify.

Maintain a clear mapping between the audio asset, the target letter ID, and the
expected answer. Never determine correctness from the visual position of a
letter in the carousel or from its array index.

A useful internal structure could be:

```ts
type Exercise = {
  targetLetterId: string;
};

type TrainingStats = {
  score: number;
  firstTryCorrect: number;
  secondTryCorrect: number;
  failedExercises: number;
  totalAttempts: number;
};
```

You may adjust the types if a better architecture is appropriate.

## 8. Answer Evaluation and Feedback

Implement the following exact interaction flow.

### Step 1: Start an exercise

- Load the target letter's audio.
- Allow the user to play and replay the sound.
- Let the user select a letter in the carousel.

### Step 2: First attempt

When the user presses "Confirm Answer":

If the selected letter is correct:

- Increase the score by 1.
- Increment `firstTryCorrect`.
- Display a positive notification, such as "Correct! +1 point".
- Mark the exercise as resolved.
- Automatically advance to the next exercise after a brief feedback interval.

If the selected letter is incorrect:

- Subtract 1 point.
- Increment `totalAttempts`.
- Display a negative notification, such as "Not quite! Try once more".
- Keep the same target sound active.
- Allow exactly one additional attempt.
- Do not advance to the next exercise yet.

### Step 3: Second attempt

When the user submits the second answer:

If the selected letter is correct:

- Increase the score by 1.
- Increment `secondTryCorrect`.
- Display a positive notification, such as "Correct on the second try! +1
  point".
- Resolve the exercise.
- Advance to the next exercise after a brief feedback interval.

If the selected letter is incorrect:

- Subtract 1 point.
- Increment `failedExercises`.
- Display a negative notification, such as "Incorrect. The correct letter was
  ა".
- Reveal the correct Georgian letter.
- Resolve the exercise.
- Advance to the next exercise after a brief feedback interval.

Important scoring rules:

- Every correct attempt earns +1 point.
- Every incorrect attempt costs -1 point.
- A first-attempt success gives a net exercise score of +1.
- An incorrect first attempt followed by a correct second attempt gives a net
  exercise score of 0.
- Two incorrect attempts give a net exercise score of -2.
- Do not deduct points more than once for the same submitted answer.
- The score must never be reset when moving between exercises.

### Feedback and interaction safety

- Prevent repeated submissions while feedback is being displayed.
- Prevent multiple timers from advancing the same exercise.
- Prevent stale asynchronous audio or UI events from modifying the next
  exercise.
- Keep feedback visible long enough to be noticed without making the session
  feel slow.
- Use both color and text or icons to communicate success and failure.
- Do not reveal the correct answer after a successful first attempt unless
  intentionally added as an optional learning feature.

## 9. Results and Statistics

After the final exercise is resolved, navigate to the results screen.

Calculate the final statistics from the actual session data.

Display:

- Final score, which may be negative.
- Correct first attempts.
- Correct second attempts.
- Failed exercises.
- Total exercises, equal to the number of letters in the session.
- Total submitted attempts.
- Accuracy percentage.

Define accuracy as:

`(Number of correct answers / Total submitted attempts) * 100`

Count every successful submitted answer as correct and every incorrect submitted
answer as incorrect.

If the user somehow completes a session without any submitted attempts, avoid
division by zero and display 0% accuracy.

Ensure that all statistics reconcile with the scoring rules.

## 10. React Architecture

Keep the code modular and maintainable.

Suggested project structure (one example per folder):

```text
src/
  components/
    AudioPlayer/
      AudioPlayer.tsx
      AudioPlayer.test.tsx
      index.ts
  screens/
    HomeScreen/
      HomeScreen.tsx
      index.ts
  data/
    georgianAlphabet.ts
  hooks/
    useTrainingSession.ts
  state/
    trainingSession.ts
  types/
    alphabet.ts
  utils/
    scoring.ts
    scoring.test.ts
  test/            # test setup and shared helpers
    setup.ts
  App.tsx
  main.tsx
  index.css        # Tailwind entry: @import "tailwindcss", @theme tokens, base styles
```

Each component and each screen lives in its own folder, named after it, under
`components/` or `screens/`, together with the files that belong only to it,
such as its tests. The folder's `index.ts` re-exports the component as its
default export (`export {default} from './AudioPlayer.tsx';`), and other modules
import it through that file
(`import AudioPlayer from '../../components/AudioPlayer/index.ts'`).

You may modify this structure if necessary, but keep data, business logic, and
presentation separate.

Implementation guidelines:

- Use TypeScript strict mode.
- Use React functional components and hooks.
- Style with Tailwind utility classes directly in components. Reuse styles by
  extracting components, not by adding CSS classes or `@apply` rules.
- Avoid unnecessary global state management libraries.
- Keep training logic inside a dedicated hook or reducer.
- Prefer explicit state transitions over loosely coupled booleans.
- Use stable IDs instead of array indexes to identify letters.
- Clean up audio resources and timers when components unmount or exercises
  change.
- Keep the console free of avoidable warnings and errors.

## 11. Accessibility and Mobile Interaction

- Use semantic HTML buttons.
- Ensure interactive elements have accessible labels.
- Provide visible keyboard focus states.
- Support keyboard navigation where practical.
- Announce answer feedback through an appropriate accessible live region.
- Respect `prefers-reduced-motion`.
- Ensure carousel selection is communicated to screen readers.
- Do not rely solely on color to indicate correctness.
- Avoid accidental page scrolling while interacting with the carousel, while
  preserving reasonable touch behavior.

## 12. Error Handling

Handle the following cases:

- Audio file is missing or cannot be loaded.
- Audio playback is rejected by the browser.
- The user attempts to start a session with fewer than 2 letters checked.
- The user attempts to confirm without selecting a letter.
- The user rapidly taps the confirmation button.
- The user restarts a session while feedback is visible.
- The user exits during a session.
- The last exercise is completed.
- The results screen is opened with no valid session data.

The application must remain stable and must not produce duplicate score updates
or advance past the final exercise.

## 13. Testing Requirements

Write automated tests for the training logic and scoring system.

At minimum, verify:

1. A new session contains exactly the letters checked on the settings screen.
2. Every letter appears exactly once per session.
3. The exercise order is randomized without losing or duplicating entries.
4. A correct first attempt adds 1 point and advances.
5. An incorrect first attempt subtracts 1 point and allows a second attempt.
6. A correct second attempt adds 1 point and advances.
7. An incorrect second attempt subtracts 1 point and advances.
8. Two incorrect attempts result in a net score of -2.
9. No third attempt is possible.
10. The final exercise opens the results screen.
11. Restarting resets statistics and generates a new shuffled session with the
    same letters.
12. Rapid repeated submissions do not cause duplicate scoring.
13. Accuracy is calculated correctly, including the zero-attempt case.
14. Missing audio files produce understandable feedback.
15. The Slow button plays the current recording at half speed, and the main
    button plays it at normal speed.
16. Each preset contains exactly the letters listed in section 5.2.
17. Choosing a preset checks exactly its letters, and choosing "Custom" unchecks
    every letter.
18. Checking or unchecking a letter switches the select to the matching preset,
    or to "Custom" without changing the checked letters.
19. "Start Training" is disabled while fewer than 2 letters are checked.
20. The training wheel offers only the session's letters.
21. The settings screen's back button returns to the main screen.

Use Vitest and React Testing Library if a test framework is needed.

## 14. Implementation Workflow

Work directly in the current project directory.

Follow this sequence:

1. Inspect the existing repository and its tooling before changing files.
2. Identify any existing components, assets, or project conventions worth
   preserving.
3. Set up the application if the project is empty.
4. Implement the alphabet data model and audio asset mapping.
5. Implement and test the shuffle, exercise progression, and scoring logic.
6. Build the mobile-first screens and carousel.
7. Integrate real audio playback.
8. Implement the results screen and restart behavior.
9. Run the available tests, TypeScript checks, and production build.
10. Fix any errors introduced by the implementation.
11. Provide a concise summary of what was implemented, which commands were run,
    and any outstanding requirements.

Do not stop after generating a plan. Continue through implementation and
verification unless blocked by a missing external dependency or an unavailable
required asset.

Do not overwrite existing project files blindly. Inspect them first and make
changes that preserve useful existing work.

## 15. Definition of Done

The application is complete when:

- All four screens are implemented.
- The settings screen's presets, letter picker and start button work as
  specified.
- The interface follows the dark blue mobile-first design.
- The application remains narrow and centered on desktop screens.
- The vertical carousel supports selecting Georgian letters.
- Each training session contains exactly the letters chosen on the settings
  screen.
- Audio playback uses correctly mapped recordings.
- The current sound can be played at normal speed and at half speed.
- Exercises appear in randomized order.
- The first- and second-attempt logic matches the specified rules.
- The score and statistics are correct.
- Results, restart, and exit navigation work.
- Automated tests pass.
- TypeScript checks and the production build succeed.
- Any missing audio recordings are explicitly documented rather than simulated.

Start by inspecting the repository, then implement the complete application.
