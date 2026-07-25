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
    <div className="mx-auto min-h-screen max-w-3xl px-3 py-6 sm:py-12">
      <div className="animate-fade-in overflow-hidden rounded-[2px] border border-zinc-200 bg-paper page-shadow dark:border-zinc-700/60">
        <header className="px-8 pb-6 pt-10 text-center sm:px-12 sm:pb-8 sm:pt-14">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Structural Audit Report</p>
          <div className="mx-auto mb-3 flex items-center justify-center gap-3">
            <img src="/logo.svg" alt="Page Pulse logo" className="size-8" />
            <h1 className="text-4xl font-light tracking-tight text-zinc-900 dark:text-zinc-50">Page Pulse</h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Get a structural audit of any web page</p>
        </header>

        <div className="mx-auto max-w-[42rem] px-8 pb-10 sm:px-12 sm:pb-14">
          <main className="space-y-8">
            <div className="animate-fade-in-up delay-100">
              <AuditForm onSubmit={handleSubmit} isLoading={status === 'loading'} />
            </div>

            <div aria-live="polite" className="space-y-6">
              {status === 'loading' && (
                <div className="space-y-4 animate-fade-in">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
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
      </div>
    </div>
  )
}
