'use client'

import { useState, useRef } from 'react'
import { AuditForm } from '@/components/audit/AuditForm'
import { AuditReport } from '@/components/audit/AuditReport'
import { AuditError } from '@/components/audit/AuditError'
import { Footer } from '@/components/layout/Footer'
import { Skeleton } from '@/components/ui/skeleton'
import type { Report, AuditError as AuditErrorType } from '@/lib/audit/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function Home() {
  const [status, setStatus] = useState<Status>('idle')
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<AuditErrorType | null>(null)
  const [lastUrl, setLastUrl] = useState<string>('')
  const abortRef = useRef<AbortController | null>(null)

  const handleSubmit = async (url: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    setReport(null)
    setError(null)
    setLastUrl(url)

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      })

      const data = await res.json()

      if (data.ok) {
        setReport(data.report)
        setStatus('success')
      } else {
        setError(data.error)
        setStatus('error')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError({ code: 'UNREACHABLE', message: 'Couldn\'t complete the request.' })
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <svg
            viewBox="0 0 32 32"
            className="size-7 shrink-0 text-indigo-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 4h14l6 6v18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            <path d="M20 4v6h6" />
            <polyline points="8.5,18 11,18 13,14 15,22 17,16 19,20 22,18" />
            <circle cx="22" cy="18" r="1.5" fill="currentColor" stroke="none" />
          </svg>
          <h1 className="text-3xl font-bold tracking-tight">Page Pulse</h1>
        </div>
        <p className="mt-1.5 text-muted-foreground">Get a structural audit of any web page</p>
      </header>

      <main className="flex-1 space-y-6">
        <AuditForm onSubmit={handleSubmit} isLoading={status === 'loading'} />

        <div aria-live="polite" className="space-y-4">
          {status === 'loading' && (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {status === 'success' && report && <AuditReport report={report} />}

          {status === 'error' && error && (
            <AuditError
              error={error}
              onRetry={() => handleSubmit(lastUrl)}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
