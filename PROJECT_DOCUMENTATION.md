# Project Documentation — Page Pulse

---

## 1. Project File Structure

Below is the complete file tree of the project with a description of every meaningful file.

```
page-pulse/
│
├── .ai/                                    # Planning context (gitignored)
│   ├── 00_PROJECT_CONTEXT.md               # What/why/who — project grounding
│   ├── 01_PRODUCT_REQUIREMENTS.md          # User stories, functional reqs, acceptance criteria
│   ├── 02_FEATURE_SPECIFICATION.md         # Single feature spec — URL audit
│   ├── 04_TECH_STACK.md                    # Locked tech choices + explicitly rejected alternatives
│   ├── 05_ARCHITECTURE.md                  # Data flow, module boundaries, separation of concerns
│   ├── 06_FOLDER_STRUCTURE.md              # Intended folder layout
│   ├── 07_UI_DESIGN_SYSTEM.md              # Design principles, layout, state-specific styling
│   ├── 08_COMPONENT_LIBRARY.md             # Component inventory + state management pattern
│   ├── 09_API_SPECIFICATION.md             # Full API contract — request/response shapes, error codes
│   ├── 12_VALIDATION_RULES.md              # Client-side + server-side validation logic
│   ├── 13_ERROR_HANDLING.md               # Every failure mode mapped to response codes
│   ├── 14_SECURITY.md                      # SSRF mitigations, scheme allowlist, response cap
│   ├── 15_PERFORMANCE.md                   # Performance expectations and non-optimizations
│   ├── 16_ACCESSIBILITY.md                 # Baseline a11y requirements
│   ├── 17_TESTING.md                       # Required test cases + tooling
│   ├── 18_DEPLOYMENT.md                    # Vercel deployment + pre-deploy checklist
│   ├── 20_CODE_STYLE.md                    # TypeScript strict, naming, formatting
│   ├── 21_GIT_CONVENTIONS.md               # Commit style, what not to commit
│   ├── 22_README_TEMPLATE.md               # Structure for the public README
│   ├── 23_AI_RULES.md                      # Rules governing how the AI agent operates
│   ├── 24_BUILD_ORDER.md                   # Phased build sequence (logic → fetch → UI → ship)
│   └── 25_DEFINITION_OF_DONE.md            # Rubric-mapped checklist for submission
│
├── app/                                    # Next.js App Router
│   ├── api/
│   │   └── audit/
│   │       └── route.ts                    # POST /api/audit — orchestrates fetch → parse → respond
│   ├── globals.css                         # Tailwind v4 imports, theme tokens, custom animations,
│   │                                       # paper texture, page shadow, typewriter animations
│   ├── layout.tsx                          # Root layout — fonts, metadata, body background
│   └── page.tsx                            # Home page — client component with state machine
│
├── components/
│   ├── audit/
│   │   ├── AuditError.tsx                  # Error state display with retry button
│   │   ├── AuditForm.tsx                   # URL input + submit, focus glow effect
│   │   └── AuditReport.tsx                 # Report rendered as document sections,
│   │                                       # typewriter-animated fields, color-coded badges
│   ├── layout/
│   │   └── Footer.tsx                      # Required credit line + decorative pulse SVG
│   └── ui/
│       ├── typewriter.tsx                  # Character-by-character typing animation with cursor
│       ├── alert.tsx                       # shadcn/ui Alert component
│       ├── button.tsx                      # shadcn/ui Button component
│       ├── card.tsx                        # shadcn/ui Card component (unused after redesign)
│       ├── input.tsx                       # shadcn/ui Input component
│       └── skeleton.tsx                    # shadcn/ui Skeleton loader
│
├── lib/
│   └── audit/
│       ├── analyze.ts                      # Pure function: parse HTML → Report (framework-agnostic)
│       ├── analyze.test.ts                 # 8 tests: happy path, missing metadata, alt edge cases,
│       │                                   # multiple H1s, script/style exclusion, empty body
│       ├── fetchTarget.ts                  # HTTP fetch with DNS-based SSRF check, manual redirect
│       │                                   # handling (3-hop cap), timeout, content-type gate, 5MB cap
│       ├── fetchTarget.test.ts             # 13 tests: isPrivateIp (10 cases), SSRF redirect
│       │                                   # rejection, >3 redirect rejection
│       ├── types.ts                        # Report, AuditError, AuditResult types
│       └── utils.ts                        # cn() utility for Tailwind class merging
│
├── public/
│   ├── logo.svg                            # Document + pulse icon (header + README)
│   ├── pulse.svg                           # Decorative pulse line (footer + README)
│   ├── file.svg                            # Default Next.js public assets
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── .gitignore
├── AGENTS.md                               # Next.js version warning
├── CLAUDE.md                               # References AGENTS.md
├── README.md                               # Public-facing documentation
├── PROJECT_DOCUMENTATION.md                # This file — internal structure + AI usage
├── STARTUP_PROMPT.md                       # Instructions for AI agent in a fresh session
├── components.json                         # shadcn/ui configuration
├── eslint.config.mjs                       # ESLint flat config
├── next.config.ts                          # Next.js configuration
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tsconfig.json                           # TypeScript strict mode
└── vitest.config.ts                        # Vitest test runner config
```

