# AddAI — MVP Specification

The concrete contents of the first pass: three lessons, three exercise types, fixed
question banks, and the star rules. Architecture lives in
[`ARCHITECTURE.md`](ARCHITECTURE.md); the build checklist lives in
[`HANDOFF_TO_IMPLEMENTER.md`](HANDOFF_TO_IMPLEMENTER.md).

Content in this document is authoritative. It's already checked for arithmetic and
for difficulty progression — copy it into `src/data/` as written rather than
generating new questions.

---

## 1. Learner and scope

One learner profile: a 3rd grader, ~8–9 years old, who can count reliably to 20 and is
learning addition facts and the make-a-ten strategy. Reads simple sentences slowly, so
instruction is carried by pictures.

Addition only. Sums stay within 20. No negative numbers, no subtraction, no regrouping
of two-digit numbers.

---

## 2. Lessons

Three lessons, ordered by difficulty but **not locked** — any lesson is playable from the
map at any time.

| # | `id` | Title | Card subtitle | Icon | Teaches | Exercise kind |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `add-with-pictures` | Add with Pictures | "Count the critters!" | 🐸 | Counting two groups to find a total, sums to 10 | `count-objects` |
| 2 | `make-a-ten` | Make a Ten | "Fill the frame!" | 🔟 | Ten-frames, making 10, crossing 10 | `ten-frame-build` |
| 3 | `number-sentences` | Number Sentences | "Build the math!" | ➕ | Reading `a + b = c`, finding a missing part, sums to 20 | `number-sentence-drop` |

Each lesson holds one exercise kind in the MVP. That keeps every practice set coherent
and keeps the implementation surface small.

### Teach steps

Every lesson opens with three steps. A step is one illustration plus a heading and one
short sentence. No step exceeds ~15 words of body copy.

**Lesson 1 — Add with Pictures**

1. **"Two groups of frogs!"** — 3 frogs, a plus sign, 2 frogs. *"Adding means putting groups together."*
2. **"Count them all."** — the same 5 frogs in one row, each with a small number 1–5 above it. *"Point at each frog and count: 1, 2, 3, 4, 5."*
3. **"That's 3 + 2 = 5!"** — the number sentence in big tiles under the frogs. *"Five frogs altogether. You added!"*

**Lesson 2 — Make a Ten**

1. **"This is a ten-frame."** — an empty 2×5 frame. *"Ten boxes. Two rows of five."*
2. **"Fill it up."** — 7 dots filled, 3 empty cells glowing. *"7 dots. How many boxes are empty?"*
3. **"7 + 3 = 10!"** — the frame full, sentence below. *"A full frame is always ten."*

**Lesson 3 — Number Sentences**

1. **"Math has sentences too."** — `4 + 3 = 7` in big labelled tiles. *"Plus means add. Equals means 'is the same as'."*
2. **"Sometimes a part is hiding."** — `4 + ? = 7`, blank pulsing. *"What number is hiding here?"*
3. **"Drag a tile to fill it in."** — a hand cursor moving the `3` tile into the blank. *"Try one? Tap or drag — both work!"*

---

## 3. Exercise types

Three types. Type B is the visual objects / base-10 exercise; type C is the
drag-and-drop number sentence.

### A. `count-objects` — tap the total

**Visual.** Two clusters of SVG critters (frog / apple / star / fish) separated by a big
`+`. Clusters are laid out in rows of up to five so they're countable at a glance rather
than scattered.

**Interaction.** Tapping an individual critter toggles a small checkmark badge on it —
a counting aid, never graded, resettable. The answer is given by tapping one of 3–4 big
number choices. Tapping a choice submits immediately (no "Check it!" button).

**Feedback.** Correct: chosen choice turns green with a checkmark, mascot cheers.
Wrong: the choice shakes and greys out, hint appears, remaining choices stay live.

**Bank (lesson 1) — pick 5 of 8 at random:**

