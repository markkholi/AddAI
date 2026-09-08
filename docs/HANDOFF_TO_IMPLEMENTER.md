# Handoff to Implementer (Phase 2)

**You are the implementer.** Phase 1 produced the plan; your job is to build the AddAI
MVP from it. Everything you need is in this repo — you should not have to guess at
product decisions.

Read in this order:

1. This file — stack, file list, build order, definition of done.
2. [`MVP_SPEC.md`](MVP_SPEC.md) — the content: lessons, exercise banks, star rules, copy,
   colours. **Copy the question banks as written.** They're already checked for
   arithmetic and difficulty progression.
3. [`ARCHITECTURE.md`](ARCHITECTURE.md) — the reasoning, the type definitions, the
   accessibility rules, the drag-and-drop mechanics.

## Rule zero: do not redesign this

The architecture is decided. Don't swap the stack, don't restructure the folders, don't
rename the types, don't replace the exercise data model, and don't add a backend, a state
library, a CSS framework, or a component library. Build what's specified.

Two exceptions, both narrow:

- **A blocking problem.** If something specified genuinely cannot work (a dependency is
  broken on Node 20, an API doesn't exist as described), fix it the smallest way you can
  and note what you changed and why in the PR description.
- **Unspecified detail.** The specs don't cover every pixel. Where they're silent, make a
  sensible choice consistent with what's written and move on — don't stop to ask.

Adding files not on the list below is fine when they're small helpers that fit the
structure. Deleting or relocating specified files is not.

---

## Exact stack

Node 20+. npm.

```bash
npm create vite@latest . -- --template react-ts
```

Then:

```bash
npm i react-router-dom @dnd-kit/core
npm i -D vitest
```

That's the complete dependency list on top of the Vite `react-ts` template. **Do not add
anything else** — no Tailwind, no Zustand/Redux, no framer-motion, no UI kit, no icon
package, no `react-beautiful-dnd`, no test-runner beyond Vitest.

- Styling: **CSS Modules** (`*.module.css`, built into Vite) plus two global sheets,
  `src/styles/tokens.css` and `src/styles/global.css`, imported once from `main.tsx`.
- Art: **inline SVG React components** and emoji. No image assets, no sprite sheets.
- Animation: **CSS transitions and keyframes only**, all gated on
  `prefers-reduced-motion`.
- TypeScript: `strict: true`. No `any` in `src/`. No `@ts-ignore`.

### `package.json` scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest run"
  }
}
```

---

## Files to create

Paths are relative to the repo root. The app lives at the root — no `app/` or `client/`
subfolder, no monorepo. Leave `docs/` and `README.md` alone except for the one README
edit noted at the end.

**Config and entry**

- `index.html` — title "AddAI — Learn to Add", `lang="en"`, viewport meta
- `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `.eslintrc.cjs`, `.gitignore`
- `public/favicon.svg`
- `src/main.tsx` — root render, `<BrowserRouter>`, `<ProgressProvider>`, global CSS imports
- `src/App.tsx` — `<Routes>` + app shell (header with mute toggle, `<main>`)

**Styles**

- `src/styles/tokens.css` — the token table from `MVP_SPEC.md` §5 as CSS custom properties
- `src/styles/global.css` — reset, base type, `:focus-visible` ring, body background, reduced-motion block

**Types and data**

- `src/types/index.ts` — `LessonId`, `Lesson`, `TeachStep`, the `Exercise` union and its
  members, `Attempt`, `LessonProgress`, `ProgressState` (copy the definitions from
  `ARCHITECTURE.md` §5)
- `src/data/lessons.ts` — the three lessons and their three teach steps each (`MVP_SPEC.md` §2)
- `src/data/exercises.ts` — the three banks of 8, keyed by `LessonId` (`MVP_SPEC.md` §3)

**Lib (pure, unit-testable)**

- `src/lib/storage.ts` — `loadProgress()` / `saveProgress()` for key `addai.progress.v1`; must not throw on missing, malformed, or version-mismatched data
- `src/lib/grading.ts` — `checkAnswer(exercise, submitted)`, `starsFor(results)`, `messageForStars(stars)`
- `src/lib/shuffle.ts` — `shuffle<T>(items: T[]): T[]` and `pickN<T>(items: T[], n: number): T[]`, both **pure** (return new arrays, never mutate the input)
- `src/lib/sound.ts` — `playCorrect()` / `playWrong()` via WebAudio, muted by default; a no-op stub is acceptable
- `src/lib/grading.test.ts` and `src/lib/shuffle.test.ts` — Vitest, covering star thresholds at 5/4/3/1 first-try-correct, each exercise kind's answer check, and that `shuffle` doesn't mutate

