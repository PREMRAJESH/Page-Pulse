# Startup Prompt — paste this first, in a fresh session

I'm building "Page Pulse" for a scored internship qualification task. Before
writing any code, read every file in `.ai/` in this order:

1. `.ai/23_AI_RULES.md` — the operating rules for this whole session. Follow
   these over your own defaults if they ever conflict.
2. `.ai/00_PROJECT_CONTEXT.md` — what this is, who it's for, what's out of scope.
3. `.ai/01_PRODUCT_REQUIREMENTS.md` and `.ai/02_FEATURE_SPECIFICATION.md` —
   the actual functional scope. Nothing outside this gets built.
4. `.ai/24_BUILD_ORDER.md` — the phase-by-phase sequence to follow. Do not
   skip ahead to UI before Phase 1's parsing logic is written and tested.
5. Everything else in `.ai/` (04 through 22, plus 25) is reference —
   pull in the relevant file for whatever phase you're on:
   - Writing the parsing function or API route → `05`, `09`, `12`, `13`, `14`
   - Writing UI → `07`, `08`, `16`
   - Writing tests → `17`
   - Writing the README → `22`
   - Checking if something is actually finished → `25_DEFINITION_OF_DONE.md`

## Ground rules for this session
- Don't invent fields, endpoints, or dependencies not listed in `.ai/`.
- Don't add anything from the "explicitly rejected" or "non-goals" lists in
  `00`/`04` — if you think one of them is actually necessary, say so and why,
  don't just add it.
- Follow `24_BUILD_ORDER.md`'s phases in order. After each phase, stop and
  tell me what you built and what you verified, before moving to the next.
- If the brief is ambiguous on something `01`'s "explicitly ambiguous points"
  section doesn't already cover, state your assumption out loud rather than
  picking one silently.
- `.ai/` is gitignored — it's my internal planning context, not part of the
  shipped repo. Don't reference it in code comments, the README, or anything
  that ships.

Start with Phase 1 of the build order: scaffold the project and write
`lib/audit/types.ts` and `lib/audit/analyze.ts`. Show me the plan for
`analyze.ts` before writing the test fixtures, so I can sanity-check the
field logic against `01`'s stated assumptions first.
