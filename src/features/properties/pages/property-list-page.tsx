import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin } from 'lucide-react'
import { fetchProperties } from '@/features/properties/api/properties-api'
import { PropertyCardCover } from '@/features/properties/components/property-media'
import { PageHeader } from '@/components/shared/page-header'
import { useMe } from '@/lib/auth/session'
import { formatMoneyNGN } from '@/lib/formatters/money'

export function PropertyListPage() {
  const [listingFilter, setListingFilter] = useState<'ALL' | 'SALE' | 'RENT'>('ALL')
  const { data: user } = useMe()
  const isClient = user?.role === 'CLIENT'
  const { data, isLoading } = useQuery({
    queryKey: ['properties', listingFilter],
    queryFn: () =>
      fetchProperties(listingFilter === 'ALL' ? undefined : { listingCategory: listingFilter }),
  })

  return (
    <section>
      {isClient ? (
        <div className="mb-8 overflow-hidden rounded-2xl border border-sky-200/90 bg-white shadow-sm">
          <div className="border-b border-sky-100 bg-sky-50/90 px-6 py-8 sm:px-10 sm:py-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-800/90">Marketplace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-sky-950 sm:text-4xl">
              Homes and rentals in one place
            </h1>
            <p className="mt-3 max-w-2xl text-base text-sky-900/70">
              Tap any listing to see the full gallery and details, then request a viewing when you are ready.
            </p>
          </div>
        </div>
      ) : (
        <PageHeader
          subtitle="Listing photos and details from your inventory. Tap a card to open the full page."
          title="Properties"
        />
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading listings…</p>
      ) : null}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {[
          { key: 'ALL' as const, label: 'All listings' },
          { key: 'SALE' as const, label: 'Buy' },
          { key: 'RENT' as const, label: 'Rent' },
        ].map((item) => (
          <button
            className={[
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              listingFilter === item.key
                ? 'border-sky-300 bg-sky-100 text-sky-950'
                : 'border-sky-200 bg-white text-sky-800 hover:bg-sky-50',
            ].join(' ')}
            key={item.key}
            onClick={() => setListingFilter(item.key)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((property) => {
          const id = property._id
          const category = property.listingCategory ?? 'SALE'
          const isRent = category === 'RENT'

          return (
            <Link
              className="group block overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              key={id}
              to={`/properties/${id}`}
            >
              <PropertyCardCover
                badge={
                  <>
                    <span className="rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-sky-900 shadow-sm">
                      {isRent ? 'Rent' : 'Sale'}
                    </span>
                    {property.status === 'AVAILABLE' ? (
                      <span className="rounded-md bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                        Available
                      </span>
                    ) : null}
                  </>
                }
                imageUrls={property.imageUrls}
                title={property.title}
              />

              <div className="p-4 sm:p-5">
                <h2 className="text-lg font-semibold leading-snug tracking-tight text-sky-950 group-hover:text-primary">
                  {property.title}
                </h2>

                <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                  <span>
                    {property.address?.line1}, {property.address?.city}
                  </span>
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md border border-sky-100 bg-sky-50 px-2 py-1 font-medium text-sky-900">
                    {property.attributes?.beds ?? '—'} bd · {property.attributes?.baths ?? '—'} ba
                  </span>
                  {property.attributes?.propertyType ? (
                    <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">
                      {property.attributes.propertyType}
                    </span>
                  ) : null}
                  <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">
                    Viewings {property.bookingEnabled === false ? 'off' : 'on'}
                  </span>
                </div>

                <p className="mt-4 text-2xl font-semibold tabular-nums text-sky-950">
                  {formatMoneyNGN(property.price)}
                  {isRent ? <span className="text-base font-medium text-muted-foreground"> /night</span> : null}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
