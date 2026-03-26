import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { createProperty } from '@/features/properties/api/properties-api'
import { fetchAgents } from '@/features/users/api/users-api'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { useMe } from '@/lib/auth/session'

function parseImageUrls(text: string): string[] {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function PropertyCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user } = useMe()
  const isAdmin = user?.role === 'ADMIN'

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['users', 'agents'],
    queryFn: fetchAgents,
    enabled: isAdmin,
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [listingCategory, setListingCategory] = useState<'SALE' | 'RENT'>('RENT')
  const [bookingEnabled, setBookingEnabled] = useState(true)
  const [assignedAgentId, setAssignedAgentId] = useState('')
  const [price, setPrice] = useState('')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')
  const [beds, setBeds] = useState('')
  const [baths, setBaths] = useState('')
  const [areaSqft, setAreaSqft] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [imageUrlsText, setImageUrlsText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAdmin && agents.length && !assignedAgentId) {
      setAssignedAgentId(agents[0].id)
    }
  }, [isAdmin, agents, assignedAgentId])

  const mutation = useMutation({
    mutationFn: createProperty,
    onSuccess: (property) => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
      navigate(`/properties/${property._id}`, { replace: true })
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.error?.message
        setError(typeof msg === 'string' ? msg : 'Could not create listing. Check fields and try again.')
        return
      }
      setError('Could not create listing. Check fields and try again.')
    },
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const priceNum = Number(price)
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError('Enter a valid price.')
      return
    }

    const imageUrls = parseImageUrls(imageUrlsText)
    const bedsNum = beds === '' ? undefined : Number(beds)
    const bathsNum = baths === '' ? undefined : Number(baths)
    const areaNum = areaSqft === '' ? undefined : Number(areaSqft)

    if (beds !== '' && (!Number.isInteger(bedsNum) || bedsNum! < 0)) {
      setError('Beds must be a whole number.')
      return
    }
    if (baths !== '' && (!Number.isInteger(bathsNum) || bathsNum! < 0)) {
      setError('Baths must be a whole number.')
      return
    }
    if (areaSqft !== '' && (!Number.isInteger(areaNum) || areaNum! < 0)) {
      setError('Area must be a whole number (sq ft).')
      return
    }

    const attributes = {
      ...(beds !== '' ? { beds: bedsNum } : {}),
      ...(baths !== '' ? { baths: bathsNum } : {}),
      ...(areaSqft !== '' ? { areaSqft: areaNum } : {}),
      ...(propertyType.trim() ? { propertyType: propertyType.trim() } : {}),
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      listingCategory,
      bookingEnabled,
      address: {
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        country: country.trim() || undefined,
      },
      price: priceNum,
      imageUrls: imageUrls.length ? imageUrls : undefined,
      attributes: Object.keys(attributes).length ? attributes : undefined,
      ...(isAdmin && assignedAgentId ? { assignedAgentId } : {}),
    }

    if (isAdmin && !assignedAgentId) {
      setError('Select an agent.')
      return
    }

    mutation.mutate(payload)
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-sky-950 shadow-sm outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-200'

  return (
    <section>
      <PageHeader
        subtitle="Publish a listing with address, price, and optional photos. Clients see it once it is available."
        title={isAdmin ? 'Add property' : 'Add listing'}
      />

      <div className="mb-6">
        <Link className="text-sm font-medium text-sky-800 underline-offset-4 hover:underline" to="/properties">
          ← Back to properties
        </Link>
      </div>

      <form
        className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-sky-200/80 bg-white p-6 shadow-sm sm:p-8"
        onSubmit={onSubmit}
      >
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <div>
          <label className="text-sm font-medium text-sky-950" htmlFor="title">
            Title
          </label>
          <input className={inputClass} id="title" onChange={(ev) => setTitle(ev.target.value)} required value={title} />
        </div>

        <div>
          <label className="text-sm font-medium text-sky-950" htmlFor="description">
            Description
          </label>
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            id="description"
            onChange={(ev) => setDescription(ev.target.value)}
            value={description}
          />
        </div>

        {isAdmin ? (
          <div>
            <label className="text-sm font-medium text-sky-950" htmlFor="agent">
              Assigned agent
            </label>
            <select
              className={inputClass}
              disabled={agentsLoading || agents.length === 0}
              id="agent"
              onChange={(ev) => setAssignedAgentId(ev.target.value)}
              required
              value={assignedAgentId}
            >
              {agents.length === 0 && !agentsLoading ? (
                <option value="">No agents found</option>
              ) : null}
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.email})
                </option>
              ))}
            </select>
            {agents.length === 0 && !agentsLoading ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Create an agent account under Users before adding properties.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-sky-950" htmlFor="category">
              Listing type
            </label>
            <select
              className={inputClass}
              id="category"
              onChange={(ev) => setListingCategory(ev.target.value as 'SALE' | 'RENT')}
              value={listingCategory}
            >
              <option value="SALE">Sale</option>
              <option value="RENT">Rent</option>
            </select>
          </div>
          <div className="flex items-end gap-2 pb-2">
            <input
              checked={bookingEnabled}
              className="h-4 w-4 rounded border-sky-300 text-sky-600 focus:ring-sky-200"
              id="booking"
              onChange={(ev) => setBookingEnabled(ev.target.checked)}
              type="checkbox"
            />
            <label className="text-sm font-medium text-sky-950" htmlFor="booking">
              Allow viewing requests
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-sky-950" htmlFor="price">
            Price {listingCategory === 'RENT' ? '(per night)' : ''}
          </label>
          <input
            className={inputClass}
            id="price"
            inputMode="decimal"
            min={0}
            onChange={(ev) => setPrice(ev.target.value)}
            required
            step="any"
            type="number"
            value={price}
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-sky-950">Address</legend>
          <div>
            <label className="text-sm font-medium text-sky-950" htmlFor="line1">
              Line 1
            </label>
            <input className={inputClass} id="line1" onChange={(ev) => setLine1(ev.target.value)} required value={line1} />
          </div>
          <div>
            <label className="text-sm font-medium text-sky-950" htmlFor="line2">
              Line 2
            </label>
            <input className={inputClass} id="line2" onChange={(ev) => setLine2(ev.target.value)} value={line2} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-sky-950" htmlFor="city">
                City
              </label>
              <input className={inputClass} id="city" onChange={(ev) => setCity(ev.target.value)} required value={city} />
            </div>
            <div>
              <label className="text-sm font-medium text-sky-950" htmlFor="state">
                State / region
              </label>
              <input className={inputClass} id="state" onChange={(ev) => setState(ev.target.value)} value={state} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-sky-950" htmlFor="postal">
                Postal code
              </label>
              <input className={inputClass} id="postal" onChange={(ev) => setPostalCode(ev.target.value)} value={postalCode} />
            </div>
            <div>
              <label className="text-sm font-medium text-sky-950" htmlFor="country">
                Country
              </label>
              <input className={inputClass} id="country" onChange={(ev) => setCountry(ev.target.value)} value={country} />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-sky-950">Details (optional)</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-sky-950" htmlFor="beds">
                Beds
              </label>
              <input className={inputClass} id="beds" min={0} onChange={(ev) => setBeds(ev.target.value)} type="number" value={beds} />
            </div>
            <div>
              <label className="text-sm font-medium text-sky-950" htmlFor="baths">
                Baths
              </label>
              <input className={inputClass} id="baths" min={0} onChange={(ev) => setBaths(ev.target.value)} type="number" value={baths} />
            </div>
            <div>
              <label className="text-sm font-medium text-sky-950" htmlFor="sqft">
                Area (sq ft)
              </label>
              <input className={inputClass} id="sqft" min={0} onChange={(ev) => setAreaSqft(ev.target.value)} type="number" value={areaSqft} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-sky-950" htmlFor="ptype">
              Property type
            </label>
            <input className={inputClass} id="ptype" onChange={(ev) => setPropertyType(ev.target.value)} placeholder="e.g. Condo" value={propertyType} />
          </div>
        </fieldset>

        <div>
          <label className="text-sm font-medium text-sky-950" htmlFor="images">
            Image URLs (one per line, https)
          </label>
          <textarea
            className={`${inputClass} min-h-[88px] resize-y font-mono text-xs`}
            id="images"
            onChange={(ev) => setImageUrlsText(ev.target.value)}
            placeholder="https://example.com/photo1.jpg"
            value={imageUrlsText}
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? 'Saving…' : 'Publish listing'}
          </Button>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
            to="/properties"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  )
}
