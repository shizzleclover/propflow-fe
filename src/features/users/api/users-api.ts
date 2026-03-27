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

export async function fetchUsers(): Promise<UserRow[]> {
  const { data } = await api.get<{ users: UserRow[] }>('/users')
  return data?.users ?? []
}

export async function updateUser(payload: { id: string; name?: string; status?: 'ACTIVE' | 'DEACTIVATED' }): Promise<UserRow> {
  const { id, ...patch } = payload
  const { data } = await api.patch<{ user: UserRow }>(`/users/${id}`, patch)
  return data.user
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`)
}
