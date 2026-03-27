import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shared/page-header'
import { useQuery } from '@tanstack/react-query'
import { formatMoneyNGN } from '@/lib/formatters/money'
import { fetchClientRequests, type Booking, type BookingSlot } from '@/features/bookings/api/bookings-api'

function propertyLabel(property: Booking['propertyId']) {
  if (property && typeof property === 'object' && 'title' in property) return property.title
  return String(property)
}

function propertyMeta(property: Booking['propertyId']) {
  if (!property || typeof property !== 'object' || !('title' in property)) return null
  return {
    category: property.listingCategory ?? 'SALE',
    price: property.price,
    address: [property.address?.line1, property.address?.city].filter(Boolean).join(', '),
  }
}

function bookingSlotText(slot?: BookingSlot | null) {
  if (!slot) return '—'
  const start = new Date(slot.start)
  const end = new Date(slot.end)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '—'
  return `${start.toLocaleString()} - ${end.toLocaleString()}`
}

function requestProgress(status: Booking['status']) {
  if (status === 'PENDING') return 25
  if (status === 'PROPOSED') return 60
  if (status === 'APPROVED') return 100
  if (status === 'DECLINED' || status === 'CANCELLED') return 100
  return 0
}

export function ClientRequestsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['client-requests'], queryFn: fetchClientRequests })

  return (
    <section>
      <PageHeader
        subtitle="Track statuses, preferred slots, and agent responses in one place."
        title="My Requests"
      />
      {isLoading ? <p className="text-sm text-muted-foreground">Loading requests…</p> : null}
      <div className="space-y-4">
        {data?.map((booking) => {
          const p = propertyMeta(booking.propertyId)
          const agent =
            booking.agentId && typeof booking.agentId === 'object' && 'name' in booking.agentId
              ? booking.agentId
              : null
          return (
          <Link
            className="block rounded-xl border border-sky-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            key={booking._id}
            to={`/client/requests/${booking._id}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-sky-900">Viewing request</p>
                <p className="mt-1 text-base font-semibold text-sky-950">{propertyLabel(booking.propertyId)}</p>
              </div>
              <span className="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900">
                {booking.status}
              </span>
            </div>

            {p ? (
              <div className="mt-3 flex items-start gap-3">
                {typeof booking.propertyId === 'object' && booking.propertyId.imageUrls?.[0] ? (
                  <img
                    alt={propertyLabel(booking.propertyId)}
                    className="h-16 w-24 rounded-md object-cover"
                    loading="lazy"
                    src={booking.propertyId.imageUrls[0]}
                  />
                ) : null}
                <p className="text-sm text-muted-foreground">
                  {p.category === 'RENT' ? 'Rent /night' : 'Buy'}
                  {p.price ? ` · ${formatMoneyNGN(p.price)}` : ''}
                  {p.address ? ` · ${p.address}` : ''}
                </p>
              </div>
            ) : null}

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Request progress</span>
                <span>{booking.status}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-sky-100">
                <div
                  className={[
                    'h-full rounded-full transition-all',
                    booking.status === 'DECLINED' || booking.status === 'CANCELLED' ? 'bg-amber-500' : 'bg-sky-600',
                  ].join(' ')}
                  style={{ width: `${requestProgress(booking.status)}%` }}
                />
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
                <span className="font-semibold">Agent proposed:</span> {bookingSlotText(booking.proposedSlot)}
              </p>
            ) : null}

            {booking.clientNote ? (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Your note:</span> {booking.clientNote}
              </p>
            ) : null}
            {booking.agentNote ? (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Agent note:</span> {booking.agentNote}
              </p>
            ) : null}

            <p className="mt-3 font-mono text-xs text-muted-foreground">Request ID: {booking._id}</p>
            {agent ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Agent: <span className="font-medium text-foreground">{agent.name}</span> ({agent.email})
              </p>
            ) : null}
            <p className="mt-3 text-xs font-semibold text-sky-800">Tap to view full request details -&gt;</p>
          </Link>
          )
        })}
      </div>
    </section>
  )
}

