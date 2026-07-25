export interface Report {
  url: string
  httpStatus: number
  responseTimeMs: number
  title: string | null
  metaDescription: string | null
  h1Count: number
  imagesMissingAlt: number
  totalImages: number
  wordCount: number
  fetchedAt: string
}

export interface AuditError {
  code: 'INVALID_URL' | 'TIMEOUT' | 'UNREACHABLE' | 'NOT_HTML' | 'INTERNAL'
  message: string
}

export type AuditResult =
  | { ok: true; report: Report }
  | { ok: false; error: AuditError }
