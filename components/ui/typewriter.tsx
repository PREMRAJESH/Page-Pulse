'use client'

import { useState, useEffect } from 'react'

interface TypewriterTextProps {
  text: string
  speed?: number
  delay?: number
  className?: string
}

export function TypewriterText({ text, speed = 30, delay = 0, className }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)

    if (!text) return

    let index = 0
    let interval: ReturnType<typeof setInterval> | null = null

    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        index++
        if (index > text.length) {
          setDone(true)
          if (interval) clearInterval(interval)
          return
        }
        setDisplayed(text.slice(0, index))
      }, speed)
    }, delay)

    return () => {
      clearTimeout(startTimer)
      if (interval) clearInterval(interval)
    }
  }, [text, speed, delay])

  if (!text) return null

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <span className="inline-block h-[1em] w-[2px] translate-y-[1px] bg-current motion-reduce:hidden" />
      )}
    </span>
  )
}
