import { useState, type ReactNode } from 'react'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function propertyCoverUrl(imageUrls?: string[] | null) {
  const first = imageUrls?.[0]
  return first && first.length > 0 ? first : null
}

type PropertyCardCoverProps = {
  imageUrls?: string[] | null
  title: string
  badge?: ReactNode
  className?: string
}

export function PropertyCardCover({ imageUrls, title, badge, className }: PropertyCardCoverProps) {
  const url = propertyCoverUrl(imageUrls)
  return (
    <div
      className={cn(
        'relative aspect-[4/3] w-full overflow-hidden bg-sky-100',
        className,
      )}
    >
      {url ? (
        <img
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          decoding="async"
          loading="lazy"
          src={url}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-sky-400">
          <Building2 aria-hidden className="h-14 w-14" strokeWidth={1.25} />
          <span className="text-xs font-medium">No photo</span>
        </div>
      )}
      {badge ? (
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">{badge}</div>
      ) : null}
    </div>
  )
}

type PropertyGalleryProps = {
  imageUrls?: string[] | null
  title: string
}

export function PropertyGallery({ imageUrls, title }: PropertyGalleryProps) {
  const list = (imageUrls ?? []).filter(Boolean)
  const [index, setIndex] = useState(0)

  if (list.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border-2 border-sky-100 bg-sky-50">
        <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 text-sky-400">
          <Building2 aria-hidden className="h-20 w-20" strokeWidth={1} />
          <span className="text-sm font-medium text-sky-600/80">Photos coming soon</span>
        </div>
      </div>
    )
  }

  const safeIndex = Math.min(index, list.length - 1)
  const main = list[safeIndex]

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border-2 border-sky-100 bg-sky-50 shadow-sm">
        <img
          alt={`${title} — photo ${safeIndex + 1} of ${list.length}`}
          className="aspect-[16/10] w-full object-cover"
          decoding="async"
          src={main}
        />
      </div>
      {list.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              className={cn(
                'h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                i === safeIndex ? 'border-primary' : 'border-transparent hover:border-sky-200',
              )}
              key={`${src}-${i}`}
              onClick={() => setIndex(i)}
              type="button"
            >
              <img alt="" className="h-full w-full object-cover" decoding="async" loading="lazy" src={src} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