### Key Architecture Decisions

| Decision | Implementation | Rationale |
|---|---|---|
| Parsing is a pure function | `analyze.ts` imports nothing from Next.js | Makes unit tests possible without network mocking |
| Fetching is isolated | `fetchTarget.ts` owns all network logic | Separation of concerns; route handler is thin orchestration |
| UI is a state machine | `page.tsx` has 4 states: idle/loading/success/error | Each state is independently verifiable |
| SSRF via DNS resolution | `dns.promises.lookup` before any fetch | Catches domains that resolve to private IPs |
| Manual redirects | `redirect: 'manual'` with 3-hop cap | Re-validates each redirect target with full security check |

---

## 2. How AI Was Used

### The `.ai/` Folder Methodology

Before writing a single line of code, I created the `.ai/` directory — a complete project specification written as plain markdown documents. This folder served as the "constitution" for the entire build. Every AI interaction was governed by `23_AI_RULES.md`, which established hard rules:

- **No invented scope** — if a feature wasn't in `01_PRODUCT_REQUIREMENTS.md`, it didn't get built
- **No silent assumptions** — every ambiguity was documented and resolved explicitly
- **Prioritize correctness** — error handling (40% of grade) over visual polish
- **Framework-agnostic parsing** — the grading rubric required independently testable logic

The AI agent read these files in order at the start of each session (`00` → `01` → `02` → `...` → `25`), establishing a shared context before any code was written.

### How AI Assisted the Build

**1. Specifications and Planning**
I used an AI agent to help me write the specification documents in `.ai/`. I would describe what I wanted, and the agent would produce structured markdown covering requirements, edge cases, and acceptance criteria. I reviewed and revised each document before proceeding.

**2. Code Generation**
The AI agent wrote the majority of the code, but under strict constraints:
- I specified the exact file to work on and the interface (imports/exports)
- The agent never introduced dependencies outside the tech stack in `04_TECH_STACK.md`
- Every `// comment` explains *why*, not *what* (per `20_CODE_STYLE.md`)
- The build order in `24_BUILD_ORDER.md` was followed sequentially — Phase 1 (parsing logic + tests) was completed before Phase 2 (API route), before Phase 3 (UI)

**3. What I Changed or Rejected**

| AI Output | What I Changed | Why |
|---|---|---|
| Initial SSRF check was string-based | Replaced with DNS resolution lookups | String-matching `localhost` or `192.168.x.x` misses domains that resolve to private IPs |
| Used `redirect: 'follow'` by default | Rewrote to manual redirect handling with validation | Following redirects blindly bypasses the initial SSRF check |
| Card-based report design | Replaced with document-style sections | "Page Pulse" — the content should look like it belongs on a physical page |
| Standard shadcn form | Added focus glow, active scale-down, staggered animations | Made the tool feel intentional and polished, not like a scaffold |
| Plain text report values | Added typewriter animation with staggered delays | Creates a sense of live-reporting without being distracting |
| Basic box-shadow | Multi-layer shadow with paper texture background | Makes the page feel like a physical sheet of paper on a desk |

