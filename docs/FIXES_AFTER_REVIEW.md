# Fixes after Phase 3 review (Phase 4)

Implemented the P0s and the clear P1s from `docs/REVIEW_GEMINI.md`. No stack or architecture changes.

## Fixed — P0

1. **Ten-frame 360px overflow.** `TenFrame.module.css` now uses `--cell-size` (64px by default, 56px below 400px) for both the grid and the cell min size, so a frame fits in the 328px content width of a 360px phone.
2. **Warning banner contrast.** Hint text is `--c-warn-ink` (`#78350f`) on `#fff3dc` (~7.2:1), with an amber border. Colour is no longer the only signal.
3. **Math operators for screen readers.** `+` and `=` in `CountObjects` and `NumberSentenceDrop` no longer have `aria-hidden`. They use `role="img"` plus `aria-label="plus"` / `"equals"`. The sentence container also has a spoken label (`"5 plus blank equals 9"`).
4. **Sequential Make-a-Ten.** Frame 2 stays dimmed and labelled “Fill the first frame first” until Frame 1 has 10 dots. Drops and taps on Frame 2 are rejected until then (`placeAt` blocks cells ≥ 10). Frame 2 cells stay in the dnd-kit hit list so a drop over the dimmed frame snaps back instead of `closestCenter` stealing the dot into Frame 1.

## Fixed — P1

1. **Tap-to-place swap.** Selecting a tray tile and tapping an occupied slot now replaces the placed tile in one tap.
2. **Completed equation.** When the ten-frame is solved, `7 + 3 = 10` (etc.) appears above the frames.
3. **Lesson step focus.** `LessonScreen` focuses `#page-heading` whenever the teach step changes, not only on route changes.
4. **Equation stays on one line.** `.sentence` is `flex-wrap: nowrap`; tiles stay ≥56px on narrow screens.
5. **Repeated hints announce.** A second miss appends `Keep going — try N.` so the live region text changes and is re-read.

## Also done (trivial P2)

- WebAudio: `setValueAtTime` before the fade-out ramp.
- Mascot is `idle` on a fresh question and `think` after a retry.

## Deferred

- **P2 confetti** on a three-star result — polish only.
- **Tray consumption by specific dot** (review §4.5) — not in the P0/P1 list; left as-is so a used count still fades dots from the left.

## How to verify

```bash
npm install
npm run test
npm run lint
npm run build
npm run dev        # http://localhost:5173
```

On a 360px-wide viewport: open **Make a Ten**, confirm the frame does not scroll sideways. On a 12-sum, confirm Frame 2 stays dim until Frame 1 is full, then accepts dots. Wrong answers should show dark-brown hint text on pale amber. In Number Sentences, tap tile A, tap the blank, tap tile B, tap the blank — B should replace A in one step.
