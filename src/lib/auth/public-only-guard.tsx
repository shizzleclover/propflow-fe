import { Navigate, Outlet } from 'react-router-dom'
import { getAccessToken } from './token-storage'
import { roleHomePath, useMe } from './session'

export function PublicOnlyGuard() {
  const token = getAccessToken()
  const { data: user, isLoading } = useMe(Boolean(token))

  if (!token) return <Outlet />
  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading session...</div>
  if (user) return <Navigate replace to={roleHomePath(user.role)} />

  return <Outlet />
}

