import { NextRequest } from 'next/server'
import { fetchTarget, FetchError } from '@/lib/audit/fetchTarget'
import { analyzeHtml } from '@/lib/audit/analyze'
import { getErrorMessage } from '@/lib/audit/errors'
import type { AuditResult, AuditError } from '@/lib/audit/types'

export async function POST(request: NextRequest): Promise<Response> {
  try {
    let body: { url?: string }
    try {
      body = await request.json()
    } catch {
      return errorResponse({ code: 'INVALID_URL', message: getErrorMessage('INVALID_URL') }, 400)
    }

    if (!body.url || typeof body.url !== 'string') {
      return errorResponse({ code: 'INVALID_URL', message: getErrorMessage('INVALID_URL') }, 400)
    }

    const trimmedUrl = body.url.trim()
    if (!trimmedUrl) {
      return errorResponse({ code: 'INVALID_URL', message: getErrorMessage('INVALID_URL') }, 400)
    }

    try {
      var result = await fetchTarget(trimmedUrl)
    } catch (e: any) {
      return Response.json({
        ok: false,
        debug: { name: e.name, code: e.code, message: e.message, stack: e.stack?.split('\n').slice(0, 3).join('\\n') }
      }, { status: 500 })
    }
    const { html, status: httpStatus, responseTimeMs } = result
    const fetchedAt = new Date().toISOString()
    const report = analyzeHtml(html, trimmedUrl, httpStatus, responseTimeMs, fetchedAt)

    const result: AuditResult & { ok: true } = { ok: true, report }
    return Response.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof FetchError) {
      const httpStatus = errorHttpStatus(err.code)
      return errorResponse({ code: err.code, message: err.message }, httpStatus)
    }

    console.error('Unhandled error in /api/audit:', err)
    return errorResponse({ code: 'INTERNAL', message: getErrorMessage('INTERNAL') }, 500)
  }
}

function errorResponse(error: AuditError, status: number): Response {
  const result: AuditResult & { ok: false } = { ok: false, error }
  return Response.json(result, { status })
}

function errorHttpStatus(code: AuditError['code']): number {
  switch (code) {
    case 'INVALID_URL': return 400
    case 'TIMEOUT': return 504
    case 'UNREACHABLE': return 502
    case 'NOT_HTML': return 422
    case 'INTERNAL': return 500
  }
}
