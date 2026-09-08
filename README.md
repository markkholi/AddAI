# AddAI

**AddAI** is a small web app that teaches a 3rd grader (roughly 8–9 years old) how to add
numbers. It leans on pictures instead of paragraphs: countable objects, ten-frames,
base-10 blocks, and drag-and-drop practice where the child builds the number sentence
with their hands instead of typing an answer.

The tone is playful and encouraging. Nothing is timed, nothing scolds, and a wrong answer
just gets a friendly nudge and another try.

## Status

Phase 1 (planning) is complete. **There is no runnable app in this repo yet** — no
`package.json`, no `src/`. What exists today is the plan that the implementation phase
will follow:

| Document | What's in it |
| --- | --- |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Tech stack, folder layout, screens and flows, state model, how drag-and-drop works, kid accessibility rules |
| [`docs/MVP_SPEC.md`](docs/MVP_SPEC.md) | The concrete MVP: three lessons, three exercise types, question banks, stars and scoring |
| [`docs/HANDOFF_TO_IMPLEMENTER.md`](docs/HANDOFF_TO_IMPLEMENTER.md) | The build brief: exact dependencies, file-by-file checklist, constraints, definition of done |

## About this repo

This is a **multi-model vibe-code proof of concept**. The work is deliberately split
across different AI models, each doing one phase and handing off to the next through the
docs in `docs/`:

1. **Phase 1 — plan and architecture (Claude).** Wrote the documents above. No feature code.
2. **Phase 2 — implementation (Grok).** Scaffolds the Vite app and builds the MVP by
   following `docs/HANDOFF_TO_IMPLEMENTER.md`.
3. **Later phases —** polish, QA, and whatever the POC turns out to need.

The point of the exercise is partly the app and partly the handoff itself: can one model
hand a second model a brief precise enough that the second one doesn't have to guess?
So the specs are more prescriptive than a normal design doc would be, and the
implementer is explicitly asked not to substitute a different architecture.

## Running it locally (after Phase 2 lands)

The app will be a standard Vite project at the repo root, so the usual commands apply.
Node 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts the implementer is asked to provide:

```bash
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
npm run lint       # eslint
```

There is no backend, no database, no API keys, and no sign-in. Progress (stars per
lesson) is saved in the browser's `localStorage`, so clearing site data resets it.

## Non-goals for the POC

No accounts or logins, no teacher/parent dashboard, no server-side anything, no
analytics, no subtraction or multiplication, and no attempt at production hosting. See
`docs/MVP_SPEC.md` for the full out-of-scope list.
