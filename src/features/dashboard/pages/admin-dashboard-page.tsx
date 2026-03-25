import { PageHeader } from '@/components/shared/page-header'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

async function fetchKpis() {
  const { data } = await api.get('/dashboard/kpis')
  return data?.kpis
}

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-kpis'], queryFn: fetchKpis })

  return (
    <section>
      <PageHeader
        subtitle="KPIs for booking trends and team performance."
        title="Admin Dashboard"
      />
      {isLoading ? <p className="text-sm text-muted-foreground">Loading KPIs…</p> : null}
      {data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Agents active</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
              {data.totals?.agentsActive ?? 0}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Clients active</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
              {data.totals?.clientsActive ?? 0}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Properties</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
              {data.totals?.properties ?? 0}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Requests (7d)</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
              {data.totals?.bookingRequestsLast7d ?? 0}
            </p>
          </article>
        </div>
      ) : null}
    </section>
  )
}

