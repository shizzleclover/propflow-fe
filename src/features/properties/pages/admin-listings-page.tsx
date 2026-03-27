import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteProperty, fetchProperties, type Property } from '@/features/properties/api/properties-api'
import { formatMoneyNGN } from '@/lib/formatters/money'
import { PageHeader } from '@/components/shared/page-header'

export function AdminListingsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => fetchProperties(),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
      await queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })

  function canDelete(property: Property) {
    return property.status !== 'UNDER_OFFER'
  }

  return (
    <section>
      <PageHeader
        actions={
          <Link className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" to="/properties/new">
            Add listing
          </Link>
        }
        subtitle="Central place for admins to edit and remove listings."
        title="Manage Listings"
      />

      {isLoading ? <p className="text-sm text-muted-foreground">Loading listings…</p> : null}

      <div className="space-y-3 sm:hidden">
        {data?.map((property) => (
          <article className="rounded-xl border border-sky-200/80 bg-white p-4 shadow-sm" key={property._id}>
            <p className="font-semibold text-sky-950">{property.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {(property.listingCategory ?? 'SALE') === 'RENT' ? 'Rent /night' : 'Sale'} · {formatMoneyNGN(property.price)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {property.address?.line1}, {property.address?.city}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className="rounded-md border border-border px-2 py-1 text-xs" to={`/properties/${property._id}`}>
                View
              </Link>
              <Link className="rounded-md border border-border px-2 py-1 text-xs" to={`/properties/${property._id}/edit`}>
                Edit
              </Link>
              <button
                className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700"
                disabled={!canDelete(property) || deleteMutation.isPending}
                onClick={() => {
                  if (!window.confirm(`Delete "${property.title}"?`)) return
                  deleteMutation.mutate(property._id)
                }}
                type="button"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/60">
            <tr>
              <th className="px-4 py-3 font-semibold text-foreground">Title</th>
              <th className="px-4 py-3 font-semibold text-foreground">Type</th>
              <th className="px-4 py-3 font-semibold text-foreground">Price</th>
              <th className="px-4 py-3 font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 font-semibold text-foreground">City</th>
              <th className="px-4 py-3 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((property) => (
              <tr className="border-b border-border last:border-b-0 hover:bg-muted/30" key={property._id}>
                <td className="px-4 py-3 font-medium">{property.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{property.listingCategory ?? 'SALE'}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatMoneyNGN(property.price)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md border border-border px-2 py-1 text-xs">{property.status}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{property.address?.city}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link className="rounded-md border border-border px-2 py-1 text-xs" to={`/properties/${property._id}`}>
                      View
                    </Link>
                    <Link className="rounded-md border border-border px-2 py-1 text-xs" to={`/properties/${property._id}/edit`}>
                      Edit
                    </Link>
                    <button
                      className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700"
                      disabled={!canDelete(property) || deleteMutation.isPending}
                      onClick={() => {
                        if (!window.confirm(`Delete "${property.title}"?`)) return
                        deleteMutation.mutate(property._id)
                      }}
                      type="button"
                    >
                      Delete
                    </button>
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

