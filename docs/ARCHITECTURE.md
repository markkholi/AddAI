# AddAI — Architecture

Phase 1 design document. This describes *how* AddAI is built. For *what* gets built in
the first pass, see [`MVP_SPEC.md`](MVP_SPEC.md); for the build order and definition of
done, see [`HANDOFF_TO_IMPLEMENTER.md`](HANDOFF_TO_IMPLEMENTER.md).

---

## 1. Design constraints that drive everything else

The user is eight. That single fact decides most of the technical choices:

- **No reading walls.** Instruction is carried by pictures and short sentences (max ~12
  words per line of copy). Any screen that needs a paragraph is a design failure.
- **Fat fingers, possibly a tablet.** Every interactive target is at least 56×56 px,
  spaced at least 12 px apart. Layout is mobile-first and must work at 360 px wide.
- **Feedback must be instant and unmissable.** Correct/incorrect is communicated with
  colour *plus* an icon *plus* a word *plus* motion — never colour alone.
- **No time pressure and no failure state.** There is no countdown, no lives, no "you
  lose". A wrong answer is a retry with a hint.
- **Sessions are short.** A lesson plus its practice set should be finishable in about
  five minutes.

Two engineering constraints follow from the POC framing: no backend, and small enough
that one implementer pass produces something demoable.

---

## 2. Tech stack

| Concern | Choice | Why |
| --- | --- | --- |
| Build tool | **Vite 5** (`react-ts` template) | Fast dev server, zero config for this scale |
| UI | **React 18** + **TypeScript 5** (strict) | Requested; types keep the exercise data model honest |
| Routing | **react-router-dom 6** | Four routes, deep-linkable lessons, hash-free URLs |
| Drag and drop | **@dnd-kit/core** | Pointer + touch + **keyboard** dragging out of the box, `DragOverlay` for a clean drag ghost, no HTML5 DnD API (which is unusable on touch) |
| Styling | **CSS Modules** + one global token sheet | No extra build config, no utility-class soup, scoped by default |
| State | **React Context + `useReducer`** | The only long-lived state is progress; a state library would be overkill |
| Persistence | **`localStorage`** behind a tiny wrapper | No accounts needed for the POC |
| Animation | **CSS transitions/keyframes only** | Keeps the bundle small; must respect `prefers-reduced-motion` |
| Icons/art | **Inline SVG components + emoji** | No asset pipeline, no licensing questions, scales crisply |
| Testing | **Vitest** on pure logic only | Grading and question generation are worth testing; UI is not, for a POC |

### Explicitly rejected

