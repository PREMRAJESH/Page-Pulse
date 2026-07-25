import * as net from 'net'
import { lookup } from 'node:dns/promises'
import { getErrorMessage } from './errors'
import type { AuditError } from './types'

const TIMEOUT_MS = 8000
const MAX_BODY_BYTES = 5 * 1024 * 1024

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])

interface FetchResult {
  html: string
  status: number
  headers: Headers
  responseTimeMs: number
}

export class FetchError extends Error {
  constructor(
    public code: AuditError['code'],
    message: string
  ) {
    super(message)
    this.name = 'FetchError'
  }
}

export function isPrivateIp(address: string): boolean {
  if (net.isIPv6(address)) {
    return address === '::1' || address === '0:0:0:0:0:0:0:1'
  }

  if (!net.isIPv4(address)) {
    return false
  }

  const parts = address.split('.').map(Number)

  if (parts[0] === 10) return true
  if (parts[0] === 127) return true
  if (parts[0] === 169 && parts[1] === 254) return true
  if (parts[0] === 192 && parts[1] === 168) return true
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true

  return false
}

async function rejectIfPrivateTarget(hostname: string): Promise<void> {
  const normalized = hostname.toLowerCase()

  if (normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1') {
    throw new FetchError('INVALID_URL', getErrorMessage('INVALID_URL'))
  }

  if (net.isIP(normalized)) {
    if (isPrivateIp(normalized)) {
      throw new FetchError('INVALID_URL', getErrorMessage('INVALID_URL'))
    }
    return
  }

  try {
    const { address } = await lookup(hostname)
    if (isPrivateIp(address)) {
      throw new FetchError('INVALID_URL', getErrorMessage('INVALID_URL'))
    }
  } catch (err) {
    if (err instanceof FetchError) throw err
  }
}

function parseAndValidateUrl(raw: string): URL {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    throw new FetchError('INVALID_URL', getErrorMessage('INVALID_URL'))
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new FetchError('INVALID_URL', getErrorMessage('INVALID_URL'))
  }

  return url
}

export async function fetchTarget(rawUrl: string): Promise<FetchResult> {
  const start = performance.now()

  let url = parseAndValidateUrl(rawUrl)
  await rejectIfPrivateTarget(url.hostname)

  let redirectCount = 0
  const maxRedirects = 3

  while (true) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    let res: Response
    try {
      res = await fetch(url, {
        signal: controller.signal,
        redirect: 'manual',
        headers: { 'User-Agent': 'PagePulse/1.0' },
      })
    } catch (err: unknown) {
      clearTimeout(timeout)
      if (err instanceof Error && err.name === 'AbortError') {
        throw new FetchError('TIMEOUT', getErrorMessage('TIMEOUT'))
      }
      throw new FetchError('UNREACHABLE', getErrorMessage('UNREACHABLE'))
    }
    clearTimeout(timeout)

    if (REDIRECT_STATUSES.has(res.status)) {
      redirectCount++
      if (redirectCount > maxRedirects) {
        throw new FetchError('UNREACHABLE', getErrorMessage('UNREACHABLE'))
      }

      const location = res.headers.get('location')
      if (!location) {
        throw new FetchError('UNREACHABLE', getErrorMessage('UNREACHABLE'))
      }

      url = new URL(location, url)

      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new FetchError('INVALID_URL', getErrorMessage('INVALID_URL'))
      }

      await rejectIfPrivateTarget(url.hostname)

      continue
    }

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.startsWith('text/html')) {
      const typeLabel = contentType || ''
      throw new FetchError('NOT_HTML', getErrorMessage('NOT_HTML', typeLabel))
    }

    let html: string
    try {
      const reader = res.body?.getReader()
      if (!reader) {
        throw new FetchError('NOT_HTML', getErrorMessage('NOT_HTML'))
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
      throw new FetchError('UNREACHABLE', getErrorMessage('UNREACHABLE'))
    }

    const responseTimeMs = Math.round(performance.now() - start)

    return { html, status: res.status, headers: res.headers, responseTimeMs }
  }
}
