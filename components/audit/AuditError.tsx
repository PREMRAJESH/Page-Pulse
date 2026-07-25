'use client'

import type { AuditError } from '@/lib/audit/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface AuditErrorProps {
  error: AuditError
  onRetry?: () => void
}

export function AuditError({ error, onRetry }: AuditErrorProps) {
  return (
    <Alert variant="destructive" role="alert">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Audit Failed</AlertTitle>
      <AlertDescription className="mt-1">{error.message}</AlertDescription>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
          <RefreshCw className="mr-2 h-3 w-3" />
          Try Again
        </Button>
      )}
    </Alert>
  )
}
