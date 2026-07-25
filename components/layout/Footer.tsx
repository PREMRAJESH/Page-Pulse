import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t py-5 text-center text-sm text-muted-foreground">
      <svg
        viewBox="0 0 24 12"
        className="mx-auto mb-2 size-6 text-indigo-400/60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="2,8 5.5,8 7.5,4 9.5,10 11.5,6 13.5,9 16,8" />
        <path d="M20 8h2" />
        <path d="M18 8h.5" />
      </svg>
      Built for{' '}
      <Link
        href="https://digitalheroesco.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        Digital Heroes Training Task
      </Link>
    </footer>
  )
}
