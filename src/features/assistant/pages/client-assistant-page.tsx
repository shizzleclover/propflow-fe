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
    <section className="mx-auto flex w-full max-w-full flex-col gap-4 sm:gap-6 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
      <div className="shrink-0 px-0 sm:px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-800/90 sm:text-sm">
          Assistant
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-sky-950 sm:text-2xl lg:text-3xl xl:text-4xl">
          Find a home in your own words
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-[1.05rem]">
          Your messages are matched against current inventory using filters and text similarity. Add
          an OpenAI key on the server for smarter parsing and ranking.
        </p>
      </div>

      <div
        className={[
          'flex min-h-[min(22rem,calc(100dvh-11rem))] flex-col overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-sm',
          'sm:min-h-[min(26rem,calc(100dvh-10rem))]',
          'md:rounded-3xl',
          'lg:min-h-[calc(100dvh-9rem)] lg:shadow-md',
          'xl:min-h-[calc(100dvh-8.25rem)]',
        ].join(' ')}
      >
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4 sm:space-y-5 sm:px-5 sm:py-5 lg:px-8 lg:py-6">
          {messages.map((m, i) => (
            <div key={i}>
              <div
                className={[
                  'rounded-2xl px-3.5 py-3 leading-relaxed sm:px-5 sm:py-3.5 sm:text-base lg:px-6 lg:py-4 lg:text-[1.0625rem]',
                  m.role === 'user'
                    ? 'ml-auto max-w-[min(100%,90%)] bg-sky-600 text-sm text-white sm:max-w-[min(100%,34rem)] md:max-w-[min(100%,40rem)] sm:text-base'
                    : 'mr-auto max-w-full border border-sky-100 bg-sky-50/80 text-sm text-sky-950 md:max-w-[min(100%,52rem)] lg:max-w-[min(100%,62rem)] sm:text-base',
                ].join(' ')}
              >
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
              </div>
              {m.role === 'assistant' && m.matches && m.matches.length > 0 ? (
                <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 sm:pl-1 md:grid-cols-2 md:gap-5 2xl:grid-cols-3">
                  {m.matches.map(({ property, reasons }) => {
                    const id = property._id
                    const category = property.listingCategory ?? 'SALE'
                    const isRent = category === 'RENT'
                    return (
                      <Link
                        className="flex min-h-[5.5rem] gap-3 overflow-hidden rounded-xl border border-sky-200/70 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-0 sm:gap-4 sm:p-4 lg:rounded-2xl"
                        key={id}
                        to={`/properties/${id}`}
                      >
                        <div className="w-[5.5rem] shrink-0 overflow-hidden rounded-lg sm:w-32 md:w-36 lg:w-40">
                          <PropertyCardCover
                            imageUrls={property.imageUrls}
                            title={property.title}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-sky-800/90 sm:text-sm">
                            {isRent ? 'Rent' : 'Sale'}
                          </p>
                          <p className="line-clamp-2 text-sm font-medium text-sky-950 sm:text-base">
                            {property.title}
                          </p>
                          <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground sm:text-sm">
                            <MapPin
                              aria-hidden
                              className="mt-0.5 size-3.5 shrink-0 sm:size-4"
                            />
                            <span className="break-words">
                              {property.address.city}
                              {property.address.state ? `, ${property.address.state}` : ''}
                            </span>
                          </p>
                          <p className="mt-1 text-sm font-semibold text-sky-950 sm:text-base">
                            {formatMoneyNGN(property.price)}
                          </p>
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {reasons.slice(0, 3).map((r) => (
                              <li
                                className="rounded-full bg-sky-100/90 px-2 py-0.5 text-[11px] text-sky-900 sm:text-xs"
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

        <div className="shrink-0 border-t border-sky-100 bg-white p-3 sm:p-4 lg:px-8 lg:py-5">
          {mutation.isError ? (
            <p className="mb-2 text-xs text-destructive sm:text-sm">Request failed. You can try again.</p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
            <textarea
              className="min-h-[3.25rem] w-full flex-1 resize-y rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[3.5rem] sm:py-3 sm:text-base lg:min-h-[4.5rem] lg:px-4 lg:py-3.5 lg:text-[1.0625rem]"
              disabled={mutation.isPending}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              placeholder="e.g. 3 bed to rent in Lagos under 2m per year…"
              rows={3}
              value={input}
            />
            <button
              className="min-h-11 w-full shrink-0 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-50 sm:min-h-[3.25rem] sm:w-auto sm:min-w-[6.5rem] sm:self-end lg:min-h-[3.5rem] lg:px-6"
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
