import type { Report } from '@/lib/audit/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Globe, FileText, Image, Hash, Clock, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface AuditReportProps {
  report: Report
}

function statusColor(code: number): string {
  if (code >= 200 && code < 300) return 'text-green-600 dark:text-green-400'
  if (code >= 300 && code < 400) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function timeColor(ms: number): string {
  if (ms < 1000) return 'text-green-600 dark:text-green-400'
  if (ms < 3000) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function hasAltIssues(count: number): boolean {
  return count > 0
}

function Field({ label, value, icon: Icon, valueClass }: { label: string; value: string | number; icon: React.ElementType; valueClass?: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-semibold truncate ${valueClass ?? ''}`}>{value ?? '—'}</p>
      </div>
    </div>
  )
}

export function AuditReport({ report }: AuditReportProps) {
  return (
    <div className="space-y-4">
      <Card className="animate-fade-in-up delay-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <div className="min-w-0">
              <CardTitle className="text-base">Page Basics</CardTitle>
              <CardDescription className="truncate">{report.url}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" value={report.title ?? '(none)'} icon={FileText} />
          <Field label="Meta Description" value={report.metaDescription ?? '(none)'} icon={FileText} />
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up delay-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">SEO Signals</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="H1 Count" value={report.h1Count} icon={Hash} />
          <Field label="Total Images" value={report.totalImages} icon={Image} />
          <Field
            label="Images Missing Alt"
            value={`${report.imagesMissingAlt}${hasAltIssues(report.imagesMissingAlt) ? ' ⚠' : ''}`}
            icon={hasAltIssues(report.imagesMissingAlt) ? AlertTriangle : Image}
            valueClass={hasAltIssues(report.imagesMissingAlt) ? 'text-amber-600 dark:text-amber-400' : ''}
          />
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up delay-300">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Performance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="HTTP Status" value={report.httpStatus} icon={report.httpStatus < 400 ? CheckCircle2 : AlertTriangle} valueClass={statusColor(report.httpStatus)} />
          <Field label="Response Time" value={`${report.responseTimeMs}ms`} icon={Clock} valueClass={timeColor(report.responseTimeMs)} />
          <Field label="Word Count" value={report.wordCount} icon={FileText} />
        </CardContent>
      </Card>
    </div>
  )
}
