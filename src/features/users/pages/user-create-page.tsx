import { PageHeader } from '@/components/shared/page-header'
import { Roles } from '@/lib/constants/roles'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser } from '@/features/users/api/users-api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'

const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Invalid email address'),
  role: z.enum([Roles.ADMIN, Roles.STAFF, Roles.AGENT, Roles.CLIENT]),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
})

type UserFormValues = z.infer<typeof userFormSchema>

export function UserCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate('/admin/users')
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role: Roles.AGENT,
    },
  })

  const onSubmit = async (values: UserFormValues) => {
    try {
      await mutation.mutateAsync(values)
    } catch (error) {
      console.error('Failed to create user:', error)
      alert('Failed to create user. Email might already be in use.')
    }
  }

  return (
    <section className="max-w-2xl">
      <Link className="mb-6 inline-flex text-sm font-medium text-muted-foreground hover:text-foreground" to="/admin/users">
        ← Back to User Management
      </Link>
      <PageHeader subtitle="Create a new account for an agent, staff, or administrator." title="Add New User" />

      <form className="mt-4 space-y-6 rounded-2xl border border-sky-100 bg-white p-6 shadow-sm sm:p-8" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-950" htmlFor="name">
              Full Name
            </label>
            <input
              {...register('name')}
              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 transition-all focus:border-sky-500 focus:ring-4"
              id="name"
              placeholder="e.g. John Doe"
              type="text"
            />
            {errors.name ? <p className="text-xs font-medium text-red-500">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-950" htmlFor="email">
              Email Address
            </label>
            <input
              {...register('email')}
              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 transition-all focus:border-sky-500 focus:ring-4"
              id="email"
              placeholder="e.g. john@nexahomes.dev"
              type="email"
            />
            {errors.email ? <p className="text-xs font-medium text-red-500">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-950" htmlFor="role">
              Account Role
            </label>
            <select
              {...register('role')}
              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 transition-all focus:border-sky-500 focus:ring-4"
              id="role"
            >
              <option value={Roles.AGENT}>Agent</option>
              <option value={Roles.STAFF}>Staff</option>
              <option value={Roles.ADMIN}>Administrator</option>
              <option value={Roles.CLIENT}>Client (Default)</option>
            </select>
            {errors.role ? <p className="text-xs font-medium text-red-500">{errors.role.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-950" htmlFor="password">
              Initial Password
            </label>
            <input
              {...register('password')}
              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 transition-all focus:border-sky-500 focus:ring-4"
              id="password"
              placeholder="At least 8 characters"
              type="password"
            />
            {errors.password ? <p className="text-xs font-medium text-red-500">{errors.password.message}</p> : null}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            className="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Creating User…' : 'Create User Account'}
          </button>
        </div>
      </form>
    </section>
  )
}
