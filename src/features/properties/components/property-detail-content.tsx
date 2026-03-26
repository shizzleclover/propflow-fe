import type { ReactNode } from 'react'
import type { Property } from '@/features/properties/api/properties-api'
import { PropertyGallery } from '@/features/properties/components/property-media'
import { formatMoneyNGN } from '@/lib/formatters/money'

function agentLabel(property: Property) {
  const a = property.assignedAgentId
  if (a && typeof a === 'object' && 'name' in a) {
    return { name: a.name, email: a.email }
  }
  return null
}

type PropertyDetailContentProps = {
  property: Property
  /** Extra actions below meta (e.g. booking form) */
  footer?: ReactNode
  /** Set false in inline quick view to avoid duplicating the image gallery */
  showGallery?: boolean
}

export function PropertyDetailContent({ property, footer, showGallery = true }: PropertyDetailContentProps) {
  const agent = agentLabel(property)
  const attrs = property.attributes ?? {}

  return (
    <div className="space-y-6">
      {showGallery ? <PropertyGallery imageUrls={property.imageUrls} title={property.title} /> : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{property.title}</h2>
          <p className="mt-2 text-muted-foreground">
            {[property.address?.line1, property.address?.line2].filter(Boolean).join(', ')}
            <br />
            {[property.address?.city, property.address?.state, property.address?.postalCode]
              .filter(Boolean)
              .join(', ')}
            {property.address?.country ? ` · ${property.address.country}` : null}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tabular-nums text-sky-950">
            {formatMoneyNGN(property.price)}
            {(property.listingCategory ?? 'SALE') === 'RENT' ? (
              <span className="text-lg font-medium text-muted-foreground"> /night</span>
            ) : null}
          </p>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{property.listingCategory ?? 'SALE'}</span>
            <span className="rounded-md border border-border px-2 py-1 text-xs font-medium">{property.status}</span>
            <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
              Viewings: {property.bookingEnabled === false ? 'Off' : 'On'}
            </span>
          </div>
        </div>
      </div>

      {property.description ? (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Description</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{property.description}</p>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Details</h3>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-sky-100 bg-sky-50/50 px-3 py-2">
            <dt className="text-muted-foreground">Bedrooms</dt>
            <dd className="font-medium">{attrs.beds ?? '—'}</dd>
          </div>
          <div className="rounded-lg border border-sky-100 bg-sky-50/50 px-3 py-2">
            <dt className="text-muted-foreground">Bathrooms</dt>
            <dd className="font-medium">{attrs.baths ?? '—'}</dd>
          </div>
          <div className="rounded-lg border border-sky-100 bg-sky-50/50 px-3 py-2">
            <dt className="text-muted-foreground">Area</dt>
            <dd className="font-medium">{attrs.areaSqft ? `${attrs.areaSqft} sq ft` : '—'}</dd>
          </div>
          <div className="rounded-lg border border-sky-100 bg-sky-50/50 px-3 py-2">
            <dt className="text-muted-foreground">Type</dt>
            <dd className="font-medium">{attrs.propertyType || '—'}</dd>
          </div>
        </dl>
      </div>

      {agent ? (
        <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Listing contact</h3>
          <p className="mt-2 font-medium">{agent.name}</p>
          <a className="text-sm text-primary underline-offset-4 hover:underline" href={`mailto:${agent.email}`}>
            {agent.email}
          </a>
        </div>
      ) : null}

      {footer ? <div className="border-t border-border pt-6">{footer}</div> : null}
    </div>
  )
}
