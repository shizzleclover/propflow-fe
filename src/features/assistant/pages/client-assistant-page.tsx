import { useMutation } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import {
  postAssistantChat,
  type AssistantMatch,
} from '@/features/assistant/api/assistant-api'
import { PropertyCardCover } from '@/features/properties/components/property-media'
import { formatMoneyNGN } from '@/lib/formatters/money'

type ChatMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; matches?: AssistantMatch[] }

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    'Describe the home you are looking for — city, rent or buy, budget in naira, bedrooms, and anything that matters to you. I will search live listings and rank the closest matches.',
}

export function ClientAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const mutation = useMutation({
    mutationFn: postAssistantChat,
  })

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const send = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || mutation.isPending) return

    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    const nextThread = [...messages, userMsg]
    setMessages(nextThread)
    setInput('')

    const payload = nextThread.map((m) => ({ role: m.role, content: m.content }))

    try {
      const data = await mutation.mutateAsync(payload)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, matches: data.matches },
      ])
      requestAnimationFrame(scrollToBottom)
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Something went wrong while searching. Check your connection and try again, or browse listings from the main catalog.',
        },
      ])
    }
  }, [input, messages, mutation, scrollToBottom])

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-sky-800/90">
          Assistant
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-sky-950 sm:text-3xl">
          Find a home in your own words
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Your messages are matched against current inventory using filters and text similarity. Add
          an OpenAI key on the server for smarter parsing and ranking.
        </p>
      </div>

      <div className="flex max-h-[min(32rem,55vh)] flex-col overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
          {messages.map((m, i) => (
            <div key={i}>
              <div
                className={[
                  'max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'ml-auto bg-sky-600 text-white'
                    : 'mr-auto border border-sky-100 bg-sky-50/80 text-sky-950',
                ].join(' ')}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
              {m.role === 'assistant' && m.matches && m.matches.length > 0 ? (
                <div className="mt-3 space-y-3 pl-0 sm:pl-1">
                  {m.matches.map(({ property, reasons }) => {
                    const id = property._id
                    const category = property.listingCategory ?? 'SALE'
                    const isRent = category === 'RENT'
                    return (
                      <Link
                        className="flex gap-3 overflow-hidden rounded-xl border border-sky-200/70 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        key={id}
                        to={`/properties/${id}`}
                      >
                        <div className="w-24 shrink-0 overflow-hidden rounded-lg sm:w-28">
                          <PropertyCardCover
                            imageUrls={property.imageUrls}
                            title={property.title}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-sky-800/90">
                            {isRent ? 'Rent' : 'Sale'}
                          </p>
                          <p className="line-clamp-2 font-medium text-sky-950">{property.title}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin aria-hidden className="size-3.5 shrink-0" />
                            <span className="truncate">
                              {property.address.city}
                              {property.address.state ? `, ${property.address.state}` : ''}
                            </span>
                          </p>
                          <p className="mt-1 text-sm font-semibold text-sky-950">
                            {formatMoneyNGN(property.price)}
                          </p>
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {reasons.slice(0, 3).map((r) => (
                              <li
                                className="rounded-full bg-sky-100/90 px-2 py-0.5 text-[11px] text-sky-900"
                                key={r}
                              >
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : null}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-sky-100 bg-white p-3 sm:p-4">
          {mutation.isError ? (
            <p className="mb-2 text-xs text-destructive">Request failed. You can try again.</p>
          ) : null}
          <div className="flex gap-2">
            <textarea
              className="min-h-[2.75rem] flex-1 resize-y rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={mutation.isPending}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              placeholder="e.g. 3 bed to rent in Lagos under 2m per year…"
              rows={2}
              value={input}
            />
            <button
              className="shrink-0 self-end rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
              disabled={mutation.isPending || !input.trim()}
              onClick={() => void send()}
              type="button"
            >
              {mutation.isPending ? '…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
