# Implementation notes (Phase 2)

Built the Vite + React + TypeScript MVP exactly as specified in
`HANDOFF_TO_IMPLEMENTER.md`. No backend, no extra libraries beyond
`react-router-dom`, `@dnd-kit/core`, and Vitest.

## What to run

```bash
npm install
npm run dev        # http://localhost:5173
npm run test
npm run build
```

Sound starts **off**. Use the header toggle if you want blips.

## How to demo (for the next reviewer)

1. **Home / Adventure Map** — three unlocked lesson cards, stars at 0.
2. **Lesson 1, Add with Pictures** — walk the three teach steps, then practice.
   Tap critters to check them off (counting aid). Tap a number to answer.
   Try a wrong number first to see the amber “Not yet” hint, then the right one.
3. **Lesson 2, Make a Ten** — drag (or tap-to-place) dots into the ten-frame.
   Replay until you get a 12-sum (`7+5`, `8+4`, or `6+6`) so the **second frame**
   appears. “I’m done” early shows the hint and refills the tray.
4. **Lesson 3, Number Sentences** — drag a tile into the blank, or tap tile then
   tap the blank. “Check it!” grades. Covers missing sum *and* missing addend.
   Keyboard: Tab to a tile, Space to lift, arrows, Space to drop.
5. **Results** — stars + message. **Back to map**, reload the page: stars persist.
   **Start over** on the map (confirm) clears them.

Progress lives in `localStorage` key `addai.progress.v1`.

## Small deviations

- `tsconfig.app.json` exists so `tsc -b` works (Vite 5 template). Not a stack change.
- `messageForStars` takes an optional first-try count so the two different 1-star
  messages in the MVP spec can both be used.
- Session results are passed to the results screen via router location state, with
  a `sessionId` so React StrictMode cannot record the same run twice.
