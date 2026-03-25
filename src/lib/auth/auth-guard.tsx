import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { clearAccessToken, getAccessToken } from './token-storage'
import { useMe } from './session'

export function AuthGuard() {
  const location = useLocation()
  const token = getAccessToken()
  const { data: user, isLoading } = useMe(Boolean(token))

  if (!token) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading session...</div>
  if (!user) {
    clearAccessToken()
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}

