import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { MarketingChrome } from '@/components/layouts/marketing-chrome'

export function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/auth/register-client', { name, email, password })
      navigate('/login')
    } catch {
      setError('Registration failed. Try another email.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MarketingChrome variant="auth">
      <div className="w-full rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign up to browse listings and request property viewings.
        </p>
        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-foreground">
            <span>Full name</span>
            <input
              autoComplete="name"
              className="input-field mt-1.5"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </label>
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
              autoComplete="new-password"
              className="input-field mt-1.5"
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              value={password}
            />
          </label>
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          <Button className="h-11 w-full text-sm font-semibold" disabled={submitting} type="submit">
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" to="/login">
            Sign in
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