**Shared components** (each as `Name/Name.tsx` + `Name/Name.module.css`, no barrel files)

- `BigButton` — variants `primary | secondary | ghost`, min 56 px tall, real `<button>`
- `Card` — rounded surface used by lesson cards and exercise panels
- `StarRating` — `value: 0|1|2|3`, `size`, optional entrance animation
- `ProgressDots` — states `pending | first-try | retried`
- `FeedbackBanner` — the app's **only** `aria-live="polite"` region; success/warn variants with icon + word
- `Mascot` — inline SVG, `mood: 'idle' | 'think' | 'cheer' | 'oops'`
- `CountableObject` — one frog/apple/star/fish, `counted` toggle badge
- `TenFrame` — 2×5 grid; renders filled/empty cells and exposes cells as drop targets

**Features**

- `src/features/progress/ProgressContext.tsx` — provider, `useProgress()`, persistence effect
- `src/features/progress/progressReducer.ts` — pure reducer for `RECORD_RESULT` and `RESET_ALL`
- `src/features/home/HomeScreen.tsx` (+ module CSS) — the Adventure Map
- `src/features/lesson/LessonScreen.tsx` (+ module CSS) — teach steps, Back/Next, "Let's practice!"
- `src/features/practice/PracticeScreen.tsx` (+ module CSS) — session runner
- `src/features/practice/ExerciseRenderer.tsx` — exhaustive `switch` on `exercise.kind` with a `never` default
- `src/features/practice/exercises/CountObjects/CountObjects.tsx` (+ module CSS)
- `src/features/practice/exercises/TenFrameBuild/TenFrameBuild.tsx` (+ module CSS)
- `src/features/practice/exercises/NumberSentenceDrop/NumberSentenceDrop.tsx` (+ module CSS)
- `src/features/results/ResultsScreen.tsx` (+ module CSS)

Routes: `/`, `/lesson/:lessonId`, `/lesson/:lessonId/practice`, `/lesson/:lessonId/results`.
An unknown `lessonId` redirects to `/`.

### Exercise component contract

All three exercise components take exactly this shape, so `ExerciseRenderer` and
`PracticeScreen` stay dumb:

```tsx
interface ExerciseProps<E extends Exercise> {
  exercise: E;
  /** Called once per submission. The parent owns attempt counting and advancing. */
  onAnswer: (correct: boolean) => void;
  /** True while the parent is showing feedback — freeze interaction. */
  locked: boolean;
}
```

Exercise components must not read or write `localStorage`, must not navigate, and must
not compute stars. They render, they call `onAnswer`, that's all.

---

## Build order

Ship in this order so there's something clickable early.

1. **Scaffold** — Vite app, deps, scripts, tokens + global CSS, `types/`, `data/`. Verify `npm run dev` boots.
2. **Shell** — `main.tsx`, `App.tsx`, routes, `ProgressProvider` + `storage.ts`, and a placeholder for each screen.
3. **Home** — lesson cards with `StarRating` reading real (empty) progress.
4. **Lesson** — teach steps for all three lessons, navigation into practice.
5. **Practice runner** — session reducer, `ProgressDots`, `FeedbackBanner`, `Mascot`, retry-on-wrong, advance-on-correct, navigate to results at the end.
6. **`CountObjects`** — the easiest exercise; proves the runner end to end.
7. **`NumberSentenceDrop`** — first drag-and-drop, including the tap-to-place fallback and keyboard dragging.
8. **`TenFrameBuild`** — reuses the DnD patterns from step 7, adds the second frame past ten.
9. **Results** — stars, message, replay / next / map, and `RECORD_RESULT` written once.
10. **Polish and verify** — reduced motion, focus rings, 360 px and 390×844 layouts, keyboard pass, Vitest green, `npm run build` clean.

---

## Drag-and-drop requirements (non-negotiable)

Details and rationale are in `ARCHITECTURE.md` §6. The hard requirements:

