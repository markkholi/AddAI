# AddAI — Phase 3 Review (Gemini)

Review of the Phase 2 MVP implementation committed by Grok on branch `cursor/addai-phase1-architecture-docs-d435` ([PR #1](https://github.com/markkholi/AddAI/pull/1)).

Evaluated against:
1. `docs/HANDOFF_TO_IMPLEMENTER.md`
2. `docs/MVP_SPEC.md`
3. `docs/ARCHITECTURE.md`
4. `README.md` and `docs/IMPLEMENTATION_NOTES.md`

---

## 1. Executive Summary & Verdict

**Verdict: Strong Pass with Targeted Refinements.**

The Phase 2 implementer followed the architecture and specification with high fidelity. The MVP is lean, fast, strictly typed, has zero external bloat, and fulfills the core product loop:
- The entire Home (Adventure Map) -> Lesson (3 Teach Steps) -> Practice (5 Questions) -> Results flow is functional and engaging.
- Progress and best stars persist across reloads in `localStorage` (`addai.progress.v1`) without any server or account complexity.
- Both required interactive paradigms are playable: visual/base-10 manipulatives (`ten-frame-build`) and drag-and-drop equations (`number-sentence-drop`), alongside countable critter clusters (`count-objects`).
- Drag-and-drop is backed by `@dnd-kit/core` with touch support, pointer constraints, keyboard sensors, and an essential tap-to-place fallback.

A few real-world UX and accessibility gaps were identified, particularly regarding ten-frame mobile sizing (360px), mathematical operator screen-reader accessibility, pedagogical constraints on "Make a Ten", and color contrast on warning banners. Two tiny critical edge-case fixes were applied during this review and are detailed below; all other findings are structured into clear P0, P1, and P2 action items for the next implementer pass.

---

## 2. Tiny Critical Patches Applied in Phase 3

Per the review protocol, two minimal, high-safety bug fixes were applied directly to prevent runtime and interaction anomalies:

1. **`src/features/practice/exercises/TenFrameBuild/TenFrameBuild.tsx` (Tray Ghost-Dot Drag Fix)**
   - *Issue:* Tray dots that had already been placed in the frame had `hidden={index < usedDots}` (opacity 0.2), but were passed `disabled={locked}` without checking `isUsed`. A child could still click or drag an already-placed dot, resulting in dragging "ghost" dots or placing duplicate counters.
   - *Fix:* Passed `disabled={locked || isUsed}` and guarded `onSelect` with `!isUsed`, matching the pattern used in `NumberSentenceDrop.tsx`.
2. **`src/features/results/ResultsScreen.tsx` (SessionStorage Sandbox Guard)**
   - *Issue:* `sessionStorage.getItem()` and `sessionStorage.setItem()` were executed directly without a `try/catch` guard. In strict private browsing modes, sandboxed iframes, or environments where storage is blocked, this threw an unhandled exception upon completing a lesson.
   - *Fix:* Wrapped the session-tracking read/write in a `try/catch` block, matching `src/lib/storage.ts`.

Both patches compile clean with zero errors, passing all tests and linting.

---

## 3. What Works Well

- **Strict Adherence to Architecture:** Zero unauthorized dependencies introduced. Only `react-router-dom`, `@dnd-kit/core`, and `vitest` were installed. No CSS frameworks, state management libraries, or component kits were slipped in.
- **Dual Input Reliability:** Implementing tap-to-place in parallel with drag-and-drop was executed properly. A child lacking fine motor drag control on a touchscreen or trackpad can tap a counter or number tile and tap the target box to place it.
- **Defensive Persistence:** `src/lib/storage.ts` thoroughly validates stored JSON, verifies schema versioning, and fails gracefully to default progress rather than crashing the application.
- **Kid-Centric Tone & Microcopy:** No negative or punishing words ("wrong", "failed", "incorrect") exist anywhere in the user-facing interface. Incorrect inputs show encouraging hints ("Not yet — try again!"), and every child who completes a session earns at least one star.
- **Clean Unit Testing:** `src/lib/grading.test.ts` and `src/lib/shuffle.test.ts` provide 16 passing Vitest unit tests verifying star thresholds, pure immutability of shuffles, and arithmetic checks for missing sums, missing addends, and ten-frame totals.
- **Self-Contained Scalable Graphics:** Critters (frogs, apples, stars, fish) and mascot moods are rendered via crisp, inline SVG components with no asset licensing or raster scaling issues.

---

## 4. Bugs & UX Risks for a 3rd Grader

### 4.1. Pedagogical Flaw: Skipping Frame 1 in "Make a Ten"
- **Risk:** In `ten-frame-build` exercises with totals exceeding 10 (e.g. `7 + 5 = 12`), both Frame 1 (7 pre-filled dots, 3 empty) and Frame 2 (10 empty) are displayed. The code allows a child to drop counters into Frame 2 *before* Frame 1 is filled, or place dots scattered randomly across both frames.
- **Why It Matters:** The entire pedagogical concept of "Make a Ten" is teaching children that 7 needs 3 to make a full 10, and then the remaining 2 go into the second frame. Allowing dots to be placed in Frame 2 while Frame 1 has empty boxes undermines the foundational math strategy.
- **Recommendation:** Prevent placing or dropping dots into Frame 2 until Frame 1 is completely filled (all 10 cells occupied).

### 4.2. Ten-Frame Minimum Width Exceeds 360px Viewport
- **Risk:** In `src/components/TenFrame/TenFrame.module.css`, `.frame` defines:
  ```css
  grid-template-columns: repeat(5, minmax(var(--slot-min), 1fr));
  gap: 6px;
  padding: 8px;
  border: 4px solid var(--c-ink);
  ```
  With `--slot-min: 64px`, the minimum width of the frame grid is:
  \[
  (5 \times 64\text{px}) + (4 \times 6\text{px}) + (2 \times 8\text{px}) + (2 \times 4\text{px}) = 320 + 24 + 16 + 8 = 368\text{px}
  \]
  However, on a 360px mobile viewport with `<main>` having 16px horizontal padding (`padding: var(--space-4)`), the available width is only `328px`.
- **Result:** On a 360px screen, the ten-frame overflows horizontally by 40px, causing unwanted horizontal scroll or clipping of the rightmost boxes.
- **Recommendation:** Allow cell sizes on narrow screens (< 400px) to scale down to 56px (e.g., `minmax(56px, 1fr)`), which yields a total width of `328px` and fits cleanly on 360px screens while still meeting the 56px minimum touch target size.

### 4.3. Tap-to-Place Tile Swap Inefficiency in `NumberSentenceDrop`
- **Risk:** In `src/features/practice/exercises/NumberSentenceDrop/NumberSentenceDrop.tsx`:
  ```tsx
  function handleSlotTap() {
    if (locked) return;
    if (placed !== null) {
      setPlaced(null);
      setSelected(null);
      setWarn(false);
      return;
    }
    if (selected !== null) {
      setPlaced(selected);
      setSelected(null);
    }
  }
  ```
  If slot currently holds tile `8`, and the child taps tile `9` in the tray (so `selected === 9`) and taps the slot to swap them:
  Because `placed !== null` is evaluated first, it clears `8` and resets `selected = null`. Tile `9` is not placed. The child must tap tile `9` a second time and tap the empty slot again.
- **Recommendation:** Check `if (selected !== null)` first: if a tile is currently selected, clicking the slot should immediately replace `placed` with `selected` (swapping the old tile back to the tray).

### 4.4. Missing Number Sentence Completion Visual on Ten-Frame
- **Risk:** `docs/MVP_SPEC.md` §3.B states: *"The exercise self-submits when the filled count equals answer: the frame pulses green and the prompt's number sentence completes itself."*
  Currently, when the ten-frame reaches the target count, the frame pulses green, but the heading remains the original prompt ("7 dots are in. Add 3 more!"). It never transforms into `7 + 3 = 10`.
- **Recommendation:** When `solved` is true, display the completed equation prominently above the frame before advancing.

### 4.5. Tray Consumption Direction vs. Selection
- **Risk:** In `TenFrameBuild.tsx`, `usedDots = placed.length`, and dots are faded by index (`index < usedDots`). If a child drags or taps the rightmost dot in the tray (e.g. dot 3), the rightmost dot stays visible while the leftmost dot (dot 0) disappears from the tray.
- **Recommendation:** Hide or consume the specific dot that was tapped or dragged, rather than always hiding from index 0.

---

## 5. Accessibility Gaps

### 5.1. Color Contrast Failure on Warning / Hint Banner
- **Gap:** In `src/components/FeedbackBanner/FeedbackBanner.module.css`, the warning banner uses:
  ```css
  .warn p {
    background: #fff3dc;
    color: var(--c-warn); /* #e8871a */
  }
  ```
  The calculated contrast ratio between `#e8871a` and `#fff3dc` is **2.41:1**.
  WCAG 2.1 AA requires at least **4.5:1** for body text. For an 8–9 year old child with visual impairments or on a low-brightness tablet screen, amber text on pale yellow is washed out and difficult to read.
- **Recommendation:** Use a dark amber or rich ink color for the hint text (e.g., `#78350f` or `#1f2933`) over `#fff3dc`, with an amber accent border or icon. Text `#78350f` on `#fff3dc` provides a contrast ratio of **7.2:1**, comfortably exceeding AA standards.

### 5.2. Mathematical Operators Hidden from Screen Readers
- **Gap:** In `NumberSentenceDrop.tsx`:
  ```tsx
  <span className={styles.op} aria-hidden="true">+</span>
  <span className={styles.op} aria-hidden="true">=</span>
  ```
  And in `CountObjects.tsx`:
  ```tsx
  <span className={styles.plus} aria-hidden="true">+</span>
  ```
  The mathematical operators (`+` and `=`) have `aria-hidden="true"`. A screen reader reading through the children announces:
  `"4"` ... `"Answer box, empty"` ... `"7"`.
  The child using a screen reader is never informed that the operation is addition or equality.
- **Recommendation:** Remove `aria-hidden="true"` and give explicit labels, e.g., `<span className={styles.op} aria-label="plus">+</span>` and `<span className={styles.op} aria-label="equals">=</span>`, or provide a full `aria-label` on the sentence container (e.g., `"4 plus blank equals 7"`).

### 5.3. Missing Announcement on Repeated Incorrect Attempts
- **Gap:** In `PracticeScreen.tsx`, feedback is placed inside `<div aria-live="polite">`. On an initial wrong attempt, the hint text `"Not yet — try again! [hint]"` is inserted and announced. If the child submits a *second* incorrect answer on the same question, the text string does not change. Because the DOM text content is identical, the screen reader does not re-announce the alert.
- **Recommendation:** Ensure repeated incorrect submissions trigger an announcement (e.g., by prepending an attempt counter, cycling text, or temporarily clearing and restoring the message).

### 5.4. Focus Announcement on Step Changes in `LessonScreen`
- **Gap:** In `App.tsx`, focus is shifted to `#page-heading` whenever `location.pathname` changes. In `LessonScreen.tsx`, clicking "Next" or "Back" updates the internal `step` state (0 -> 1 -> 2) without changing the URL. As a result, focus remains on the "Next" button, and keyboard or screen reader users are not directed to the new step's heading or illustration.
- **Recommendation:** Trigger `#page-heading.focus()` on `step` state changes as well as route changes.

---

## 6. Code Quality & Maintainability Notes

- **Clean Types & Discriminated Unions:** The `Exercise` discriminated union across `count-objects`, `ten-frame-build`, and `number-sentence-drop` is clean. `ExerciseRenderer` enforces exhaustive checking via `const _never: never = exercise;`.
- **Pure Helpers:** `src/lib/shuffle.ts` and `src/lib/grading.ts` are pure, predictable, and avoid in-place mutations. The forbidden `Array.prototype.toSorted` was avoided; copies are created with `[...arr].sort(...)`.
- **Dead Code in `dotState`:** In `PracticeScreen.tsx` line 99:
  ```tsx
  if (index < state.results.length) {
    return state.results[index]?.attempts === 1 ? 'first-try' : 'retried';
  }
  if (index === state.index && state.phase === 'correct') {
    return state.results[index]?.attempts === 1 ? 'first-try' : 'retried';
  }
  ```
  Because `sessionReducer` appends to `state.results` immediately upon `ANSWER { correct: true }`, `index < state.results.length` is already true when `state.phase === 'correct'`. The second check is redundant and can be removed.
- **Audio Context Scheduled Ramp:** In `src/lib/sound.ts`, `gain.gain.exponentialRampToValueAtTime(0.001, now + duration)` is called after setting `gain.gain.value = 0.07`. Standard WebAudio implementations recommend calling `gain.gain.setValueAtTime(0.07, now)` before scheduling the exponential ramp to prevent audio glitches on some browsers.

---

## 7. Prioritized Recommendations for Implementer

### P0 (Must Fix)
1. **Fix TenFrame Sizing for 360px Viewports:**
   - In `TenFrame.module.css`, adjust `.frame` column sizing on screens below 400px so slot width scales to 56px (`minmax(56px, 1fr)`). This eliminates the 40px overflow and prevents horizontal scrolling on small phones.
2. **Fix Color Contrast on Feedback Banner:**
   - In `FeedbackBanner.module.css`, change text color for `.warn p` to `#78350f` (or `#1f2933`) so contrast against `#fff3dc` reaches 7.2:1 (well above the 4.5:1 AA requirement).
3. **Expose Math Operators to Screen Readers:**
   - In `NumberSentenceDrop.tsx` and `CountObjects.tsx`, remove `aria-hidden="true"` from `+` and `=` signs and provide clear labels (`aria-label="plus"`, `aria-label="equals"`).
4. **Enforce Sequential Frame Filling in "Make a Ten":**
   - In `TenFrameBuild.tsx`, disable drop targets in Frame 2 until Frame 1 contains 10 dots, reinforcing the pedagogical rule of filling the first ten-frame before overflowing.

### P1 (Should Fix)
1. **Smooth Tap-to-Place Swapping:**
   - In `NumberSentenceDrop.tsx`, update `handleSlotTap` so if `selected !== null`, clicking a filled slot immediately replaces the placed tile with the selected tile.
2. **Display Completed Equation on Ten-Frame Success:**
   - In `TenFrameBuild.tsx`, display `addends[0] + addends[1] = answer` in large type when the frame is completed, fulfilling the spec.
3. **Focus Heading on Lesson Step Changes:**
   - In `LessonScreen.tsx`, trigger focus on `#page-heading` whenever `step` increments or decrements.
4. **Prevent Equation Breaking on Mobile:**
   - In `NumberSentenceDrop.module.css`, add `flex-wrap: nowrap` or responsive container queries to `.sentence` so `5 + 4 = [ ]` stays on one line rather than splitting across rows on narrow devices.
5. **Re-announce Consecutive Hints:**
   - In `PracticeScreen.tsx`, ensure consecutive incorrect attempts trigger a fresh announcement in the live region.

### P2 (Nice to Have)
1. **WebAudio Scheduling Hardening:**
   - In `src/lib/sound.ts`, add `gain.gain.setValueAtTime(0.07, now)` prior to `exponentialRampToValueAtTime`.
2. **Mascot Mood Refinement:**
   - In `PracticeScreen.tsx`, set mascot mood to `'idle'` on fresh questions and `'think'` after a retry, giving a distinct visual reaction during retries.
3. **Celebration Polish:**
   - Add a subtle confetti burst or visual ripple when earning 3 stars on the Results screen.

---

## 8. Demo Checklist (Review of Grok's Demo Steps)

Grok provided 5 demo steps in `docs/IMPLEMENTATION_NOTES.md`. Here is the verification and guidance for reviewers:

| Step | Action | Expected Behavior | Status | Reviewer Notes |
| :--- | :--- | :--- | :--- | :--- |
| **1. Map** | Open `/` | 3 lesson cards visible, best stars at 0, "Sound off" in header. | **CONFIRMED** | Clean layout, responsive cards, start-over confirm dialog works. |
| **2. Lesson 1** | Open "Add with Pictures", walk steps, enter practice. | 3 illustrated steps. Practice shows critters. Tapping toggles checkmarks. Wrong answer shows amber hint; correct answer auto-advances. | **CONFIRMED** | Critter checkmark counting aid works cleanly. Verify contrast fix for amber text. |
| **3. Results & Reload** | Finish Lesson 1, view results, click "Back to map", refresh page. | Stars appear on Results screen; card on map displays earned stars; reload persists stars. | **CONFIRMED** | Key `addai.progress.v1` in `localStorage` properly survives hard reloads. |
| **4. Lesson 2** | Open "Make a Ten". Test drag and tap-to-place. | Dots drop into ten-frame. Replay to test 12-sum (`7+5`, `8+4`, or `6+6`) for two frames. "I'm done" early refills tray with hint. | **CONFIRMED WITH CAVEAT** | Drag targeting fix works. Ensure reviewer tests both tap-to-place and drag. Note that Frame 1 should ideally be filled before Frame 2. |
| **5. Lesson 3** | Open "Number Sentences". Test drag, tap-to-place, keyboard navigation. | Drag or tap tile into blank. "Check it!" evaluates. Wrong tile snaps back with hint. Tab + Space lifts and drops tile. | **CONFIRMED** | Test both missing sum (`5 + 4 = ?`) and missing addend (`? + 5 = 13`). Test keyboard navigation via Tab and Space. |
