import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { Role } from '@/lib/constants/roles'

export type AuthUser = {
  id: string
  role: Role
  name: string
  email: string
  status: 'ACTIVE' | 'DEACTIVATED'
}

export async function fetchMe(): Promise<AuthUser | null> {
  const { data } = await api.get('/auth/me')
  return data?.user ?? null
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled,
    retry: false,
  })
}

/** Default landing after login or when redirected from a forbidden route */
export function roleHomePath(_role: Role) {
  return '/home'
}