- `@dnd-kit/core` with `PointerSensor` (`activationConstraint: { distance: 8 }`) **and** `KeyboardSensor`.
- `DragOverlay` for the dragged tile — do not transform the tile in place.
- Drop targets ≥64×64 px with a clear `isOver` state (scale + outline + brightness).
- Snap-back on a miss, with nothing lost and nothing scored.
- **Tap-to-place fallback everywhere dragging works:** tap tile to select, tap slot to place, tap a placed tile to return it. This is a requirement, not a nice-to-have — some 8-year-olds cannot sustain a drag on a touchscreen.
- Full keyboard dragging with dnd-kit `accessibility.announcements` wired up.

---

## Accessibility requirements (non-negotiable)

The full list is `ARCHITECTURE.md` §7. Minimum bar:

- Interactive targets ≥56 px (≥64 px for drop slots), ≥12 px apart.
- Text contrast ≥4.5:1; meaningful graphics ≥3:1.
- Correct/incorrect signalled by colour **and** icon **and** text. Amber for "not yet", never red.
- Exactly one `aria-live` region (inside `FeedbackBanner`).
- Visible `:focus-visible` ring everywhere; never `outline: none` without a replacement.
- All animation inside `@media (prefers-reduced-motion: reduce)` guards.
- Real semantic elements, one `<h1>` per screen, `<main>` landmark, labels that say what the control does ("Answer 7", not "Button 3").
- On route change, move focus to the new screen's `<h1>` (`tabIndex={-1}`).

---

## Code constraints

- **Do not use `Array.prototype.toSorted`, `toReversed`, `toSpliced`, or `with`.** Use the
  copy-then-mutate form instead:

```ts
// wrong — avoid
const ordered = choices.toSorted((a, b) => a - b);

// right
const ordered = [...choices].sort((a, b) => a - b);
```

- Don't mutate props, `data/` constants, or arrays passed into `lib/` helpers.
- No randomness during render. Pick the session's five exercises in a `useState`
  initialiser so re-renders can't reshuffle mid-session:

```tsx
const [exercises] = useState(() => pickN(banks[lessonId], 5));
```

- Keep components under ~200 lines; split when they grow past it.
- No `console.log` left in committed code.
- Comments only where intent isn't obvious from the code. Don't narrate.
- No new dependencies beyond the four listed above.

---

## Definition of done

Every box must be checked before you call it finished.

**Builds and runs**

- [ ] `npm install` clean on Node 20
- [ ] `npm run dev` serves with no console errors or React warnings
- [ ] `npm run build` passes with `strict` TypeScript; no `any`, no `@ts-ignore` in `src/`
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (grading + shuffle covered)

**The loop closes**

- [ ] Home shows all three lessons with star ratings
- [ ] Each lesson's three teach steps render and navigate forward into practice
- [ ] A practice set is 5 questions drawn from that lesson's bank of 8
- [ ] Wrong answers show the hint and allow a retry; nothing locks the child out
- [ ] Correct answers celebrate and advance
- [ ] Results shows stars matching the table in `MVP_SPEC.md` §4
- [ ] Stars persist across a full page reload, and only the best score is kept
- [ ] "Start over" clears progress behind a confirm

**Exercises**

- [ ] `count-objects` works, including the per-critter counting checkmarks
- [ ] `ten-frame-build` works, and a sum over 10 opens a second frame
- [ ] `number-sentence-drop` works for both a missing sum and a missing addend
- [ ] All three drag/tap paths work with a mouse, with touch, and with the keyboard

**Kid-ready**

- [ ] Usable at 360 px wide; comfortable at 390×844 and 768×1024
- [ ] Landscape phone doesn't hide the primary action
- [ ] `prefers-reduced-motion: reduce` effectively disables animation
- [ ] Full keyboard pass from Home through Results with a visible focus ring at every stop
- [ ] No dead ends, no blank screens, no route that can 404
- [ ] It looks like a kids' app: big, bright, illustrated, mascot reacting

**Repo hygiene**

- [ ] `.gitignore` covers `node_modules/`, `dist/`, and local env files
- [ ] `docs/` is unchanged
- [ ] `README.md`'s "Status" section is updated to say the app is runnable — leave the rest of the README as is
- [ ] Work is on a feature branch with a PR describing what was built and anything you deviated from, and why

## If you get stuck

Prefer the smallest thing that satisfies the spec. A slightly plain but working
`ten-frame-build` beats an elaborate one that doesn't ship. If you have to cut something,
cut polish (mascot moods, sound, star animation) before cutting any exercise type,
because the three exercise types are the point of the demo.
