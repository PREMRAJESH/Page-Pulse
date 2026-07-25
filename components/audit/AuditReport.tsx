import type { Report } from '@/lib/audit/types'
import { Globe, FileText, Image, Hash, Clock, Activity, AlertTriangle } from 'lucide-react'
import { TypewriterText } from '@/components/ui/typewriter'

interface AuditReportProps {
  report: Report
}

function statusBadge(code: number): string {
  if (code >= 200 && code < 300) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
  if (code >= 300 && code < 400) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
  return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
}

function timeBadge(ms: number): string {
  if (ms < 1000) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
  if (ms < 3000) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
  return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
}

function Section({ title, icon: Icon, children, delay }: { title: string; icon: React.ElementType; children: React.ReactNode; delay: string }) {
  return (
    <section className={`animate-fade-in-up ${delay}`}>
      <div className="mb-3 flex items-center gap-2 border-b border-zinc-100 pb-2 dark:border-zinc-800">
        <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="sm:flex sm:items-baseline sm:gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 sm:w-40 sm:shrink-0 sm:text-right">{label}</p>
      <p className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200 sm:mt-0">{value}</p>
    </div>
  )
}

function TypeField({ label, text, delay = 0 }: { label: string; text: string; delay?: number }) {
  return (
    <div className="sm:flex sm:items-baseline sm:gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 sm:w-40 sm:shrink-0 sm:text-right">{label}</p>
      <p className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200 sm:mt-0">
        <TypewriterText text={text} speed={15} delay={delay} />
      </p>
    </div>
  )
}

function TypeFieldNumber({ label, value, delay = 0, suffix }: { label: string; value: number; delay?: number; suffix?: string }) {
  return (
    <div className="sm:flex sm:items-baseline sm:gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 sm:w-40 sm:shrink-0 sm:text-right">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 sm:mt-0">
        <TypewriterText text={`${value}${suffix ?? ''}`} speed={40} delay={delay} />
      </p>
    </div>
  )
}

export function AuditReport({ report }: AuditReportProps) {
  return (
    <div className="space-y-8">
      <Section title="Page Basics" icon={Globe} delay="delay-100">
        <TypeField label="URL" text={report.url} delay={0} />
        <TypeField label="Title" text={report.title ?? '(none)'} delay={200} />
        <TypeField label="Meta Description" text={report.metaDescription ?? '(none)'} delay={400} />
      </Section>

      <Section title="SEO Signals" icon={Image} delay="delay-200">
        <TypeFieldNumber label="H1 Count" value={report.h1Count} delay={0} />
        <TypeFieldNumber label="Total Images" value={report.totalImages} delay={200} />
        <Field
          label="Images Missing Alt"
          value={
            <span className={report.imagesMissingAlt > 0 ? 'text-amber-700 dark:text-amber-400 font-medium' : ''}>
              <TypewriterText
                text={String(report.imagesMissingAlt)}
                speed={40}
                delay={400}
              />
              {report.imagesMissingAlt > 0 && <span className="ml-1.5 text-xs">⚠</span>}
            </span>
          }
        />
      </Section>

      <Section title="Performance" icon={Activity} delay="delay-300">
        <Field
          label="HTTP Status"
          value={
            <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${statusBadge(report.httpStatus)}`}>
              {report.httpStatus}
            </span>
          }
        />
        <Field
          label="Response Time"
          value={
            <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${timeBadge(report.responseTimeMs)}`}>
              {report.responseTimeMs}ms
            </span>
          }
        />
        <TypeFieldNumber label="Word Count" value={report.wordCount} delay={0} suffix="" />
      </Section>
    </div>
  )
}
