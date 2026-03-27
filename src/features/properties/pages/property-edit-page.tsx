import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPropertyById, updateProperty } from '@/features/properties/api/properties-api'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { useMe } from '@/lib/auth/session'

function parseImageUrls(text: string): string[] {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function PropertyEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user } = useMe()
  const { data, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchPropertyById(id!),
    enabled: Boolean(id),
  })

  const canEdit = useMemo(() => {
    if (!user || !data) return false
    if (user.role === 'ADMIN') return true
    if (user.role === 'AGENT') {
      const assigned = data.assignedAgentId
      const agentId = typeof assigned === 'object' ? assigned._id : assigned
      return agentId === user.id
    }
    return false
  }, [data, user])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [listingCategory, setListingCategory] = useState<'SALE' | 'RENT'>('RENT')
  const [status, setStatus] = useState<'AVAILABLE' | 'UNDER_OFFER' | 'UNAVAILABLE'>('AVAILABLE')
  const [bookingEnabled, setBookingEnabled] = useState(true)
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
    if (!data) return
    setTitle(data.title ?? '')
    setDescription(data.description ?? '')
    setListingCategory((data.listingCategory as 'SALE' | 'RENT') ?? 'RENT')
    setStatus((data.status as 'AVAILABLE' | 'UNDER_OFFER' | 'UNAVAILABLE') ?? 'AVAILABLE')
    setBookingEnabled(data.bookingEnabled !== false)
    setPrice(String(data.price ?? ''))
    setLine1(data.address?.line1 ?? '')
    setLine2(data.address?.line2 ?? '')
    setCity(data.address?.city ?? '')
    setState(data.address?.state ?? '')
    setPostalCode(data.address?.postalCode ?? '')
    setCountry(data.address?.country ?? '')
    setBeds(data.attributes?.beds !== undefined ? String(data.attributes?.beds) : '')
    setBaths(data.attributes?.baths !== undefined ? String(data.attributes?.baths) : '')
    setAreaSqft(data.attributes?.areaSqft !== undefined ? String(data.attributes?.areaSqft) : '')
    setPropertyType(data.attributes?.propertyType ?? '')
    setImageUrlsText((data.imageUrls ?? []).join('\n'))
  }, [data])

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateProperty>[1]) => updateProperty(id!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['property', id] })
      await queryClient.invalidateQueries({ queryKey: ['properties'] })
      navigate(`/properties/${id}`, { replace: true })
    },
    onError: () => setError('Could not update listing. Check fields and try again.'),
  })

  if (!id) return <Navigate replace to="/properties" />
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading listing…</p>
  if (!canEdit) return <Navigate replace to="/home" />

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const priceNum = Number(price)
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError('Enter a valid price.')
      return
    }
    const bedsNum = beds === '' ? undefined : Number(beds)
    const bathsNum = baths === '' ? undefined : Number(baths)
    const areaNum = areaSqft === '' ? undefined : Number(areaSqft)
    const imageUrls = parseImageUrls(imageUrlsText)

    mutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      listingCategory,
      bookingEnabled,
      status,
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
      attributes: {
        ...(bedsNum !== undefined ? { beds: bedsNum } : {}),
        ...(bathsNum !== undefined ? { baths: bathsNum } : {}),
        ...(areaNum !== undefined ? { areaSqft: areaNum } : {}),
        ...(propertyType.trim() ? { propertyType: propertyType.trim() } : {}),
      },
    })
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-sky-950 shadow-sm outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-200'

  return (
    <section>
      <PageHeader subtitle="Update listing details and publish changes." title="Edit property" />
      <div className="mb-6">
        <Link className="text-sm font-medium text-sky-800 underline-offset-4 hover:underline" to={`/properties/${id}`}>
          ← Back to listing
        </Link>
      </div>
      <form className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-sky-200/80 bg-white p-6 shadow-sm sm:p-8" onSubmit={onSubmit}>
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        <div>
          <label className="text-sm font-medium text-sky-950" htmlFor="title">Title</label>
          <input className={inputClass} id="title" onChange={(ev) => setTitle(ev.target.value)} required value={title} />
        </div>
        <div>
          <label className="text-sm font-medium text-sky-950" htmlFor="description">Description</label>
          <textarea className={`${inputClass} min-h-[100px] resize-y`} id="description" onChange={(ev) => setDescription(ev.target.value)} value={description} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-sky-950" htmlFor="category">Listing type</label>
            <select className={inputClass} id="category" onChange={(ev) => setListingCategory(ev.target.value as 'SALE' | 'RENT')} value={listingCategory}>
              <option value="SALE">Sale</option>
              <option value="RENT">Rent</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-sky-950" htmlFor="status">Status</label>
            <select className={inputClass} id="status" onChange={(ev) => setStatus(ev.target.value as 'AVAILABLE' | 'UNDER_OFFER' | 'UNAVAILABLE')} value={status}>
              <option value="AVAILABLE">Available</option>
              <option value="UNDER_OFFER">Under offer</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>
          <div className="flex items-end gap-2 pb-2">
            <input checked={bookingEnabled} className="h-4 w-4 rounded border-sky-300 text-sky-600 focus:ring-sky-200" id="booking" onChange={(ev) => setBookingEnabled(ev.target.checked)} type="checkbox" />
            <label className="text-sm font-medium text-sky-950" htmlFor="booking">Allow requests</label>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-sky-950" htmlFor="price">Price</label>
          <input className={inputClass} id="price" onChange={(ev) => setPrice(ev.target.value)} required type="number" value={price} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-sm font-medium text-sky-950" htmlFor="line1">Address line 1</label><input className={inputClass} id="line1" onChange={(ev) => setLine1(ev.target.value)} required value={line1} /></div>
          <div><label className="text-sm font-medium text-sky-950" htmlFor="line2">Address line 2</label><input className={inputClass} id="line2" onChange={(ev) => setLine2(ev.target.value)} value={line2} /></div>
          <div><label className="text-sm font-medium text-sky-950" htmlFor="city">City</label><input className={inputClass} id="city" onChange={(ev) => setCity(ev.target.value)} required value={city} /></div>
          <div><label className="text-sm font-medium text-sky-950" htmlFor="state">State</label><input className={inputClass} id="state" onChange={(ev) => setState(ev.target.value)} value={state} /></div>
          <div><label className="text-sm font-medium text-sky-950" htmlFor="postal">Postal code</label><input className={inputClass} id="postal" onChange={(ev) => setPostalCode(ev.target.value)} value={postalCode} /></div>
          <div><label className="text-sm font-medium text-sky-950" htmlFor="country">Country</label><input className={inputClass} id="country" onChange={(ev) => setCountry(ev.target.value)} value={country} /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <div><label className="text-sm font-medium text-sky-950" htmlFor="beds">Beds</label><input className={inputClass} id="beds" min={0} onChange={(ev) => setBeds(ev.target.value)} type="number" value={beds} /></div>
          <div><label className="text-sm font-medium text-sky-950" htmlFor="baths">Baths</label><input className={inputClass} id="baths" min={0} onChange={(ev) => setBaths(ev.target.value)} type="number" value={baths} /></div>
          <div><label className="text-sm font-medium text-sky-950" htmlFor="sqft">Area</label><input className={inputClass} id="sqft" min={0} onChange={(ev) => setAreaSqft(ev.target.value)} type="number" value={areaSqft} /></div>
          <div><label className="text-sm font-medium text-sky-950" htmlFor="ptype">Type</label><input className={inputClass} id="ptype" onChange={(ev) => setPropertyType(ev.target.value)} value={propertyType} /></div>
        </div>
        <div>
          <label className="text-sm font-medium text-sky-950" htmlFor="images">Image URLs (one per line)</label>
          <textarea className={`${inputClass} min-h-[88px] resize-y font-mono text-xs`} id="images" onChange={(ev) => setImageUrlsText(ev.target.value)} value={imageUrlsText} />
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Saving…' : 'Save changes'}</Button>
          <Link className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted" to={`/properties/${id}`}>Cancel</Link>
        </div>
      </form>
    </section>
  )
}

