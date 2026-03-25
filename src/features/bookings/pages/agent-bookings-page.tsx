import { PageHeader } from '@/components/shared/page-header'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

async function fetchAgentBookings() {
  const { data } = await api.get('/bookings')
  return data?.bookings ?? []
}

export function AgentBookingsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['agent-bookings'], queryFn: fetchAgentBookings })

  return (
    <section>
      <PageHeader
        subtitle="Manage pending requests and respond to clients."
        title="Agent Bookings"
      />
      {isLoading ? <p className="text-sm text-muted-foreground">Loading bookings…</p> : null}
      <div className="space-y-4">
        {data?.map((booking: any) => (
          <article
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            key={booking._id}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs text-muted-foreground">{booking._id}</p>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold">{booking.status}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Property <span className="font-medium text-foreground">{String(booking.propertyId)}</span>
              {' · '}
              Client <span className="font-medium text-foreground">{String(booking.clientId)}</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

