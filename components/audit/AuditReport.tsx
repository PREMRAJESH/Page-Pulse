import type { Report } from '@/lib/audit/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Globe, FileText, Image, Hash, Clock, Activity } from 'lucide-react'

interface AuditReportProps {
  report: Report
}

function Field({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-lg font-semibold truncate">{value ?? '—'}</p>
      </div>
    </div>
  )
}

export function AuditReport({ report }: AuditReportProps) {
  return (
    <div className="space-y-4">
      <Card>
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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">SEO Signals</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="H1 Count" value={report.h1Count} icon={Hash} />
          <Field label="Total Images" value={report.totalImages} icon={Image} />
          <Field label="Images Missing Alt" value={report.imagesMissingAlt} icon={Image} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Performance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="HTTP Status" value={report.httpStatus} icon={Hash} />
          <Field label="Response Time" value={`${report.responseTimeMs}ms`} icon={Clock} />
          <Field label="Word Count" value={report.wordCount} icon={FileText} />
        </CardContent>
      </Card>
    </div>
  )
}
