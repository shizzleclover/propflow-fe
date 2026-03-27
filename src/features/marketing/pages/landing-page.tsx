import { Navigate, Link } from 'react-router-dom'
import { Building2, CalendarDays, LayoutDashboard, Users } from 'lucide-react'
import { getAccessToken } from '@/lib/auth/token-storage'
import { roleHomePath, useMe } from '@/lib/auth/session'

const features = [
  {
    icon: Building2,
    title: 'Unified listings',
    description:
      'Sale and rent in one inventory. Agents update status; clients see what is available without spreadsheet chaos.',
  },
  {
    icon: CalendarDays,
    title: 'Viewing bookings',
    description:
      'Request inspections, approve or propose times, and avoid double bookings with a single calendar source.',
  },
  {
    icon: Users,
    title: 'Roles that fit your agency',
    description:
      'Admin, staff, agents, and clients each get the right tools — without sharing the same messy inbox.',
  },
  {
    icon: LayoutDashboard,
    title: 'Operational clarity',
    description:
      'Dashboards and CRM notes keep leadership and front line aligned on pipeline and client feedback.',
  },
]

export function LandingPage() {
  const token = getAccessToken()
  const { data: user, isLoading } = useMe(Boolean(token))

  if (token && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }
  if (token && user) {
    return <Navigate replace to={roleHomePath(user.role)} />
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[4.25rem] sm:px-6">
          <span className="text-xl font-semibold tracking-tight">Nexa Homes</span>
          <nav className="flex items-center gap-4 text-sm font-medium sm:gap-6">
            <Link className="text-muted-foreground transition-colors hover:text-foreground" to="/login">
              Sign in
            </Link>
            <Link
              className="rounded-md bg-primary px-4 py-2.5 text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              to="/register"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-border bg-card px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            <div className="text-center lg:text-left">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Real estate operations
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-tight">
              One workspace for listings, viewings, and your team
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Replace scattered spreadsheets and chat threads with a single source of truth for properties,
              client requests, and booking workflows.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                className="inline-flex h-11 w-full max-w-xs items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
                to="/register"
              >
                Create free account
              </Link>
              <Link
                className="inline-flex h-11 w-full max-w-xs items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto"
                to="/login"
              >
                Sign in
              </Link>
            </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <img
                alt="Modern home exterior"
                className="h-40 w-full rounded-xl object-cover sm:h-56"
                loading="lazy"
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80"
              />
              <img
                alt="Bright living room"
                className="h-40 w-full rounded-xl object-cover sm:h-56"
                loading="lazy"
                src="https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=80"
              />
              <img
                alt="Cozy bedroom interior"
                className="h-40 w-full rounded-xl object-cover sm:h-56"
                loading="lazy"
                src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
              />
              <img
                alt="Luxury apartment interior"
                className="h-40 w-full rounded-xl object-cover sm:h-56"
                loading="lazy"
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80"
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for small and mid-size agencies
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Everything you need to run day-to-day sales and lettings — without gradients, noise, or extra
              tools you did not ask for.
            </p>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
              {features.map(({ icon: Icon, title, description }) => (
                <li
                  className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                  key={title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight">Ready to simplify your pipeline?</h2>
            <p className="mt-3 text-muted-foreground">
              Create an account to browse listings and request viewings. Your agency admin can invite agents
              and staff from the dashboard.
            </p>
            <Link
              className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              to="/register"
            >
              Get started
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <span className="font-semibold text-foreground">Nexa Homes</span>
          <div className="flex gap-6">
            <Link className="hover:text-foreground" to="/login">
              Sign in
            </Link>
            <Link className="hover:text-foreground" to="/register">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
