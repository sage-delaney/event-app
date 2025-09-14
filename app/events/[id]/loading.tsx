import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function EventDetailLoading() {
  return (
    <div className="space-y-8">
      {/* Back button skeleton */}
      <div className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
      </div>

      {/* Hero section skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <div className="relative h-96 lg:h-[500px] rounded-lg bg-muted animate-pulse" />

        {/* Event details skeleton */}
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Title */}
            <div className="h-9 bg-muted rounded animate-pulse" />
            
            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 bg-muted rounded animate-pulse mt-0.5" />
              <div className="h-5 bg-muted rounded animate-pulse w-64" />
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 bg-muted rounded animate-pulse mt-0.5" />
              <div className="space-y-2">
                <div className="h-5 bg-muted rounded animate-pulse w-48" />
                <div className="h-4 bg-muted rounded animate-pulse w-56" />
                <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-12 bg-muted rounded-full animate-pulse" />
              <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <div className="h-10 bg-muted rounded animate-pulse flex-1" />
              <div className="h-10 w-20 bg-muted rounded animate-pulse" />
              <div className="h-10 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Description skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
          <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
        </div>
      </div>

      {/* Organizer skeleton */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded animate-pulse w-32" />
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded animate-pulse w-40" />
            <div className="h-4 bg-muted rounded animate-pulse w-64" />
            <div className="flex gap-3">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </Card>

      {/* Tags skeleton */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded animate-pulse w-40" />
          <div className="h-4 bg-muted rounded animate-pulse w-56" />
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-16" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 w-16 bg-muted rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
