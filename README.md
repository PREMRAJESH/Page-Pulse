# Page Pulse

A URL audit tool. Submit a URL and get a structural HTML report: HTTP status, response time, title, meta description, H1 count, images missing alt text, and approximate word count.

Built for the Digital Heroes internship qualification task.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict)
- **UI:** Tailwind CSS v4
- **HTML Parsing:** cheerio
- **Testing:** Vitest
- **Deployment:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Production build         |
| `npm run test`    | Run tests                |
| `npm run lint`    | Run linter               |

## API Contract

### `POST /api/audit`

Submit a URL for auditing.

**Request body**

```json
{
  "url": "https://example.com"
}
```

**Response (200)**

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

| HTTP Status | Code | Meaning |
|---|---|---|
| 400 | `INVALID_URL` | Malformed, empty, or private/local URL |
| 502 | `UNREACHABLE` | Host unreachable or DNS failure |
| 504 | `TIMEOUT` | Response took longer than 8 seconds |
| 422 | `NOT_HTML` | Response was not HTML (PDF, image, etc.) |
| 500 | `INTERNAL` | Unexpected server error |

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_URL",
    "message": "That doesn't look like a valid URL."
  }
}
```

## Design Decisions

### 1. cheerio over Puppeteer/Playwright
A headless browser would allow JavaScript-rendered page auditing and screenshots, but it adds cold-start latency and complexity disproportionate to a structural HTML audit. cheerio gives sub-millisecond parsing with zero runtime dependencies.

### 2. 8-second timeout
The outbound fetch uses an `AbortController` with an 8-second budget. Long enough for slow real sites, short enough that the evaluator isn't left waiting.

### 3. Word count approximation
Visible text nodes are counted after stripping `<script>`, `<style>`, and `<noscript>` content. This is documented as an approximation — exact typographic word count would require a renderer.

## Security

### Server-Side Request Forgery (SSRF) protection
The hostname is **resolved via DNS first**, then the resolved IP is checked against private (10.x.x.x, 172.16-31.x.x, 192.168.x.x), loopback (127.x.x.x, ::1), and link-local (169.254.x.x) ranges. This catches attackers who point a domain's DNS record at an internal address — pattern-matching the hostname string alone would miss that.

### Redirect safety
Redirects are handled **manually** (not auto-followed by the fetch runtime), capped at **3 hops**, and each redirect target is re-validated with the same full DN`S + private-IP check before it is followed. This prevents a redirect chain from reaching an internal server.

### Response-size limit
The response body is streamed and capped at **5 MB**. If the limit is exceeded, the reader is cancelled and the partial content is discarded — the server never buffers an unbounded response.

---

Built for [Digital Heroes Training Task](https://digitalheroesco.com)
