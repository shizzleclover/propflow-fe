import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { setAccessToken } from '@/lib/auth/token-storage'
import { roleHomePath } from '@/lib/auth/session'
import { Button } from '@/components/ui/button'
import { MarketingChrome } from '@/components/layouts/marketing-chrome'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('admin@propflow.dev')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const { data } = await api.post('/auth/login', { email, password })
      if (data?.accessToken) {
        setAccessToken(data.accessToken)
        await queryClient.invalidateQueries({ queryKey: ['me'] })
        const target = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
        navigate(target ?? roleHomePath(data.user.role), { replace: true })
      }
    } catch {
      setError('Login failed. Check credentials and backend status.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MarketingChrome variant="auth">
      <div className="w-full rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your admin, staff, agent, or client account.
        </p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-foreground">
            <span>Email</span>
            <input
              autoComplete="email"
              className="input-field mt-1.5"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              value={email}
            />
          </label>

          <label className="block text-sm font-medium text-foreground">
            <span>Password</span>
            <input
              autoComplete="current-password"
              className="input-field mt-1.5"
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          <Button className="h-11 w-full text-sm font-semibold" disabled={submitting} type="submit">
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New user?{' '}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" to="/register">
            Create a client account
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link className="text-sm text-muted-foreground hover:text-foreground" to="/">
            ← Back to home
          </Link>
        </p>
      </div>
    </MarketingChrome>
  )
}

