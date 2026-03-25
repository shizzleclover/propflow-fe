import { PageHeader } from '@/components/shared/page-header'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

async function fetchUsers() {
  const { data } = await api.get('/users')
  return data?.users ?? []
}

export function UserManagementPage() {
  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers })

  return (
    <section>
      <PageHeader
        subtitle="Create, view, and deactivate team accounts."
        title="User Management"
      />
      {isLoading ? <p className="text-sm text-muted-foreground">Loading users…</p> : null}
      <div className="overflow-hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/60">
            <tr>
              <th className="px-4 py-3 font-semibold text-foreground">Name</th>
              <th className="px-4 py-3 font-semibold text-foreground">Email</th>
              <th className="px-4 py-3 font-semibold text-foreground">Role</th>
              <th className="px-4 py-3 font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((user: any) => (
              <tr className="border-b border-border last:border-b-0 hover:bg-muted/30" key={user.id}>
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{user.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-md border border-border px-2 py-1 text-xs">{user.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

