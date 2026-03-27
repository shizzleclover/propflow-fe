import { PageHeader } from '@/components/shared/page-header'
import { useQuery } from '@tanstack/react-query'
import { formatMoneyNGN } from '@/lib/formatters/money'
import { fetchClientRequests, type Booking, type BookingSlot } from '@/features/bookings/api/bookings-api'

function bookingSlotText(slot?: BookingSlot | null) {
  if (!slot) return '—'
  const start = new Date(slot.start)
  const end = new Date(slot.end)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '—'
  return `${start.toLocaleString()} - ${end.toLocaleString()}`
}

function progressValue(status: Booking['status']) {
  if (status === 'PENDING') return 25
  if (status === 'PROPOSED') return 60
  return 100
}

export function AgentBookingsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['agent-bookings'], queryFn: fetchClientRequests })

  return (
    <section>
      <PageHeader
        subtitle="View request progress, listing visuals, and client notes in one place."
        title="Agent Bookings"
      />
      {isLoading ? <p className="text-sm text-muted-foreground">Loading bookings…</p> : null}
      <div className="space-y-4">
        {data?.map((booking) => {
          const property = typeof booking.propertyId === 'object' ? booking.propertyId : null
          const client = booking.clientId && typeof booking.clientId === 'object' ? booking.clientId : null
          return (
            <article
              className="rounded-xl border border-sky-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              key={booking._id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-sky-900">Booking request</p>
                  <p className="mt-1 text-base font-semibold text-sky-950">{property?.title ?? String(booking.propertyId)}</p>
                </div>
                <span className="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900">
                  {booking.status}
                </span>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Progress</span>
                  <span>{booking.status}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-sky-100">
                  <div
                    className={[
                      'h-full rounded-full transition-all',
                      booking.status === 'DECLINED' || booking.status === 'CANCELLED' ? 'bg-amber-500' : 'bg-sky-600',
                    ].join(' ')}
                    style={{ width: `${progressValue(booking.status)}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-start gap-3">
                {property?.imageUrls?.[0] ? (
                  <img alt={property.title} className="h-16 w-24 rounded-md object-cover" loading="lazy" src={property.imageUrls[0]} />
                ) : null}
                <div className="text-sm text-muted-foreground">
                  <p>
                    {(property?.listingCategory ?? 'SALE') === 'RENT' ? 'Rent /night' : 'Buy'}
                    {property?.price ? ` · ${formatMoneyNGN(property.price)}` : ''}
                  </p>
                  <p>{[property?.address?.line1, property?.address?.city].filter(Boolean).join(', ')}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preferred slot</p>
                  <p className="mt-1 text-foreground">{bookingSlotText(booking.preferredSlots?.[0])}</p>
                </div>
                <div className="rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confirmed slot</p>
                  <p className="mt-1 text-foreground">{bookingSlotText(booking.confirmedSlot)}</p>
                </div>
              </div>

              {booking.proposedSlot ? (
                <p className="mt-3 text-sm text-foreground">
                  <span className="font-semibold">Proposed slot:</span> {bookingSlotText(booking.proposedSlot)}
                </p>
              ) : null}
              {booking.clientNote ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Client note:</span> {booking.clientNote}
                </p>
              ) : null}
              {booking.agentNote ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Your note:</span> {booking.agentNote}
                </p>
              ) : null}

              <p className="mt-3 font-mono text-xs text-muted-foreground">Request ID: {booking._id}</p>
              {client ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Client: <span className="font-medium text-foreground">{client.name}</span> ({client.email})
                </p>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}

