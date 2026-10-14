# Project: Georgian Alphabet Learning App

## 1. Role and Objective

Act as a senior React developer and UI/UX designer. Build a complete, functional, mobile-first web application for learning the Georgian alphabet through audio recognition exercises.

The application should help users learn to associate the sounds of Georgian letters with their written forms.

Do not create just a prototype or static mockup. Implement the complete training flow, audio playback, letter selection, scoring system, and session management.

## 2. Technology Stack

Use the following technologies:
- React
- TypeScript
- Vite
- CSS Modules or another lightweight styling approach
- React Hooks for state management

Keep the architecture simple and avoid unnecessary dependencies. Use a carousel library only if it provides a clear advantage over a custom implementation.

The application must work well on modern mobile browsers, including iOS Safari and Android Chrome.

## 3. Layout and Responsive Design

Design the application exclusively with a mobile-first approach.

Requirements:
- The main application container must have a maximum width of approximately 430px.
- On mobile devices, the container must occupy the full available width.
- On larger screens, center the application horizontally and maintain the same narrow mobile layout.
- The application must not expand into a desktop dashboard or desktop-specific layout.
- Use `100dvh` where appropriate to account for mobile browser viewport behavior.
- Prevent unwanted horizontal scrolling.
- Account for device safe areas using `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
- Keep primary buttons large enough for comfortable touch interaction, ideally at least 48px high.
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

Centralize colors using CSS variables so the theme can be adjusted easily.

Design guidelines:
- Use rounded cards and buttons.
- Use clear visual hierarchy and generous spacing.
- Make Georgian letters the visual focus of the training interface.
- Use subtle transitions and animations.
- Avoid excessive decoration, gradients, and unnecessary UI elements.
- Provide distinct visual states for selected letters, correct answers, and incorrect answers.
- Maintain sufficient contrast for accessibility.

## 5. Application Screens

Implement three main screens.

### 5.1. Main Screen

Display:
- Application title, such as "Learn Georgian".
- A prominent Georgian alphabet visual element.
- A short description explaining that the user will hear sounds and select the matching letters.
- A primary "Start Training" button.

Clicking the button must initialize a new training session and navigate to the training screen.

### 5.2. Training Screen

Divide the available screen height into two vertically stacked sections.

**Upper section: Audio**

- Display the current exercise number, such as "Question 3 of 33".
- Display a short instruction, such as "Listen and find the letter".
- Provide a prominent audio playback button.
- Allow the user to replay the current sound as many times as needed.
- Show a visual indication while audio is playing.
- Never automatically play the next sound before the previous exercise has been resolved.

The audio button must play the actual audio associated with the current Georgian letter sound.

**Lower section: Letter Carousel**

- Display a vertically oriented, touch-friendly carousel of Georgian letters.
- The currently selected letter must be clearly highlighted.
- Allow users to swipe vertically through the available letters.
- Support tap-to-select interaction.
- Keep the selected letter visually centered whenever practical.
- Display a prominent "Confirm Answer" button below the carousel.
- Disable the confirmation button when no letter is selected or while an answer is being processed.

The upper and lower sections should remain visually distinct and usable on small screens. Use a flexible layout rather than fixed heights that could cause content to overflow.

### 5.3. Results Screen

When all exercises have been completed, display:
- Final score.
- Number of correct first attempts.
- Number of correct second attempts.
- Number of failed exercises.
- Total number of exercises.
- Accuracy percentage.
- A "Restart Training" button.
- An "Exit to Home" button.

Restarting must create a new session with a newly randomized exercise order and reset all session statistics.

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

### Audio requirements

Actual audio playback is essential. Do not substitute the letter's written character, a generic beep, or a browser-generated tone for the real sound.

Use recorded audio assets for Georgian letter sounds. Organize the files consistently, for example:

```text
public/
  audio/
    letters/
      an.mp3
      ban.mp3
      gan.mp3
      ...
