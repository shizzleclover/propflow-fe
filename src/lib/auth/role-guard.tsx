import { Navigate, Outlet } from 'react-router-dom'
import type { Role } from '@/lib/constants/roles'
import { roleHomePath, useMe } from './session'

type RoleGuardProps = { allow: Role[] }

export function RoleGuard({ allow }: RoleGuardProps) {
  const { data: user, isLoading } = useMe()

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Checking access...</div>
  if (!user) return <Navigate replace to="/login" />
  if (!allow.includes(user.role)) return <Navigate replace to={roleHomePath(user.role)} />

  return <Outlet />
}

