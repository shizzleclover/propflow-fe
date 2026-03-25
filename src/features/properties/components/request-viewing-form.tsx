import { useState } from 'react'
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { Button } from '@/components/ui/button'

type RequestViewingFormProps = {
  propertyId: string
  bookingEnabled: boolean
}

function toIsoRange(startLocal: string, endLocal: string) {
  const start = new Date(startLocal)
  const end = new Date(endLocal)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return null
  }
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

export function RequestViewingForm({ propertyId, bookingEnabled }: RequestViewingFormProps) {
  const queryClient = useQueryClient()
  const [startLocal, setStartLocal] = useState('')
  const [endLocal, setEndLocal] = useState('')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const slot = toIsoRange(startLocal, endLocal)
      if (!slot) {
        throw new Error('Choose a valid start and end time (end after start).')
      }
      await api.post('/bookings', {
        propertyId,
        preferredSlots: [slot],
        clientNote: note.trim() || undefined,
      })
    },
    onSuccess: async () => {
      setFormError('')
      setNote('')
      setStartLocal('')
      setEndLocal('')
      await queryClient.invalidateQueries({ queryKey: ['client-requests'] })
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        setFormError(err.message)
        return
      }
      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.error?.message ?? 'Request failed. Try again.')
        return
      }
      setFormError('Request failed. Try again.')
    },
  })

  if (!bookingEnabled) {
    return (
      <p className="text-sm text-muted-foreground">Viewing requests are not enabled for this listing.</p>
    )
  }

  return (
    <div className="rounded-xl border border-sky-200/90 bg-sky-50/40 p-5 shadow-sm">
      <h3 className="text-lg font-semibold tracking-tight">Request a viewing</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick a preferred window. An agent will confirm or suggest another time.
      </p>
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          setFormError('')
          mutation.reset()
          mutation.mutate()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            <span>Start</span>
            <input
              className="input-field mt-1.5"
              onChange={(e) => setStartLocal(e.target.value)}
              required
              type="datetime-local"
              value={startLocal}
            />
          </label>
          <label className="block text-sm font-medium">
            <span>End</span>
            <input
              className="input-field mt-1.5"
              onChange={(e) => setEndLocal(e.target.value)}
              required
              type="datetime-local"
              value={endLocal}
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          <span>Note (optional)</span>
          <textarea
            className="input-field mt-1.5 min-h-[88px] resize-y"
            maxLength={2000}
            onChange={(e) => setNote(e.target.value)}
            value={note}
          />
        </label>
        {formError ? <p className="text-sm font-medium text-red-600">{formError}</p> : null}
        {mutation.isSuccess ? (
          <p className="text-sm font-medium text-emerald-700">Request sent. Check My Requests for status.</p>
        ) : null}
        <Button className="h-11 font-semibold" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? 'Sending…' : 'Submit request'}
        </Button>
      </form>
    </div>
  )
}
