import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPropertyById } from '@/features/properties/api/properties-api'
import { PropertyDetailContent } from '@/features/properties/components/property-detail-content'
import { RequestViewingForm } from '@/features/properties/components/request-viewing-form'
import { useMe } from '@/lib/auth/session'

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user } = useMe()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchPropertyById(id!),
    enabled: Boolean(id),
  })

  if (!id) {
    return (
      <p className="text-sm text-muted-foreground">
        Missing listing id.{' '}
        <Link className="text-primary underline-offset-4 hover:underline" to="/properties">
          Back to listings
        </Link>
      </p>
    )
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading listing…</p>
  }
  if (isError || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="font-medium">Listing not found or not available.</p>
        <Link className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline" to="/properties">
          ← Back to listings
        </Link>
      </div>
    )
  }

  const showBooking = user?.role === 'CLIENT' && data.status === 'AVAILABLE'

  return (
    <section>
      <Link
        className="mb-6 inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
        to="/properties"
      >
        ← All listings
      </Link>
      <article className="rounded-2xl border border-sky-200/90 bg-white p-6 shadow-sm sm:p-8">
        <PropertyDetailContent
          footer={
            showBooking ? (
              <RequestViewingForm bookingEnabled={data.bookingEnabled !== false} propertyId={data._id} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Clients request viewings on this page for available listings. Agents, staff, and admins use the nav to
                manage bookings and inventory.
              </p>
            )
          }
          property={data}
        />
      </article>
    </section>
  )
}
