import type { AuditError } from './types'

const MESSAGES: Record<AuditError['code'], string> = {
  INVALID_URL: "That URL can't be audited — check the address or try a different link.",
  UNREACHABLE: "Couldn't reach that site — check the URL and try again.",
  TIMEOUT: 'That site took too long to respond.',
  NOT_HTML: "That link doesn't point to a webpage",
  INTERNAL: 'Something went wrong on our end — try again.',
}

export function getErrorMessage(code: AuditError['code'], detail?: string): string {
  let msg = MESSAGES[code]
  if (code === 'NOT_HTML' && detail) {
    msg += ` — it looks like a ${detail} file.`
  }
  return msg
}
