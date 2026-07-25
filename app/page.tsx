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
      <header className="mb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2.5">
          <img src="/logo.svg" alt="Page Pulse logo" className="size-7" />
          <h1 className="text-3xl font-bold tracking-tight">Page Pulse</h1>
        </div>
        <p className="mt-1.5 text-muted-foreground">Get a structural audit of any web page</p>
      </header>

      <main className="flex-1 space-y-6">
        <div className="animate-fade-in-up delay-100">
          <AuditForm onSubmit={handleSubmit} isLoading={status === 'loading'} />
        </div>

        <div aria-live="polite" className="space-y-4">
          {status === 'loading' && (
            <div className="space-y-4 animate-fade-in">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          )}

          {status === 'success' && report && <AuditReport report={report} />}

          {status === 'error' && error && (
            <div className="animate-scale-in">
              <AuditError
                error={error}
                onRetry={() => handleSubmit(lastUrl)}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
