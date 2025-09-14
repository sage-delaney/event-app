import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

function SkeletonCard() {
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full bg-muted animate-pulse" />
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="h-6 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-12 bg-muted rounded-full animate-pulse" />
        </div>
      </CardFooter>
    </Card>
  )
}

function SkeletonSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="h-4 bg-muted rounded animate-pulse w-64" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  )
}

export default function EventsLoading() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <div className="h-9 bg-muted rounded animate-pulse w-64 mx-auto" />
        <div className="h-4 bg-muted rounded animate-pulse w-96 mx-auto" />
      </div>

      <SkeletonSection />
      <SkeletonSection />
      <SkeletonSection />
    </div>
  )
}
