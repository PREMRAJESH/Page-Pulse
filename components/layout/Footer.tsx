import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t py-4 text-center text-sm text-muted-foreground">
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
