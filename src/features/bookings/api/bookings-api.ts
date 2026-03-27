import { api } from '@/lib/api/client'

export type BookingSlot = { start: string; end: string }
export type BookingProperty = {
  _id: string
  title: string
  description?: string
  listingCategory?: 'SALE' | 'RENT'
  price?: number
  imageUrls?: string[]
  address?: { line1?: string; city?: string; state?: string; country?: string }
}
export type BookingAgent = { _id: string; name: string; email: string }
export type BookingClient = { _id: string; name: string; email: string }

export type Booking = {
  _id: string
  status: 'PENDING' | 'PROPOSED' | 'APPROVED' | 'DECLINED' | 'CANCELLED'
  propertyId: string | BookingProperty
  agentId?: string | BookingAgent
  clientId?: string | BookingClient
  preferredSlots?: BookingSlot[]
  proposedSlot?: BookingSlot | null
  confirmedSlot?: BookingSlot | null
  clientNote?: string
  agentNote?: string
  createdAt?: string
  updatedAt?: string
}

export async function fetchClientRequests(): Promise<Booking[]> {
  const { data } = await api.get<{ bookings: Booking[] }>('/bookings')
  return data?.bookings ?? []
}

export async function fetchBookingById(id: string): Promise<Booking> {
  const { data } = await api.get<{ booking: Booking }>(`/bookings/${id}`)
  return data.booking
}

