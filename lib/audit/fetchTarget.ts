import * as net from 'net'

const TIMEOUT_MS = 8000
const MAX_BODY_BYTES = 5 * 1024 * 1024

interface FetchResult {
  html: string
  status: number
  headers: Headers
  responseTimeMs: number
}

export class FetchError extends Error {
  constructor(
    public code: 'INVALID_URL' | 'TIMEOUT' | 'UNREACHABLE' | 'NOT_HTML' | 'INTERNAL',
    message: string
  ) {
    super(message)
    this.name = 'FetchError'
  }
}

export async function fetchTarget(rawUrl: string): Promise<FetchResult> {
  let url: URL
  try {
    url = new URL(rawUrl.trim())
  } catch {
    throw new FetchError('INVALID_URL', 'That doesn\'t look like a valid URL.')
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new FetchError('INVALID_URL', 'That URL can\'t be audited.')
  }

  if (isPrivateHost(url.hostname)) {
    throw new FetchError('INVALID_URL', 'That URL can\'t be audited.')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  const start = performance.now()
  let res: Response
  try {
    res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'PagePulse/1.0' },
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new FetchError('TIMEOUT', 'That site took too long to respond.')
    }
    throw new FetchError('UNREACHABLE', 'Couldn\'t reach that site — check the URL and try again.')
  } finally {
    clearTimeout(timeout)
  }

  const responseTimeMs = Math.round(performance.now() - start)

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.startsWith('text/html')) {
    const typeLabel = contentType || 'unknown'
    throw new FetchError('NOT_HTML', `That URL doesn't point to a webpage (got a ${typeLabel}).`)
  }

  let html: string
  try {
    const reader = res.body?.getReader()
    if (!reader) {
      throw new FetchError('NOT_HTML', 'That URL doesn\'t point to a webpage (got an empty response).')
    }

    const chunks: Uint8Array[] = []
    let total = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.length
      if (total > MAX_BODY_BYTES) {
        reader.cancel()
        break
      }
      chunks.push(value)
    }

    const decoder = new TextDecoder()
    html = chunks.map((c) => decoder.decode(c, { stream: true })).join('')
    html += decoder.decode()
  } catch {
    throw new FetchError('UNREACHABLE', 'Couldn\'t reach that site — check the URL and try again.')
  }

  return { html, status: res.status, headers: res.headers, responseTimeMs }
}

function isPrivateHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase()

  if (normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1') {
    return true
  }

  if (net.isIPv6(normalized)) {
    return normalized === '::1' || normalized === '0:0:0:0:0:0:0:1'
  }

  if (!net.isIPv4(normalized)) {
    return false
  }

  const parts = normalized.split('.').map(Number)

  if (parts[0] === 10) return true
  if (parts[0] === 127) return true
  if (parts[0] === 169 && parts[1] === 254) return true
  if (parts[0] === 192 && parts[1] === 168) return true
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true

  return false
}
