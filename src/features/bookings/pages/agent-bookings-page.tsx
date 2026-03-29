import { PageHeader } from '@/components/shared/page-header'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatMoneyNGN } from '@/lib/formatters/money'
import {
  fetchClientRequests,
  addBookingMessage,
  approveBooking,
  proposeBooking,
  declineBooking,
  type Booking,
  type BookingSlot,
} from '@/features/bookings/api/bookings-api'
import { useState } from 'react'
import { Roles } from '@/lib/constants/roles'

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
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [isBusy, setIsBusy] = useState<string | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['agent-bookings'], queryFn: fetchClientRequests })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['agent-bookings'] })

  const messageMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => addBookingMessage(id, text),
    onSuccess: invalidate,
  })

  const approveMutation = useMutation({
    mutationFn: (args: { id: string; slot: BookingSlot; note?: string }) => approveBooking(args.id, args.slot, args.note),
    onSuccess: invalidate,
  })

  const declineMutation = useMutation({
    mutationFn: (args: { id: string; note?: string }) => declineBooking(args.id, args.note),
    onSuccess: invalidate,
  })

  const proposeMutation = useMutation({
    mutationFn: (args: { id: string; slot: BookingSlot; note?: string }) => proposeBooking(args.id, args.slot, args.note),
    onSuccess: invalidate,
  })

  async function onSendMessage(id: string) {
    const text = messages[id]?.trim()
    if (!text) return
    setIsBusy(id)
    try {
      await messageMutation.mutateAsync({ id, text })
      setMessages((prev) => ({ ...prev, [id]: '' }))
    } catch (e) {
      console.error(e)
    } finally {
      setIsBusy(null)
    }
  }

  async function onApprove(booking: Booking) {
    const slot = booking.preferredSlots?.[0]
    if (!slot) return alert('No preferred slot found')
    const note = messages[booking._id]?.trim() || undefined
    setIsBusy(booking._id)
    try {
      await approveMutation.mutateAsync({ id: booking._id, slot, note })
      setMessages((prev) => ({ ...prev, [booking._id]: '' }))
    } catch (e) {
      console.error(e)
    } finally {
      setIsBusy(null)
    }
  }

  async function onDecline(id: string) {
    const note = messages[id]?.trim() || undefined
    if (!window.confirm('Are you sure you want to decline this request?')) return
    setIsBusy(id)
    try {
      await declineMutation.mutateAsync({ id, note })
      setMessages((prev) => ({ ...prev, [id]: '' }))
    } catch (e) {
      console.error(e)
    } finally {
      setIsBusy(null)
    }
  }

  async function onPropose(booking: Booking) {
    const slot = booking.preferredSlots?.[0]
    if (!slot) return alert('No preferred slot found')
    const note = messages[booking._id]?.trim() || undefined
    setIsBusy(booking._id)
    try {
      await proposeMutation.mutateAsync({ id: booking._id, slot, note })
      setMessages((prev) => ({ ...prev, [booking._id]: '' }))
    } catch (e) {
      console.error(e)
    } finally {
      setIsBusy(null)
    }
  }

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

              <div className="mt-6 border-t border-sky-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Communication & Actions</p>

                <div className="mt-3 max-h-40 overflow-y-auto space-y-2 rounded-lg bg-sky-50/40 p-3">
                  {booking.messages?.length ? (
                    booking.messages.map((msg, idx) => (
                      <div className="text-xs" key={idx}>
                        <span className="font-semibold text-sky-900">{msg.role === 'AGENT' ? 'You' : 'Client'}:</span>{' '}
                        <span className="text-sky-950">{msg.text}</span>
                        <span className="ml-1 text-[10px] text-muted-foreground opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs italic text-muted-foreground">No message history.</p>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <textarea
                    className="w-full rounded-lg border border-sky-200 bg-white p-2.5 text-xs outline-none ring-sky-500/20 transition-all focus:border-sky-600 focus:ring-4"
                    disabled={isBusy === booking._id}
                    onChange={(e) => setMessages((prev) => ({ ...prev, [booking._id]: e.target.value }))}
                    placeholder="Type a message or internal note…"
                    rows={2}
                    value={messages[booking._id] || ''}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50"
                      disabled={isBusy === booking._id || !messages[booking._id]?.trim()}
                      onClick={() => onSendMessage(booking._id)}
                      type="button"
                    >
                      Send Message
                    </button>
                    {booking.status === 'PENDING' || booking.status === 'PROPOSED' ? (
                      <>
                        <button
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                          disabled={isBusy === booking._id}
                          onClick={() => onApprove(booking)}
                          type="button"
                        >
                          Approve
                        </button>
                        <button
                          className="rounded-md bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-900 shadow-sm hover:bg-sky-200 disabled:opacity-50"
                          disabled={isBusy === booking._id}
                          onClick={() => onPropose(booking)}
                          type="button"
                        >
                          Propose Slot
                        </button>
                        <button
                          className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
                          disabled={isBusy === booking._id}
                          onClick={() => onDecline(booking._id)}
                          type="button"
                        >
                          Decline
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