```

The filenames above are examples; use a consistent naming scheme that matches the data source.

If audio files are not supplied, implement the audio integration and clearly document where the real recordings must be added. Do not claim the app is fully audio-functional until the recordings exist and have been verified.

Prefer recordings from a reliable Georgian-language source. Ensure that each audio asset actually corresponds to the intended letter sound. Distinguish letter names from individual phonetic sounds where necessary.

Implement audio playback with the HTML Audio API or another lightweight browser-compatible solution.

Handle missing files and playback errors gracefully. Display a helpful message and provide a retry option instead of silently failing.

## 7. Training Session Logic

Each training session must contain all 33 letters exactly once.

When the user starts or restarts a session:
1. Create a new array containing all 33 alphabet entries.
2. Randomize their order using a proper Fisher–Yates shuffle.
3. Initialize the session index to the first exercise.
4. Reset the score and attempt statistics.
5. Clear any previous selections, feedback messages, and attempt state.
6. Load the first exercise.

The audio for each exercise must correspond to the letter the user is expected to identify.

Maintain a clear mapping between the audio asset, the target letter ID, and the expected answer. Never determine correctness from the visual position of a letter in the carousel or from its array index.

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
- Display a positive notification, such as "Correct on the second try! +1 point".
- Resolve the exercise.
- Advance to the next exercise after a brief feedback interval.

If the selected letter is incorrect:
- Subtract 1 point.
- Increment `failedExercises`.
- Display a negative notification, such as "Incorrect. The correct letter was ა".
- Reveal the correct Georgian letter.
- Resolve the exercise.
- Advance to the next exercise after a brief feedback interval.

Important scoring rules:
- Every correct attempt earns +1 point.
- Every incorrect attempt costs -1 point.
- A first-attempt success gives a net exercise score of +1.
- An incorrect first attempt followed by a correct second attempt gives a net exercise score of 0.
- Two incorrect attempts give a net exercise score of -2.
- Do not deduct points more than once for the same submitted answer.
- The score must never be reset when moving between exercises.

### Feedback and interaction safety

- Prevent repeated submissions while feedback is being displayed.
- Prevent multiple timers from advancing the same exercise.
- Prevent stale asynchronous audio or UI events from modifying the next exercise.
- Keep feedback visible long enough to be noticed without making the session feel slow.
- Use both color and text or icons to communicate success and failure.
- Do not reveal the correct answer after a successful first attempt unless intentionally added as an optional learning feature.

## 9. Results and Statistics

After the final exercise is resolved, navigate to the results screen.

Calculate the final statistics from the actual session data.

Display:
- Final score, which may be negative.
- Correct first attempts.
- Correct second attempts.
- Failed exercises.
- Total exercises: 33.
- Total submitted attempts.
- Accuracy percentage.

Define accuracy as:

`(Number of correct answers / Total submitted attempts) * 100`

Count every successful submitted answer as correct and every incorrect submitted answer as incorrect.

If the user somehow completes a session without any submitted attempts, avoid division by zero and display 0% accuracy.

Ensure that all statistics reconcile with the scoring rules.

## 10. React Architecture

Keep the code modular and maintainable.

Suggested project structure:

```text
src/
  components/
    AudioPlayer.tsx
    LetterCarousel.tsx
    PrimaryButton.tsx
    FeedbackMessage.tsx
  data/
    georgianAlphabet.ts
  hooks/
    useTrainingSession.ts
  screens/
    HomeScreen.tsx
    TrainingScreen.tsx
    ResultsScreen.tsx
  types/
    alphabet.ts
  utils/
    shuffle.ts
    scoring.ts
  App.tsx
  main.tsx
  styles/
    global.css
```

You may modify this structure if necessary, but keep data, business logic, and presentation separate.

Implementation guidelines:
- Use TypeScript strict mode.
- Use React functional components and hooks.
- Avoid unnecessary global state management libraries.
- Keep training logic inside a dedicated hook or reducer.
- Prefer explicit state transitions over loosely coupled booleans.
- Use stable IDs instead of array indexes to identify letters.
- Clean up audio resources and timers when components unmount or exercises change.
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
- Avoid accidental page scrolling while interacting with the carousel, while preserving reasonable touch behavior.

## 12. Error Handling

Handle the following cases:
- Audio file is missing or cannot be loaded.
- Audio playback is rejected by the browser.
- The user attempts to confirm without selecting a letter.
- The user rapidly taps the confirmation button.
- The user restarts a session while feedback is visible.
- The user exits during a session.
- The last exercise is completed.
- The results screen is opened with no valid session data.

The application must remain stable and must not produce duplicate score updates or advance past the final exercise.

## 13. Testing Requirements

Write automated tests for the training logic and scoring system.

At minimum, verify:

1. A new session contains all 33 letters.
2. Every letter appears exactly once per session.
3. The exercise order is randomized without losing or duplicating entries.
4. A correct first attempt adds 1 point and advances.
5. An incorrect first attempt subtracts 1 point and allows a second attempt.
6. A correct second attempt adds 1 point and advances.
7. An incorrect second attempt subtracts 1 point and advances.
8. Two incorrect attempts result in a net score of -2.
9. No third attempt is possible.
10. The final exercise opens the results screen.
11. Restarting resets statistics and generates a new shuffled session.
12. Rapid repeated submissions do not cause duplicate scoring.
13. Accuracy is calculated correctly, including the zero-attempt case.
14. Missing audio files produce understandable feedback.

Use Vitest and React Testing Library if a test framework is needed.

## 14. Implementation Workflow

Work directly in the current project directory.

Follow this sequence:

1. Inspect the existing repository and its tooling before changing files.
2. Identify any existing components, assets, or project conventions worth preserving.
3. Set up the application if the project is empty.
4. Implement the alphabet data model and audio asset mapping.
5. Implement and test the shuffle, exercise progression, and scoring logic.
6. Build the mobile-first screens and carousel.
7. Integrate real audio playback.
8. Implement the results screen and restart behavior.
9. Run the available tests, TypeScript checks, and production build.
10. Fix any errors introduced by the implementation.
11. Provide a concise summary of what was implemented, which commands were run, and any outstanding requirements.

Do not stop after generating a plan. Continue through implementation and verification unless blocked by a missing external dependency or an unavailable required asset.

Do not overwrite existing project files blindly. Inspect them first and make changes that preserve useful existing work.

## 15. Definition of Done

The application is complete when:

- All three screens are implemented.
- The interface follows the dark blue mobile-first design.
- The application remains narrow and centered on desktop screens.
- The vertical carousel supports selecting Georgian letters.
- All 33 letters are represented in the training session.
- Audio playback uses correctly mapped recordings.
- Exercises appear in randomized order.
- The first- and second-attempt logic matches the specified rules.
- The score and statistics are correct.
- Results, restart, and exit navigation work.
- Automated tests pass.
- TypeScript checks and the production build succeed.
- Any missing audio recordings are explicitly documented rather than simulated.

Start by inspecting the repository, then implement the complete application.