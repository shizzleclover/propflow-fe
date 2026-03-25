import { Link, Navigate } from 'react-router-dom'
import { useMe } from '@/lib/auth/session'
import type { Role } from '@/lib/constants/roles'

type Shortcut = { to: string; label: string; description: string }

function shortcutsForRole(role: Role): Shortcut[] {
  const browse: Shortcut = {
    to: '/properties',
    label: role === 'CLIENT' ? 'Browse listings' : 'Properties',
    description:
      role === 'CLIENT'
        ? 'Search homes and rentals and open any listing for details.'
        : 'Review inventory, photos, and listing status.',
  }

  if (role === 'CLIENT') {
    return [
      browse,
      {
        to: '/client/requests',
        label: 'My requests',
        description: 'See viewing requests you have submitted and their status.',
      },
    ]
  }

  if (role === 'AGENT') {
    return [
      browse,
      {
        to: '/properties/new',
        label: 'Add listing',
        description: 'Create a new property listing assigned to you.',
      },
      {
        to: '/agent/bookings',
        label: 'Bookings',
        description: 'Manage viewing requests for your assigned listings.',
      },
    ]
  }

  if (role === 'STAFF') {
    return [
      browse,
      {
        to: '/staff/dashboard',
        label: 'Staff dashboard',
        description: 'Operational tools for your workspace.',
      },
    ]
  }

  if (role === 'ADMIN') {
    return [
      browse,
      {
        to: '/properties/new',
        label: 'Add property',
        description: 'Create a listing and assign it to an agent.',
      },
      {
        to: '/admin/dashboard',
        label: 'Admin dashboard',
        description: 'KPIs and agency-wide metrics.',
      },
      {
        to: '/admin/users',
        label: 'Users',
        description: 'Manage team accounts and roles.',
      },
    ]
  }

  return [browse]
}

export function OverviewPage() {
  const { data: user, isLoading } = useMe()

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading overview…</div>
  if (!user) return <Navigate replace to="/login" />

  const shortcuts = shortcutsForRole(user.role)

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-sky-950">Overview</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Welcome back, {user.name}. Pick a destination below or use the top navigation.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((item) => (
          <li key={item.to}>
            <Link
              className="block h-full rounded-2xl border border-sky-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              to={item.to}
            >
              <span className="text-lg font-semibold text-sky-950">{item.label}</span>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