| id | groups | icon | choices | answer | hint |
| --- | --- | --- | --- | --- | --- |
| `l1-q1` | 3 + 2 | frog | 4, 5, 6 | 5 | "Count every frog out loud: 1, 2, 3, 4, 5." |
| `l1-q2` | 4 + 3 | apple | 6, 7, 8 | 7 | "Start at 4, then count 3 more: 5, 6, 7." |
| `l1-q3` | 2 + 2 | star | 3, 4, 5 | 4 | "Two and two more. Count them all." |
| `l1-q4` | 5 + 4 | fish | 8, 9, 10 | 9 | "Start at 5 and count on: 6, 7, 8, 9." |
| `l1-q5` | 1 + 6 | frog | 6, 7, 8 | 7 | "One more than 6 is 7." |
| `l1-q6` | 6 + 2 | apple | 7, 8, 9 | 8 | "Start at 6: 7, 8." |
| `l1-q7` | 3 + 3 | star | 5, 6, 7 | 6 | "Doubles! 3 and 3 is 6." |
| `l1-q8` | 4 + 5 | fish | 8, 9, 10 | 9 | "Start at 5 and count on 4 more." |

### B. `ten-frame-build` — fill the frame (visual / base-10)

**Visual.** A 2×5 ten-frame with `addends[0]` cells pre-filled in blue. Below it, a tray
holding loose dots. When the total exceeds 10, a second empty frame appears to the right
of the first and the child continues into it — the visual that makes "making a ten" click.

**Interaction.** Drag a dot from the tray into any empty cell, or tap a dot then tap a
cell. Dots dropped outside a cell snap back to the tray. Tapping a placed dot returns it
to the tray. The exercise **self-submits** when the filled count equals `answer`: the
frame pulses green and the prompt's number sentence completes itself. There is no
"Check it!" button, because the manipulative is the answer.

A wrong attempt only happens if the child runs the tray empty at the wrong count or
presses the "I'm done" affordance early — keep it simple: if the tray empties and the
count is wrong, show the hint and refill the tray.

**Bank (lesson 2) — pick 5 of 8 at random:**

| id | addends | answer | prompt | hint |
| --- | --- | --- | --- | --- |
| `l2-q1` | 7 + 3 | 10 | "7 dots are in. Add 3 more!" | "Fill every empty box. A full frame is 10." |
| `l2-q2` | 6 + 4 | 10 | "6 dots are in. Add 4 more!" | "Count the empty boxes first." |
| `l2-q3` | 8 + 2 | 10 | "8 dots are in. Add 2 more!" | "Only two boxes are empty." |
| `l2-q4` | 5 + 5 | 10 | "5 dots are in. Add 5 more!" | "One whole row is 5. Fill the other row." |
| `l2-q5` | 9 + 1 | 10 | "9 dots are in. Add 1 more!" | "Just one box left!" |
| `l2-q6` | 7 + 5 | 12 | "7 dots are in. Add 5 more!" | "Fill this frame to 10, then start the next one." |
| `l2-q7` | 8 + 4 | 12 | "8 dots are in. Add 4 more!" | "2 dots finish this frame. Where do the other 2 go?" |
| `l2-q8` | 6 + 6 | 12 | "6 dots are in. Add 6 more!" | "4 more makes 10, then 2 more makes 12." |

### C. `number-sentence-drop` — build the sentence (drag-and-drop)

**Visual.** The sentence as large tiles with one empty slot, e.g. `5 + 4 = [ ]` or
`7 + [ ] = 10`. The empty slot has a dashed outline and a gentle pulse. A tray below
holds the correct tile plus two distractors (off-by-one, or the other addend, which are
the mistakes kids actually make).

**Interaction.** Drag a tile into the slot, or tap tile → tap slot. The slot holds one
tile; dropping a second tile swaps and returns the first to the tray. Nothing is graded
until "Check it!" — which is disabled while the slot is empty. Wrong: the tile flies back
to the tray, the slot pulses amber, the hint appears.

**Bank (lesson 3) — pick 5 of 8 at random.** `null` marks the blank; `template` is
`[a, b, sum]`.

| id | template | answer | tiles | hint |
| --- | --- | --- | --- | --- |
| `l3-q1` | 5 + 4 = ? | 9 | 8, 9, 10 | "Start at 5 and count on 4: 6, 7, 8, 9." |
| `l3-q2` | 7 + ? = 10 | 3 | 2, 3, 4 | "How many more to get from 7 to 10?" |
| `l3-q3` | 6 + 6 = ? | 12 | 11, 12, 13 | "Doubles! 6 and 6." |
| `l3-q4` | ? + 5 = 13 | 8 | 7, 8, 9 | "13 take away 5. Count back from 13." |
| `l3-q5` | 9 + 4 = ? | 13 | 12, 13, 14 | "9 + 1 is 10, then 3 more." |
| `l3-q6` | 8 + ? = 15 | 7 | 6, 7, 8 | "8 needs 2 to make 10, then 5 more to 15." |
| `l3-q7` | 10 + 7 = ? | 17 | 16, 17, 18 | "Ten and seven. The 7 just moves over." |
| `l3-q8` | ? + 9 = 14 | 5 | 4, 5, 6 | "Count on from 9 up to 14." |

