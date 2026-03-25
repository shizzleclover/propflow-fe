import { PageHeader } from '@/components/shared/page-header'

export function StaffDashboardPage() {
  return (
    <section>
      <PageHeader
        title="Staff Dashboard"
        subtitle="Operations view for support staff and coordinators."
      />
      <div className="rounded-xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-sm">
        Staff workspace placeholder. Add coordination tools, queues, and handoffs here when you are ready.
      </div>
    </section>
  )
}

