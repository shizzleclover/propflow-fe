import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/app/layouts/app-shell'
import { AuthGuard } from '@/lib/auth/auth-guard'
import { PublicOnlyGuard } from '@/lib/auth/public-only-guard'
import { RoleGuard } from '@/lib/auth/role-guard'
import { Roles } from '@/lib/constants/roles'
import { LoginPage } from '@/features/auth/pages/login-page'
import { PropertyListPage } from '@/features/properties/pages/property-list-page'
import { PropertyDetailPage } from '@/features/properties/pages/property-detail-page'
import { ClientRequestsPage } from '@/features/bookings/pages/client-requests-page'
import { AgentBookingsPage } from '@/features/bookings/pages/agent-bookings-page'
import { AdminDashboardPage } from '@/features/dashboard/pages/admin-dashboard-page'
import { OverviewPage } from '@/features/dashboard/pages/overview-page'
import { PropertyCreatePage } from '@/features/properties/pages/property-create-page'
import { StaffDashboardPage } from '@/features/dashboard/pages/staff-dashboard-page'
import { UserManagementPage } from '@/features/users/pages/user-management-page'
import { RegisterPage } from '@/features/auth/pages/register-page'
import { LandingPage } from '@/features/marketing/pages/landing-page'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  {
    element: <PublicOnlyGuard />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/home', element: <OverviewPage /> },
          { path: '/properties', element: <PropertyListPage /> },
          {
            element: <RoleGuard allow={[Roles.ADMIN, Roles.AGENT]} />,
            children: [{ path: '/properties/new', element: <PropertyCreatePage /> }],
          },
          { path: '/properties/:id', element: <PropertyDetailPage /> },
          {
            element: <RoleGuard allow={[Roles.CLIENT]} />,
            children: [{ path: '/client/requests', element: <ClientRequestsPage /> }],
          },
          {
            element: <RoleGuard allow={[Roles.AGENT]} />,
            children: [{ path: '/agent/bookings', element: <AgentBookingsPage /> }],
          },
          {
            element: <RoleGuard allow={[Roles.STAFF]} />,
            children: [{ path: '/staff/dashboard', element: <StaffDashboardPage /> }],
          },
          {
            element: <RoleGuard allow={[Roles.ADMIN]} />,
            children: [
              { path: '/admin/dashboard', element: <AdminDashboardPage /> },
              { path: '/admin/users', element: <UserManagementPage /> },
            ],
          },
        ],
      },
    ],
  },
])

