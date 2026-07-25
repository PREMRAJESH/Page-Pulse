import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-10 border-t border-zinc-100 pt-5 text-center dark:border-zinc-800">
      <img src="/pulse.svg" alt="" className="mx-auto mb-3 size-6 opacity-40" />
      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
        Built for{' '}
        <Link
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          Digital Heroes Training Task
        </Link>
      </p>
    </footer>
  )
}
