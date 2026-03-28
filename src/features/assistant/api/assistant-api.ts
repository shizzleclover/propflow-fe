import { api } from '@/lib/api/client'
import type { Property } from '@/features/properties/api/properties-api'

export type AssistantMatch = {
  property: Property
  score: number
  reasons: string[]
}

export type AssistantChatResponse = {
  reply: string
  matches: AssistantMatch[]
  extracted: {
    listingCategory: string | null
    minPrice: number | null
    maxPrice: number | null
    minBeds: number | null
    maxBeds: number | null
    city: string | null
    intentSummary: string
  }
  meta: {
    mode: string
    relaxedFrom: string | null
    candidateCount: number
  }
}

export async function postAssistantChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
) {
  const { data } = await api.post<AssistantChatResponse>('/assistant/chat', { messages })
  return data
}