- **A backend / auth.** Nothing in the MVP needs a server. Progress is a handful of
  numbers per lesson and belongs in `localStorage`. Adding a server would add deploy,
  schema, and privacy questions (children's data) for zero POC value.
- **Tailwind, Redux, Zustand, styled-components.** Each is defensible in a bigger app
  and each is a config or concept tax here.
- **`react-beautiful-dnd`.** Effectively unmaintained and list-reorder oriented; AddAI
  needs tile-into-slot, which is dnd-kit's natural shape.
- **A CMS or JSON-authored content.** Lesson content is TypeScript modules so the
  compiler validates it.

---

## 3. Folder structure

The app lives at the repo root (one `package.json`, no monorepo).

```
/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ .eslintrc.cjs
├─ docs/                          # this folder — planning docs, not shipped
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ main.tsx                    # ReactDOM root + BrowserRouter + ProgressProvider
   ├─ App.tsx                     # route table + app shell
   │
   ├─ styles/
   │  ├─ tokens.css               # CSS custom properties: colour, space, radius, type, motion
   │  └─ global.css               # reset, base type, focus-visible ring, body background
   │
   ├─ types/
   │  └─ index.ts                 # Lesson, Exercise (discriminated union), Attempt, Progress
   │
   ├─ data/
   │  ├─ lessons.ts               # the three lessons + their teach steps
   │  └─ exercises.ts             # the question banks, one array per lesson
   │
   ├─ lib/
   │  ├─ storage.ts               # typed localStorage get/set with a schema version
   │  ├─ grading.ts               # answer checking + attempts → stars
   │  ├─ shuffle.ts               # seedless shuffle / pick-n helpers
   │  └─ sound.ts                 # optional WebAudio blips; no-op stub is acceptable
   │
   ├─ components/                 # dumb, reusable, no feature knowledge
   │  ├─ BigButton/
   │  ├─ Card/
   │  ├─ StarRating/
   │  ├─ ProgressDots/
   │  ├─ FeedbackBanner/          # owns the aria-live region
   │  ├─ Mascot/                  # SVG critter with mood: idle | cheer | think | oops
   │  ├─ CountableObject/         # one apple/frog/star, sized by prop
   │  └─ TenFrame/                # 2×5 grid, renders N filled dots
   │
   └─ features/
      ├─ progress/
      │  ├─ ProgressContext.tsx   # provider + useProgress() hook
      │  └─ progressReducer.ts
      ├─ home/
      │  └─ HomeScreen.tsx        # the "Adventure Map"
      ├─ lesson/
      │  └─ LessonScreen.tsx      # teach steps, next/back
      ├─ practice/
      │  ├─ PracticeScreen.tsx    # session runner: current index, feedback, advance
      │  ├─ ExerciseRenderer.tsx  # switch over exercise.kind
      │  └─ exercises/
      │     ├─ CountObjects/
      │     ├─ TenFrameBuild/
      │     └─ NumberSentenceDrop/
      └─ results/
         └─ ResultsScreen.tsx     # stars earned, replay, next lesson
```

**Rules of the layout.** `components/` never imports from `features/`. Exercise
components never touch `localStorage` or routing — they receive an exercise and call
`onAnswer`. All content lives in `data/`, never inline in a component.

Each component folder is `ComponentName.tsx` + `ComponentName.module.css`, with no
barrel `index.ts` files (they cost more than they save at this size).

---

## 4. Screens and flows

Four screens, four routes:

| Route | Screen | Purpose |
| --- | --- | --- |
| `/` | Home / Adventure Map | Pick a lesson. Shows earned stars per lesson. |
| `/lesson/:lessonId` | Lesson (teach) | 3–4 illustrated steps that explain the idea. |
| `/lesson/:lessonId/practice` | Practice | Five questions, one at a time. |
| `/lesson/:lessonId/results` | Results | Stars, encouragement, replay or next lesson. |

Unknown `lessonId` redirects to `/`.

### The happy path

```
Home ──tap lesson card──▶ Lesson (step 1 → 2 → 3) ──"Let's practice!"──▶ Practice
                                                                            │
                                             ┌── correct ──▶ cheer, auto-advance (~900 ms)
                          question 1..5 ─────┤
                                             └── wrong ────▶ hint, restore, try again
                                                                            │
                                                          all 5 answered ───▶ Results
                                                                            │
                                     ┌──────── "Play again" (same lesson) ◀──┤
                                     └──────── "Next lesson" / "Map" ────────┘
```

### Screen details

**Home.** A vertical stack of large lesson cards (single column on phones, two up above
768 px). Each card: big number badge, illustration, title, subtitle, and a
`StarRating` showing best-ever stars (`0–3`). Lessons are *not* locked — an 8-year-old
poking around is fine, and gating creates dead ends. A small "Start over" link clears
saved progress behind a confirm.

**Lesson.** One idea per step, each step being an illustration plus one or two short
sentences. Step 1 poses it concretely ("3 frogs and 2 more frogs"), step 2 shows the
counting, step 3 shows the number sentence. Back/Next are big, and Next on the last step
reads "Let's practice!" and navigates to practice.

**Practice.** Persistent header with `ProgressDots` (five dots: pending / correct /
corrected-after-retry). Body is the exercise. Footer holds the primary action ("Check
it!" for exercises that need explicit submission). Feedback appears as a
`FeedbackBanner` and the mascot changes mood. Correct answers auto-advance after a short
celebration; wrong answers keep the child on the question with a hint, the invalid part
reset, and the attempt counted.

**Results.** Star burst (0–3 stars, animated in), the mascot cheering, a one-line
encouraging message chosen by star count, and three buttons: "Play again",
"Next lesson" (hidden on the last lesson), "Back to map".

---

## 5. State model

Three tiers, deliberately separate:

**Tier 1 — static content.** `data/lessons.ts` and `data/exercises.ts` are plain
TypeScript constants. Never mutated.

**Tier 2 — persistent progress.** One Context, backed by `localStorage`.

```ts
export type LessonId = 'add-with-pictures' | 'make-a-ten' | 'number-sentences';

export interface LessonProgress {
  bestStars: 0 | 1 | 2 | 3;
  timesCompleted: number;
  lastPlayedAt: number;      // epoch ms
}

export interface ProgressState {
  version: 1;                // bump to invalidate old saved shapes
  lessons: Record<LessonId, LessonProgress>;
}
```

Actions: `RECORD_RESULT { lessonId, stars }` (writes only if `stars > bestStars`, always
increments `timesCompleted`) and `RESET_ALL`. The reducer is pure; a `useEffect` in the
provider writes the state to `localStorage` under `addai.progress.v1` after every
change. Reads are defensive: bad JSON, a missing key, or a version mismatch all fall
back to a fresh default state rather than throwing.

**Tier 3 — session state.** Lives in `PracticeScreen` via `useReducer` and dies when the
child leaves the screen. Nothing here is persisted, so a refresh mid-practice simply
starts the set over.

```ts
interface SessionState {
  exercises: Exercise[];               // the 5 chosen for this run, fixed at mount
  index: number;                       // 0..4
  attemptsForCurrent: number;          // 0 = not yet answered
  results: Array<{ id: string; attempts: number }>;
  phase: 'answering' | 'correct' | 'wrong';
}
```

The five exercises are picked once on mount (`useState` initialiser, *not* render-time
randomness) so React re-renders can't reshuffle the set mid-session.

### The exercise data model

A discriminated union on `kind` is the spine of the app. `ExerciseRenderer` switches on
it, and a `default` branch with a `never` check means adding a fourth kind later is a
compile error until it's handled.

```ts
export interface ExerciseBase {
  id: string;
  prompt: string;                      // short, kid-readable
  hint: string;                        // shown after a wrong attempt
}

export interface CountObjectsExercise extends ExerciseBase {
  kind: 'count-objects';
  groups: [number, number];            // e.g. [3, 4] → two clusters of critters
  icon: 'frog' | 'apple' | 'star' | 'fish';
  choices: number[];                   // 3–4 options including the answer
  answer: number;
}

export interface TenFrameBuildExercise extends ExerciseBase {
  kind: 'ten-frame-build';
  addends: [number, number];           // pre-filled dots + dots to drag in
  answer: number;                      // addends[0] + addends[1]
}

export interface NumberSentenceDropExercise extends ExerciseBase {
  kind: 'number-sentence-drop';
  template: [number | null, number | null, number | null];  // [a, b, sum]; null = blank
  tiles: number[];                     // draggable numbers, includes distractors
}

export type Exercise =
  | CountObjectsExercise
  | TenFrameBuildExercise
  | NumberSentenceDropExercise;
```

### Grading and stars

`lib/grading.ts` holds this logic as pure functions so it can be unit-tested without a DOM.

Stars are computed from the whole five-question set, based on how many were right on the
first try:

| First-try correct | Stars |
| --- | --- |
| 5 | ★★★ |
| 4 | ★★☆ |
| 2–3 | ★☆☆ |
| 0–1 | ★☆☆ (finishing always earns one) |

Every child who finishes gets at least one star. That's a deliberate motivation choice,
not an oversight.

---

## 6. How drag-and-drop practice works

Two of the three exercise types are drag-and-drop, and both use the same mechanics via
`@dnd-kit/core`.

### Mechanics

- A `DndContext` wraps the exercise. Draggables (`useDraggable`) are number tiles or unit
  cubes; droppables (`useDroppable`) are sentence blanks or ten-frame cells.
- **Sensors:** `PointerSensor` with `activationConstraint: { distance: 8 }` so a slightly
  shaky tap still counts as a tap, plus `KeyboardSensor` for keyboard dragging.
- **`DragOverlay`** renders the dragged tile above everything at ~1.08 scale with a
  shadow, which avoids the overflow/clipping bugs you get from transforming the tile in
  place.
- **Drop targets grow.** While `isOver` is true a slot scales up slightly, brightens, and
  shows a dashed outline. Targets are ≥64×64 px and the drop tolerance is generous.
- **Snap-back on miss.** Dropping outside any slot returns the tile home with a short
  spring; nothing is lost and nothing is scored.
- **Placement is not submission.** For `number-sentence-drop`, filling the blanks does
  nothing until "Check it!" is pressed, so the child can rearrange freely. Wrong answer →
  the wrong tiles fly back and the hint appears.
- **Tap-to-place fallback (required, not optional).** Tapping a tile selects it (visible
  outline); tapping a slot places it. This is the path that saves kids who can't sustain
  a drag, and it doubles as the touch-accessibility story. Tapping a filled slot returns
  its tile to the tray.

### Per-exercise behaviour

**`ten-frame-build` (visual / base-10).** The ten-frame shows `addends[0]` dots already
filled. A tray holds loose dots; the child drags `addends[1]` of them into empty cells.
When the frame's filled count equals the answer, the mat pulses green and the exercise
self-submits — no button needed, because the manipulative *is* the answer. If the number
crosses ten, a second frame appears beside the first, which is exactly the visual that
teaches making a ten.

**`number-sentence-drop` (drag-and-drop number sentence).** Renders the sentence as big
boxes: `4 + 3 = [ ]`, or with the blank in the middle (`4 + [ ] = 7`) for later
questions. The tray holds the correct tile plus two or three near-miss distractors
(off-by-one and off-by-ten are the useful wrong answers). Checked on "Check it!".

**`count-objects` (visual, no dragging).** Two clusters of SVG critters with a plus sign
between them; the child taps a big answer choice. Each critter can be tapped to toggle a
"counted" checkmark, which supports the actual counting strategy a 3rd grader uses.

### Keyboard equivalence

dnd-kit's `KeyboardSensor` gives: Tab to a tile, Space/Enter to lift, arrows to move
between slots, Space/Enter to drop, Escape to cancel. Announcements go through dnd-kit's
`accessibility.announcements` so a screen reader says "Tile 7 picked up",
"over the answer box", "dropped in the answer box".

---

## 7. Accessibility for kids

Kid accessibility overlaps with standard accessibility but weights it differently:
motor precision and reading load matter more than usual, and animation can be genuinely
distressing.

- **Touch targets** ≥56 px (buttons) and ≥64 px (drop slots), with ≥12 px gaps to prevent
  mis-taps.
- **Type** is 18 px base, 24 px+ for prompts, numerals 32 px+. A system-UI font stack;
  no thin weights.
- **Contrast** meets 4.5:1 for text and 3:1 for meaningful graphics. Playful does not
  mean pastel-on-pastel.
- **Never colour alone.** Correct = green + checkmark + "Nice work!"; wrong = amber
  (not red) + a thinking face + "Not yet — try again!". Amber because red reads as
  punishment to a child.
- **Announce feedback.** `FeedbackBanner` is an `aria-live="polite"` region, and it is the
  *only* live region in the app so announcements can't collide.
- **Motion.** All animation sits behind `@media (prefers-reduced-motion: reduce)`, which
  collapses transitions to near-zero. No infinite spinners, no parallax, no flashing
  above 3 Hz.
- **Focus.** A thick, high-contrast `:focus-visible` ring, never `outline: none`. Route
  changes move focus to the new screen's `<h1>` (which is `tabIndex={-1}`).
- **Semantics.** Real `<button>`s and `<a>`s, one `<h1>` per screen, `<main>` landmark,
  descriptive labels ("Answer 7", not "Button 3"). Decorative SVG gets
  `aria-hidden="true"`; countable groups get one label like "3 frogs and 4 frogs".
- **Sound is opt-in and silent by default**, muteable from a persistent header toggle, and
  never the sole carrier of information.
- **No dark patterns.** No streaks, no countdowns, no "you'll lose your stars", no
  external links, no data collection.

---

## 8. MVP success criteria

The MVP is a success when all of these are true:

1. **It runs clean.** `npm install && npm run dev` works on Node 20 with no errors, and
   `npm run build` passes with TypeScript `strict` and zero `any` in `src/`.
2. **The loop closes.** A child can go Home → Lesson → 5 practice questions → Results →
   Home and see stars persist on the map after a full page reload.
3. **All three exercise types work,** including at least one visual/base-10 exercise
   (`ten-frame-build`) and at least one drag-and-drop number sentence
   (`number-sentence-drop`).
4. **Drag-and-drop works on touch,** verified at 390×844 (phone) and 768×1024 (tablet),
   with the tap-to-place fallback working everywhere dragging does.
5. **The whole app is keyboard-operable,** dragging included, with a visible focus ring at
   every step.
6. **Wrong answers are non-punishing:** hint shown, retry allowed, no lockout, no dead
   ends, and no way to reach a blank screen.
7. **It reads as a kids' app** — bright, big, illustrated, and a mascot that reacts. An
   adult glancing at it should not mistake it for a form.
8. **It respects `prefers-reduced-motion`** with animation effectively off.
9. **A third grader can use it without an adult reading the screen to them.** This is the
   real bar; if a step needs explaining, redesign the step.

### Deliberately out of scope

Accounts, backend, teacher dashboards, analytics, i18n, subtraction/multiplication,
adaptive difficulty, offline/PWA, and hosting. Stretch ideas (a fourth "Adding Tens"
lesson with base-10 rods, a printable certificate, real sound effects) are listed in
`MVP_SPEC.md` and must not be started before the core loop is done.
