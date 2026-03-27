import { api } from '@/lib/api/client'

export type PropertyAddress = {
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode?: string
  country?: string
}

export type PropertyAttributes = {
  beds?: number
  baths?: number
  areaSqft?: number
  propertyType?: string
}

export type AssignedAgent = {
  _id: string
  name: string
  email: string
}

export type Property = {
  _id: string
  title: string
  description?: string
  status: string
  listingCategory?: string
  bookingEnabled?: boolean
  imageUrls?: string[]
  price: number
  address: PropertyAddress
  attributes?: PropertyAttributes
  assignedAgentId: string | AssignedAgent
  createdAt?: string
  updatedAt?: string
}

export type PropertyFilters = {
  listingCategory?: 'SALE' | 'RENT'
}

export async function fetchProperties(filters?: PropertyFilters): Promise<Property[]> {
  const { data } = await api.get<{ properties: Property[] }>('/properties', {
    params: filters,
  })
  return data?.properties ?? []
}

export async function fetchPropertyById(id: string): Promise<Property> {
  const { data } = await api.get<{ property: Property }>(`/properties/${id}`)
  return data.property
}

export type CreatePropertyPayload = {
  title: string
  description?: string
  listingCategory?: 'SALE' | 'RENT'
  bookingEnabled?: boolean
  assignedAgentId?: string
  address: PropertyAddress
  price: number
  imageUrls?: string[]
  attributes?: PropertyAttributes
}

export async function createProperty(payload: CreatePropertyPayload): Promise<Property> {
  const { data } = await api.post<{ property: Property }>('/properties', payload)
  return data.property
}

export async function updateProperty(id: string, payload: Partial<CreatePropertyPayload & { status: string }>): Promise<Property> {
  const { data } = await api.patch<{ property: Property }>(`/properties/${id}`, payload)
  return data.property
}

export async function deleteProperty(id: string): Promise<void> {
  await api.delete(`/properties/${id}`)
}
