import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchPropertyById } from '@/features/properties/api/properties-api'
import { PropertyDetailContent } from '@/features/properties/components/property-detail-content'

type PropertyExpandPanelProps = {
  propertyId: string
}

export function PropertyExpandPanel({ propertyId }: PropertyExpandPanelProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => fetchPropertyById(propertyId),
  })

  if (isLoading) {
    return (
      <div className="px-5 py-4 text-sm text-muted-foreground">
        Loading full listing…
      </div>
    )
  }
  if (isError || !data) {
    return (
      <div className="px-5 py-4 text-sm text-red-600">
        Could not load listing details.
      </div>
    )
  }

  return (
    <div className="px-5 py-6">
      <PropertyDetailContent property={data} showGallery={false} />
      <p className="mt-6 text-center">
        <Link
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          to={`/properties/${propertyId}`}
        >
          Open full listing with photos
        </Link>
      </p>
    </div>
  )
}