---

## 4. Practice sessions, scoring, and stars

- A practice set is **5 questions**, drawn without replacement from that lesson's bank of
  8 at session start. The set is fixed once the screen mounts.
- **Unlimited retries** per question. The child cannot fail out or get stuck.
- A question counts as **first-try correct** only when answered correctly on attempt 1.
- Stars for the set:

| First-try correct (of 5) | Stars | Results message |
| --- | --- | --- |
| 5 | ★★★ | "Perfect! You're an adding superstar!" |
| 4 | ★★☆ | "So close to perfect — awesome job!" |
| 2–3 | ★☆☆ | "Nice work! You're getting stronger." |
| 0–1 | ★☆☆ | "You finished! Every try makes you better." |

Finishing always earns at least one star. Only a child's **best** stars per lesson are
kept, so replaying can improve a score but never lowers it.

`ProgressDots` in the practice header show, per question: pending (grey outline),
first-try correct (green filled), correct after retries (blue filled). Nothing is ever
marked as simply "wrong".

---

## 5. Look and feel

Playful but readable. Bright saturated primaries on a warm off-white background, thick
rounded corners (16–24 px), chunky drop shadows, no gradients-on-gradients.

Suggested tokens for `src/styles/tokens.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--c-bg` | `#FFF8EE` | page background |
| `--c-surface` | `#FFFFFF` | cards, tiles |
| `--c-ink` | `#1F2933` | body text |
| `--c-primary` | `#2F6FED` | buttons, filled dots |
| `--c-accent` | `#FFB020` | stars, highlights |
| `--c-success` | `#1F9D55` | correct feedback |
| `--c-warn` | `#E8871A` | "not yet" feedback (amber, never red) |
| `--c-slot` | `#CBD2D9` | empty slot outline |
| `--r-lg` / `--r-xl` | `16px` / `24px` | radii |
| `--space-1..6` | `4, 8, 12, 16, 24, 32 px` | spacing scale |
| `--tap-min` | `56px` | minimum interactive size |
| `--dur-fast` / `--dur-slow` | `150ms` / `400ms` | transitions |

**Mascot.** One SVG character (a friendly frog named Addy is fine) with four moods:
`idle`, `think`, `cheer`, `oops`. It appears on lesson, practice, and results screens and
reacts to feedback. Mood swaps are CSS-only; no sprite sheets, no animation library.

**Responsive.** Mobile-first, single column, must work at 360 px wide and be genuinely
comfortable at 390×844. Above 768 px the map goes two-up and the practice area centres at
a max width of ~720 px. Landscape phone must not cut off the footer button — the practice
layout puts the primary action in a sticky footer.

**Microcopy rules.** Second person, present tense, exclamation points are fine.
Never "wrong", "incorrect", or "failed" — use "Not yet!" and "Try again!". Never
"you lost". No irony or sarcasm; an 8-year-old reads it literally.

---

## 6. No accounts, no backend

Nothing in this MVP needs a server, so there isn't one. No sign-in, no name entry, no
profile, no cloud sync, no analytics, and no network requests at runtime beyond loading
the app itself. Progress is one `localStorage` key, `addai.progress.v1`, and clearing
site data resets everything. A "Start over" link on the map (behind a confirm dialog)
does the same on purpose.

This also keeps the POC clear of children's-privacy questions entirely, which is a
feature.

---

## 7. Out of scope for the MVP

Accounts and profiles, any server or database, teacher/parent dashboards, printable
worksheets, analytics or telemetry, translations, subtraction/multiplication/division,
adaptive difficulty, timed modes or leaderboards, PWA/offline support, real audio assets,
and deployment/hosting.

## 8. Stretch ideas — only after the core loop is complete

1. Lesson 4, "Adding Tens": base-10 rods and unit cubes, `23 + 10`-style problems.
2. Real sound effects behind the existing mute toggle.
3. A confetti burst on a three-star result.
4. A fourth exercise kind: a number line where the child drags a hop marker.
5. A printable "Addition Champion" certificate.

Do not start any of these until every item in the definition of done is met.
