import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t py-5 text-center text-sm text-muted-foreground">
      <img src="/pulse.svg" alt="" className="mx-auto mb-2 size-6 opacity-60" />
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
