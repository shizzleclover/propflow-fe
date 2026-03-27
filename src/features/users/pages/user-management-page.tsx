import { PageHeader } from '@/components/shared/page-header'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteUser, fetchUsers, updateUser, type UserRow } from '@/features/users/api/users-api'
import { useState } from 'react'

export function UserManagementPage() {
  const queryClient = useQueryClient()
  const [busyId, setBusyId] = useState<string | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  async function onToggleStatus(user: UserRow) {
    setBusyId(user.id)
    await updateMutation.mutateAsync({
      id: user.id,
      status: user.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE',
    })
    setBusyId(null)
  }

  async function onRename(user: UserRow) {
    const next = window.prompt('Enter updated name', user.name)?.trim()
    if (!next || next === user.name) return
    setBusyId(user.id)
    await updateMutation.mutateAsync({ id: user.id, name: next })
    setBusyId(null)
  }

  async function onDelete(user: UserRow) {
    const ok = window.confirm(`Delete user "${user.name}" (${user.email})?`)
    if (!ok) return
    setBusyId(user.id)
    await deleteMutation.mutateAsync(user.id)
    setBusyId(null)
  }

  return (
    <section>
      <PageHeader
        subtitle="View, edit, deactivate, and delete team accounts."
        title="User Management"
      />
      {isLoading ? <p className="text-sm text-muted-foreground">Loading users…</p> : null}

      <div className="space-y-3 sm:hidden">
        {data?.map((user) => (
          <article className="rounded-xl border border-sky-200/80 bg-white p-4 shadow-sm" key={user.id}>
            <p className="font-semibold text-sky-950">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-sky-50 px-2 py-1 font-medium text-sky-900">{user.role}</span>
              <span className="rounded-md border border-border px-2 py-1">{user.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-md border border-border px-2 py-1 text-xs" disabled={busyId === user.id} onClick={() => onRename(user)} type="button">Edit</button>
              <button className="rounded-md border border-border px-2 py-1 text-xs" disabled={busyId === user.id} onClick={() => onToggleStatus(user)} type="button">
                {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </button>
              <button className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700" disabled={busyId === user.id} onClick={() => onDelete(user)} type="button">Delete</button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/60">
            <tr>
              <th className="px-4 py-3 font-semibold text-foreground">Name</th>
              <th className="px-4 py-3 font-semibold text-foreground">Email</th>
              <th className="px-4 py-3 font-semibold text-foreground">Role</th>
              <th className="px-4 py-3 font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((user) => (
              <tr className="border-b border-border last:border-b-0 hover:bg-muted/30" key={user.id}>
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{user.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-md border border-border px-2 py-1 text-xs">{user.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-md border border-border px-2 py-1 text-xs" disabled={busyId === user.id} onClick={() => onRename(user)} type="button">Edit</button>
                    <button className="rounded-md border border-border px-2 py-1 text-xs" disabled={busyId === user.id} onClick={() => onToggleStatus(user)} type="button">
                      {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700" disabled={busyId === user.id} onClick={() => onDelete(user)} type="button">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

