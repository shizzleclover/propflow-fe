import { PageHeader } from '@/components/shared/page-header'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

async function fetchClientRequests() {
  const { data } = await api.get('/bookings')
  return data?.bookings ?? []
}

export function ClientRequestsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['client-requests'], queryFn: fetchClientRequests })

  return (
    <section>
      <PageHeader
        subtitle="Track your viewing request statuses in one place."
        title="My Requests"
      />
      {isLoading ? <p className="text-sm text-muted-foreground">Loading requests…</p> : null}
      <div className="space-y-4">
        {data?.map((booking: any) => (
          <article
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            key={booking._id}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">Viewing request</p>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold">{booking.status}</span>
            </div>
            <p className="mt-2 font-mono text-xs text-muted-foreground">{booking._id}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Property <span className="font-medium text-foreground">{String(booking.propertyId)}</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

