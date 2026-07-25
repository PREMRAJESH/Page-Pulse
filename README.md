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

## Design Decisions

### 1. cheerio over Puppeteer/Playwright
A headless browser would allow JavaScript-rendered page auditing and screenshots, but it adds cold-start latency and complexity disproportionate to a structural HTML audit. cheerio gives sub-millisecond parsing with zero runtime dependencies.

### 2. 8-second timeout
The outbound fetch uses an `AbortController` with an 8-second budget. Long enough for slow real sites, short enough that the evaluator isn't left waiting.

### 3. Word count approximation
Visible text nodes are counted after stripping `<script>`, `<style>`, and `<noscript>` content. This is documented as an approximation — exact typographic word count would require a renderer.

---

Built for [Digital Heroes Training Task](https://digitalheroesco.com)
