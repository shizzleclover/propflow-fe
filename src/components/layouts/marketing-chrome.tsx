import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type MarketingChromeProps = {
  children: ReactNode
  /** Narrow column for auth forms */
  variant?: 'auth' | 'full'
}

export function MarketingChrome({ children, variant = 'full' }: MarketingChromeProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link className="text-lg font-semibold tracking-tight text-foreground" to="/">
            PropFlow
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link className="text-muted-foreground transition-colors hover:text-foreground" to="/login">
              Sign in
            </Link>
            <Link
              className="rounded-md bg-primary px-3 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
              to="/register"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main
        className={
          variant === 'auth'
            ? 'mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6'
            : 'flex-1'
        }
      >
        {children}
      </main>

      <footer className="border-t border-border bg-muted/40 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground sm:px-6">
          <p>PropFlow — one place for listings, viewings, and your team.</p>
        </div>
      </footer>
    </div>
  )
}
