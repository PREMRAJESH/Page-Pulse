import { describe, it, expect } from 'vitest'
import { analyzeHtml } from './analyze'

const URL = 'https://example.com'
const HTTP_STATUS = 200
const RESPONSE_TIME_MS = 150
const FETCHED_AT = '2026-07-25T10:15:00.000Z'

const sharedMeta = {
  url: URL,
  httpStatus: HTTP_STATUS,
  responseTimeMs: RESPONSE_TIME_MS,
  fetchedAt: FETCHED_AT,
}

describe('analyzeHtml', () => {
  it('happy path — extracts all fields from a well-formed HTML page', () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
  <meta name="description" content="A test page for unit testing">
</head>
<body>
  <h1>Welcome</h1>
  <p>Hello world. This is some text content.</p>
  <img src="a.jpg" alt="A photo">
  <img src="b.jpg">
  <img src="c.jpg" alt="Another photo">
  <img src="d.jpg">
</body>
</html>`

    const report = analyzeHtml(html, URL, HTTP_STATUS, RESPONSE_TIME_MS, FETCHED_AT)

    expect(report).toEqual({
      ...sharedMeta,
      title: 'Test Page',
      metaDescription: 'A test page for unit testing',
      h1Count: 1,
      totalImages: 4,
      imagesMissingAlt: 2,
      wordCount: 8,
    })
  })

  it('missing metadata — null title, null metaDescription, zero h1Count', () => {
    const html = `<!DOCTYPE html>
<html>
<head></head>
<body>
  <p>No title, no meta, no h1 here.</p>
  <img src="x.jpg">
</body>
</html>`

    const report = analyzeHtml(html, URL, HTTP_STATUS, RESPONSE_TIME_MS, FETCHED_AT)

    expect(report.title).toBeNull()
    expect(report.metaDescription).toBeNull()
    expect(report.h1Count).toBe(0)
  })

  it('all images missing alt — imagesMissingAlt equals totalImages', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Alt test</title></head>
<body>
  <img src="1.jpg">
  <img src="2.jpg">
  <img src="3.jpg">
</body>
</html>`

    const report = analyzeHtml(html, URL, HTTP_STATUS, RESPONSE_TIME_MS, FETCHED_AT)

    expect(report.totalImages).toBe(3)
    expect(report.imagesMissingAlt).toBe(3)
  })

  it('empty alt attribute does NOT count as missing', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Alt edge case</title></head>
<body>
  <img src="a.jpg" alt="">
  <img src="b.jpg" alt="  ">
  <img src="c.jpg">
</body>
</html>`

    const report = analyzeHtml(html, URL, HTTP_STATUS, RESPONSE_TIME_MS, FETCHED_AT)

    expect(report.totalImages).toBe(3)
    expect(report.imagesMissingAlt).toBe(1)
  })

  it('multiple H1 tags — counts all of them', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Multiple H1</title></head>
<body>
  <h1>First</h1>
  <h1>Second</h1>
  <h1>Third</h1>
</body>
</html>`

    const report = analyzeHtml(html, URL, HTTP_STATUS, RESPONSE_TIME_MS, FETCHED_AT)

    expect(report.h1Count).toBe(3)
  })

  it('script and style content excluded from word count', () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Script exclusion</title>
  <style>.foo { color: red; }</style>
</head>
<body>
  <p>Visible text only.</p>
  <script>console.log("invisible")</script>
  <noscript>also invisible</noscript>
</body>
</html>`

    const report = analyzeHtml(html, URL, HTTP_STATUS, RESPONSE_TIME_MS, FETCHED_AT)

    expect(report.wordCount).toBe(3)
  })

  it('empty body — wordCount is 0', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Empty body</title></head>
<body>
</body>
</html>`

    const report = analyzeHtml(html, URL, HTTP_STATUS, RESPONSE_TIME_MS, FETCHED_AT)

    expect(report.wordCount).toBe(0)
  })

  it('meta description returns null when attribute is absent', () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>No meta</title>
  <meta name="description" href="whatever">
</head>
<body></body>
</html>`

    const report = analyzeHtml(html, URL, HTTP_STATUS, RESPONSE_TIME_MS, FETCHED_AT)

    expect(report.metaDescription).toBeNull()
  })
})
