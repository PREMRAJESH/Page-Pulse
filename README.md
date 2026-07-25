<p align="center">
  <img src="public/logo.svg" alt="Page Pulse logo" width="32" height="32">
</p>

<h1 align="center">Page Pulse</h1>

<p align="center">
  A URL audit tool. Submit a URL and get a structural HTML report — HTTP status,
  response time, title, meta description, H1 count, images missing alt text, and
  approximate word count. No headless browser required.
</p>
<div align="center">

![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)
![Tests](https://img.shields.io/badge/Vitest-21_tests-6E9F18?logo=vitest)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000?logo=vercel)

</div>
<p align="center">
  <strong><a href="https://page-pulse-delta-mocha.vercel.app">page-pulse-delta-mocha.vercel.app</a></strong>
</p>

---

## Features

- **Structural HTML audit** — extracts title, meta description, H1 headings, image alt attributes, and word count from server-rendered HTML
- **Performance metrics** — measures HTTP status code and response time for each request
- **Error classification** — distinct, user-facing errors for invalid URLs, unreachable hosts, timeouts, and non-HTML responses
- **SSRF protection** — DNS-resolves every target hostname and rejects private, loopback, and link-local IPs before making a request
- **Redirect safety** — manually follows up to 3 hops, re-validating each target with the full security check before following
- **Response-size limit** — streams the body with a 5 MB cap to prevent unbounded memory usage
- **Request deduplication** — cancels any in-flight request when a new URL is submitted

---

## Tech Stack

| Layer        | Technology                                                                      |
| ------------ | ------------------------------------------------------------------------------- |
| Framework    | [Next.js](https://nextjs.org) 16.2.11 (App Router)                              |
| Language     | TypeScript (strict mode)                                                        |
| Styling      | [Tailwind CSS](https://tailwindcss.com) v4 + [shadcn/ui](https://ui.shadcn.com) |
| HTML parsing | [cheerio](https://cheerio.js.org)                                               |
| Testing      | [Vitest](https://vitest.dev)                                                    |
| Linting      | [ESLint](https://eslint.org)                                                    |
| Deployment   | [Vercel](https://vercel.com)                                                    |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start the development server |
| `npm run build`      | Create a production build    |
| `npm start`          | Start the production server  |
| `npm test`           | Run all tests (single run)   |
| `npm run test:watch` | Run tests in watch mode      |
| `npm run lint`       | Run ESLint                   |

---

## API

### `POST /api/audit`

Fetches and analyzes a public URL.

**Request**

```json
{
  "url": "https://example.com"
}
```

**Success response (200)**

```json
{
  "ok": true,
  "report": {
    "url": "https://example.com",
    "httpStatus": 200,
    "responseTimeMs": 312,
    "title": "Example Domain",
    "metaDescription": null,
    "h1Count": 1,
    "imagesMissingAlt": 0,
    "totalImages": 0,
    "wordCount": 14,
    "fetchedAt": "2026-07-25T14:30:00.000Z"
  }
}
```

**Error responses**

| Status | Code          | Meaning                                |
| ------ | ------------- | -------------------------------------- |
| 400    | `INVALID_URL` | Malformed, empty, or private/local URL |
| 502    | `UNREACHABLE` | Host unreachable or DNS failure        |
| 504    | `TIMEOUT`     | Response exceeded the 8-second limit   |
| 422    | `NOT_HTML`    | Response content-type is not HTML      |
| 500    | `INTERNAL`    | Unexpected server error                |

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_URL",
    "message": "That doesn't look like a valid URL."
  }
}
```

---

## Project Structure

```
├── app/
│   ├── api/
│   │   └── audit/
│   │       └── route.ts          # API endpoint
│   ├── globals.css               # Global styles + theme tokens
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (client component)
├── components/
│   ├── audit/
│   │   ├── AuditError.tsx        # Error state display
│   │   ├── AuditForm.tsx         # URL input + submit
│   │   └── AuditReport.tsx       # Audit results display
│   ├── layout/
│   │   └── Footer.tsx
│   └── ui/
│       ├── alert.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── skeleton.tsx
├── lib/
│   └── audit/
│       ├── analyze.ts            # HTML parsing + field extraction
│       ├── analyze.test.ts       # 8 tests for analyze logic
│       ├── fetchTarget.ts        # HTTP fetch + SSRF check + redirect handling
│       ├── fetchTarget.test.ts   # 13 tests for SSRF + redirect safety
│       ├── types.ts              # Report, AuditError, AuditResult types
│       └── utils.ts              # cn() utility
├── vitest.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Design Decisions

### 1. cheerio over a headless browser

A headless browser (Puppeteer/Playwright) would enable JavaScript-rendered page auditing and screenshots, but it adds cold-start latency and complexity disproportionate to a structural HTML audit. cheerio provides sub-millisecond parsing with zero runtime dependencies and a familiar jQuery-like API.

**Trade-off:** Pages that rely entirely on client-side rendering will not be fully captured. For this qualification task (structural audit of server-rendered HTML), cheerio is the correct choice.

### 2. 8-second timeout with AbortController

The outbound fetch uses an `AbortController` with an 8-second budget. This is long enough for slow-but-legitimate sites and short enough that the user isn't left waiting. The timeout is distinct from the redirect hop limit — each individual hop must complete within 8 seconds.

### 3. Word count as an approximation

Visible text is counted after stripping `<script>`, `<style>`, and `<noscript>` elements. This yields a close approximation without requiring a full render pass. Exact typographic word count (accounting for CSS `display: none`, `visibility: hidden`, etc.) would require a browser engine.

---

## Security

### SSRF protection

The target hostname is **resolved via DNS** (`dns.promises.lookup`) before any fetch is made. The resolved IP is then checked against private (10.x.x.x, 172.16–31.x.x, 192.168.x.x), loopback (127.x.x.x, ::1), and link-local (169.254.x.x) ranges. This catches attackers who point a domain's DNS record at an internal address — pattern-matching the hostname string alone would not.

Hostnames that are already raw IPs are checked directly without a DNS lookup.

### Redirect validation

Redirects are handled **manually** with `redirect: 'manual'` rather than relying on the fetch runtime's automatic follow. The chain is capped at **3 hops**, and each redirect target is re-parsed, protocol-validated, and run through the same DNS-based SSRF check before the next request is made. This prevents a redirect chain from reaching an internal server.

### Response-size limit

The response body is streamed via the Fetch API's `ReadableStream` and capped at **5 MB**. If the limit is exceeded, the reader is cancelled and the partial data is discarded — the server never buffers an unbounded response.

---

## Testing

The test suite covers:

- **HTML parsing** (8 tests) — happy path, missing metadata, alt attribute edge cases, multiple H1s, script/style exclusion, empty body, missing description attribute
- **SSRF detection** (10 tests) — loopback, private ranges, link-local, public IPs, non-IP strings, boundary cases for the 172.x.x.x range
- **Integration** (3 tests) — hostname resolving to a private IP via DNS, redirect to a private IP, rejection beyond 3 redirect hops

```bash
npm test          # 21 tests, single run
npm run test:watch  # watch mode during development
```

---

## Deployment

The project is deployed on Vercel. Pushes to the `main` branch trigger an automatic deployment.

[page-pulse-delta-mocha.vercel.app](https://page-pulse-delta-mocha.vercel.app)

<p align="center">
  <img src="public/pulse.svg" alt="" width="60" height="30">
</p>

---

Built as a qualification task for [Digital Heroes](https://digitalheroesco.com).
