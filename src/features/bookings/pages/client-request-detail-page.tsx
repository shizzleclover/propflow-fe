import { Link, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBookingById, addBookingMessage, type Booking, type BookingSlot } from '@/features/bookings/api/bookings-api'
import { formatMoneyNGN } from '@/lib/formatters/money'
import { useState } from 'react'

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

function statusSummary(status: Booking['status']) {
  if (status === 'PENDING') return 'Your request is awaiting review from the assigned agent.'
  if (status === 'PROPOSED') return 'The agent proposed a new slot. Review details below.'
  if (status === 'APPROVED') return 'Your request has been approved and confirmed.'
  if (status === 'DECLINED') return 'This request was declined by the agent.'
  return 'This request was cancelled.'
}

export function ClientRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['client-request', id],
    queryFn: () => fetchBookingById(id!),
    enabled: Boolean(id),
  })

  async function onSendMessage() {
    if (!id || !message.trim()) return
    setIsSending(true)
    try {
      await addBookingMessage(id, message.trim())
      setMessage('')
      await queryClient.invalidateQueries({ queryKey: ['client-request', id] })
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message.')
    } finally {
      setIsSending(false)
    }
  }

  if (!id) {
    return (
      <p className="text-sm text-muted-foreground">
        Missing request id.{' '}
        <Link className="text-primary underline-offset-4 hover:underline" to="/client/requests">
          Back to My Requests
        </Link>
      </p>
    )
  }
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading request details…</p>
  if (isError || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="font-medium">Request not found.</p>
        <Link className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline" to="/client/requests">
          ← Back to My Requests
        </Link>
      </div>
    )
  }

  const property = typeof data.propertyId === 'object' ? data.propertyId : null
  const agent = data.agentId && typeof data.agentId === 'object' ? data.agentId : null

  return (
    <section>
      <Link className="mb-6 inline-flex text-sm font-medium text-muted-foreground hover:text-foreground" to="/client/requests">
        ← My Requests
      </Link>

      <article className="rounded-2xl border border-sky-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-sky-950">Request details</h1>
            <p className="mt-1 text-sm text-muted-foreground">Request ID: {data._id}</p>
          </div>
          <span className="rounded-md border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900">
            {data.status}
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Progress</span>
            <span>{data.status}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-sky-100">
            <div
              className={[
                'h-full rounded-full transition-all',
                data.status === 'DECLINED' || data.status === 'CANCELLED' ? 'bg-amber-500' : 'bg-sky-600',
              ].join(' ')}
              style={{ width: `${progressValue(data.status)}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{statusSummary(data.status)}</p>
        </div>

        {property ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-[220px_1fr]">
            {property.imageUrls?.[0] ? (
              <img alt={property.title} className="h-40 w-full rounded-xl object-cover" src={property.imageUrls[0]} />
            ) : (
              <div className="h-40 rounded-xl bg-sky-50" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-sky-950">{property.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {(property.listingCategory ?? 'SALE') === 'RENT' ? 'Rent /night' : 'Buy'}
                {property.price ? ` · ${formatMoneyNGN(property.price)}` : ''}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {[property.address?.line1, property.address?.city, property.address?.state, property.address?.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              <Link className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline" to={`/properties/${property._id}`}>
                Open listing page
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preferred slot</p>
            <p className="mt-1 text-foreground">{bookingSlotText(data.preferredSlots?.[0])}</p>
          </div>
          <div className="rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confirmed slot</p>
            <p className="mt-1 text-foreground">{bookingSlotText(data.confirmedSlot)}</p>
          </div>
        </div>

        {data.proposedSlot ? (
          <p className="mt-3 text-sm text-foreground">
            <span className="font-semibold">Agent proposed:</span> {bookingSlotText(data.proposedSlot)}
          </p>
        ) : null}
        {data.clientNote ? (
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Your note:</span> {data.clientNote}
          </p>
        ) : null}
        {data.agentNote ? (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Agent note:</span> {data.agentNote}
          </p>
        ) : null}
        {agent ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Agent: <span className="font-medium text-foreground">{agent.name}</span> ({agent.email})
          </p>
        ) : null}

        <div className="mt-10 border-t border-sky-100 pt-8">
          <h3 className="text-lg font-semibold text-sky-950">Messages</h3>
          <p className="text-sm text-muted-foreground">Communicate with your assigned agent below.</p>

          <div className="mt-4 space-y-4">
            {data.messages?.length ? (
              <div className="flex flex-col gap-3">
                {data.messages.map((msg, idx) => {
                  const isMe = msg.role === 'CLIENT'
                  return (
                    <div className={['flex flex-col max-w-[80%]', isMe ? 'self-end items-end' : 'self-start items-start'].join(' ')} key={idx}>
                      <div className={['rounded-2xl px-4 py-2 text-sm shadow-sm', isMe ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-sky-50 text-sky-950 border border-sky-100 rounded-tl-none'].join(' ')}>
                        {msg.text}
                      </div>
                      <span className="mt-1 text-[10px] text-muted-foreground">
                        {isMe ? 'You' : agent?.name ?? msg.role} · {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="py-4 text-center text-sm italic text-muted-foreground">No messages yet.</p>
            )}

            <div className="mt-6">
              <textarea
                className="w-full rounded-xl border border-sky-200 bg-sky-50/30 p-3 text-sm outline-none ring-sky-500/20 transition-all focus:border-sky-500 focus:ring-4"
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message to the agent…"
                rows={3}
                value={message}
              />
              <div className="mt-2 flex justify-end">
                <button
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                  disabled={!message.trim() || isSending}
                  onClick={onSendMessage}
                  type="button"
                >
                  {isSending ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}

