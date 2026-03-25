import { api } from '@/lib/api/client'

export type UserRow = {
  id: string
  name: string
  email: string
  role: string
  status: string
}

export async function fetchAgents(): Promise<UserRow[]> {
  const { data } = await api.get<{ users: UserRow[] }>('/users', { params: { role: 'AGENT' } })
  return data?.users ?? []
}
