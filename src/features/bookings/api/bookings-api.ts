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

export type BookingMessage = {
  senderId: string
  role: string
  text: string
  createdAt: string
}

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
  messages?: BookingMessage[]
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

export async function addBookingMessage(id: string, text: string): Promise<Booking> {
  const { data } = await api.post<{ booking: Booking }>(`/bookings/${id}/messages`, { text })
  return data.booking
}

export async function approveBooking(id: string, confirmedSlot: BookingSlot, agentNote?: string): Promise<Booking> {
  const { data } = await api.patch<{ booking: Booking }>(`/bookings/${id}/approve`, { confirmedSlot, agentNote })
  return data.booking
}

export async function proposeBooking(id: string, proposedSlot: BookingSlot, agentNote?: string): Promise<Booking> {
  const { data } = await api.patch<{ booking: Booking }>(`/bookings/${id}/propose`, { proposedSlot, agentNote })
  return data.booking
}

export async function declineBooking(id: string, agentNote?: string): Promise<Booking> {
  const { data } = await api.patch<{ booking: Booking }>(`/bookings/${id}/decline`, { agentNote })
  return data.booking
}

