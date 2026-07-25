'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Search } from 'lucide-react'

interface AuditFormProps {
  onSubmit: (url: string) => void
  isLoading: boolean
}

export function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    let url = input.trim()
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`
    }
    onSubmit(url)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 group">
      <div className="relative flex-1">
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-100" />
        <Input
          type="text"
          placeholder="https://example.com"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          aria-label="URL to audit"
          className="relative flex-1 transition-shadow duration-200"
        />
      </div>
      <Button type="submit" disabled={isLoading} className="relative transition-all duration-200 active:scale-95">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Auditing
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Audit
          </>
        )}
      </Button>
    </form>
  )
}
