import { Link, NavLink, Outlet } from 'react-router-dom'
import { clearAccessToken } from '@/lib/auth/token-storage'
import { useMe } from '@/lib/auth/session'
import type { Role } from '@/lib/constants/roles'

type ShellNavItem = {
  to: string
  label: string
  roles?: Role[]
}

function buildNav(role?: Role): ShellNavItem[] {
  return [
    { to: '/properties', label: role === 'CLIENT' ? 'Browse listings' : 'Properties' },
    { to: '/properties/new', label: 'Add listing', roles: ['ADMIN', 'AGENT'] },
    {
      to: '/client/assistant',
      label: 'Find with assistant',
      roles: ['CLIENT', 'ADMIN', 'AGENT'],
    },
    { to: '/client/requests', label: 'My requests', roles: ['CLIENT'] },
    { to: '/staff/dashboard', label: 'Staff', roles: ['STAFF'] },
    { to: '/agent/bookings', label: 'Bookings', roles: ['AGENT'] },
    { to: '/admin/dashboard', label: 'Dashboard', roles: ['ADMIN'] },
    { to: '/admin/listings', label: 'Manage listings', roles: ['ADMIN'] },
    { to: '/admin/users', label: 'Users', roles: ['ADMIN'] },
  ]
}

export function AppShell() {
  const { data: user } = useMe()
  const role = user?.role
  const brandTo = user ? '/home' : '/'
  const overview: ShellNavItem[] = user ? [{ to: '/home', label: 'Overview' }] : []
  const items: ShellNavItem[] = [...overview, ...buildNav(role)]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-sky-200/70 bg-white/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-6">
          <Link className="text-lg font-semibold tracking-tight text-sky-950" to={brandTo}>
            Nexa Homes
          </Link>
          <nav className="flex w-full items-center gap-1 overflow-x-auto pb-1 sm:w-auto sm:flex-wrap sm:justify-end sm:gap-2 sm:pb-0">
            {items
              .filter((item) => !item.roles || (role ? item.roles.includes(role) : false))
              .map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    [
                      'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sky-100 text-sky-950'
                        : 'text-muted-foreground hover:bg-sky-50 hover:text-foreground',
                    ].join(' ')
                  }
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            {user ? (
              <span className="hidden max-w-[10rem] truncate text-xs text-muted-foreground sm:ml-2 sm:inline sm:max-w-xs">
                {user.name} · {user.role}
              </span>
            ) : null}
            <button
              className="ml-1 whitespace-nowrap rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              onClick={() => {
                clearAccessToken()
                window.location.assign('/login')
              }}
              type="button"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}

