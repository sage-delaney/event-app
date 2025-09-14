import { getEvents } from '@/lib/queries/events'
import EventCard from '@/components/EventCard'
import TryAgainButton from '@/components/TryAgainButton'
import { AlertCircle } from 'lucide-react'

interface EventsSectionProps {
  title: string
  description: string
  events: any[]
  error?: string | null
}

function EventsSection({ title, description, events, error }: EventsSectionProps) {
  if (error) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        <div className="text-center py-12 border-2 border-dashed border-destructive/20 rounded-lg">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <TryAgainButton />
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              starts_at={event.starts_at}
              ends_at={event.ends_at}
              venue_name={event.venue_name}
              image_url={event.image_url}
              is_21_plus={event.is_21_plus}
              is_dog_friendly={event.is_dog_friendly}
              neighborhoodName={event.neighborhoodName}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <p className="text-muted-foreground">No events yet. Please check back soon.</p>
        </div>
      )}
    </section>
  )
}

export default async function EventsPage() {
  let topEvents: any[] = []
  let hotEvents: any[] = []
  let newEvents: any[] = []
  let topError: string | null = null
  let hotError: string | null = null
  let newError: string | null = null

  try {
    // Fetch all three sections in parallel
    const results = await Promise.allSettled([
      getEvents({ section: 'top', limit: 12 }),
      getEvents({ section: 'hot', limit: 12 }),
      getEvents({ section: 'new', limit: 12 }),
    ])

    // Handle results
    if (results[0].status === 'fulfilled') {
      topEvents = results[0].value
    } else {
      topError = 'Failed to load top events'
      console.error('Top events error:', results[0].reason)
    }

    if (results[1].status === 'fulfilled') {
      hotEvents = results[1].value
    } else {
      hotError = 'Failed to load hot events'
      console.error('Hot events error:', results[1].reason)
    }

    if (results[2].status === 'fulfilled') {
      newEvents = results[2].value
    } else {
      newError = 'Failed to load new events'
      console.error('New events error:', results[2].reason)
    }
  } catch (error) {
    console.error('Unexpected error fetching events:', error)
    topError = 'Something went wrong'
    hotError = 'Something went wrong'
    newError = 'Something went wrong'
  }

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Discover Events</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find exciting events happening in your area. Connect with your community and explore new experiences.
        </p>
      </div>

      <EventsSection
        title="Top For You"
        description="Handpicked events we think you'll love"
        events={topEvents}
        error={topError}
      />

      <EventsSection
        title="Also Hot This Week"
        description="Popular events happening soon"
        events={hotEvents}
        error={hotError}
      />

      <EventsSection
        title="New & Noteworthy"
        description="Fresh events added in the last 10 days"
        events={newEvents}
        error={newError}
      />
    </div>
  )
}