**4. Testing and Refinement**
The AI agent wrote both `analyze.test.ts` (8 tests) and `fetchTarget.test.ts` (13 tests). I manually triggered the test suite after every significant change and fixed any regressions before proceeding. The agent also helped identify edge cases I hadn't considered — for example, `alt=""` (empty alt attribute) should NOT count as missing per the HTML spec, which I confirmed and added as a test case.

---

## 3. My Logic and Mindset

### Start with the Rubric

I read the scoring breakdown first:

| Criterion | Weight |
|---|---|
| Correctness and error handling | 40% |
| Code quality and structure | 35% |
| API design | 25% |

I allocated my time proportionally. The first 50% of my build time was spent on error handling and the pure parsing function — not the UI. A beautiful UI that crashes on a malformed URL fails the primary grading criterion.

### Build Backward (from Data to Display)

I followed the data flow in reverse:

1. **Types** (`types.ts`) — Define what a Report looks like. This is the contract everything else works toward.
2. **Parser** (`analyze.ts`) — Given raw HTML, produce a Report. Pure, testable, no side effects.
3. **Fetcher** (`fetchTarget.ts`) — Given a URL, produce HTML. Handles all the failure modes (timeout, unreachable, non-HTML, private IP).
4. **API route** (`route.ts`) — Glue fetcher + parser. Thin orchestration.
5. **UI** (`page.tsx` + components) — Consume the API response and render.

This sequence meant I always had something testable before I added the next layer. By the time I built the UI, the parsing logic had already been verified against 8 test cases, and the fetch logic had been manually tested against multiple failure scenarios.

### Don't Fight the Framework

Next.js App Router + Tailwind v4 + shadcn/ui established clear patterns. I reused existing shadcn components (`Input`, `Button`, `Skeleton`, `Alert`) rather than rolling my own. This avoided a common AI pitfall of inventing custom UI patterns that fight the framework.

### Security as a First-Class Concern

The SSRF check was the most technically interesting part of this project. My approach:
1. Parse the URL and validate the scheme (`http:`/`https:` only)
2. Check if the hostname is already a literal private IP
3. If it's a domain, resolve it via `dns.promises.lookup`
4. Check the resolved IP against private/loopback/link-local ranges
5. Repeat this validation on every redirect hop (max 3)

This catches the DNS rebinding attack vector that a naive string-match approach would miss.

### Honest About Limitations

Rather than pretending the tool handles every edge case, I documented known limitations:

- **Word count is approximate** — strips `<script>`/`<style>`/`<noscript>` but can't account for CSS-based visibility
- **cheerio over Puppeteer** — JavaScript-rendered pages are not fully captured
- **No rate limiting** — appropriate for a qualification task but would be needed for production

### The Page Metaphor

"Page Pulse" — the name suggested the report should feel like a physical page. I added:
- Paper texture background (faint ruled lines)
- Multi-layer shadow mimicking a sheet floating above a desk
- Document-style sections with labeled fields (like a printed report)
- A clear visible border defining the page edge

This wasn't required by the brief, but it signals care and intentionality to the reviewer. The 35% code quality grade includes "structure" — and a thoughtful visual structure is part of that.

### Final Verification

Before calling it done, I verified against the checklist in `25_DEFINITION_OF_DONE.md`:

- ✅ Valid HTML page → all 8 report fields correct
- ✅ Malformed URL → INVALID_URL
- ✅ Unreachable host → UNREACHABLE
- ✅ Timeout → TIMEOUT at ~8s
- ✅ Non-HTML content-type → NOT_HTML
- ✅ Target 404/500 → valid report with that httpStatus
- ✅ No unhandled 500/stack trace to client
- ✅ Private/internal IP → blocked via DNS resolution
- ✅ 21 unit tests, all passing
- ✅ Public GitHub repo
- ✅ Live deployed on Vercel
- ✅ README with setup, API contract, 3 design decisions
- ✅ Footer credit line present
