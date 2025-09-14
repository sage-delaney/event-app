import { getEventById } from '@/lib/queries/events'
import { Badge } from '@/components/ui/badge'
import SaveButton from '@/components/SaveButton'
import ShareButton from '@/components/ShareButton'
import TicketsButton from '@/components/TicketsButton'
import Image from 'next/image'
import Link from 'next/link'
import { formatEventDate } from '@/lib/date'
import { notFound } from 'next/navigation'
import { 
  Calendar, 
  MapPin, 
  ArrowLeft,
  Globe,
  Instagram
} from 'lucide-react'

interface EventDetailPageProps {
  params: {
    id: string
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  let event;
  
  try {
    event = await getEventById(params.id);
  } catch (error) {
    console.error('Error fetching event:', error);
    // Return error state
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            <p className="text-muted-foreground">We couldn&apos;t load this event. Please try again later.</p>
            <Link href="/events" className="inline-flex items-center gap-2 mt-4 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const formattedDate = formatEventDate(event.starts_at, event.ends_at || undefined);

  // Group tags by category for better display
  const tagsByCategory = event.tags?.reduce((acc: Record<string, any[]>, tag: any) => {
    const categoryName = tag.category?.name || 'Other';
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(tag);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link href="/events" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      {/* Hero section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event image */}
        <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden">
          <Image
            src={event.image_url || '/placeholder.png'}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Event details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
            
            {/* Date and time */}
            <div className="flex items-start gap-3 mb-4">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{formattedDate}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{event.venue_name}</p>
                <p className="text-sm text-muted-foreground">{event.address_text}</p>
                {event.neighborhoodName && (
                  <Badge variant="outline" className="mt-1">
                    {event.neighborhoodName}
                  </Badge>
                )}
              </div>
            </div>

            {/* Event badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {event.is_21_plus && (
                <Badge variant="secondary">21+</Badge>
              )}
              {event.is_dog_friendly && (
                <Badge variant="secondary">🐕 Dog Friendly</Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {event.visibility}
              </Badge>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <TicketsButton ticketUrl={event.ticket_url || undefined} className="flex-1" />
              <SaveButton eventId={event.id} variant="outline" />
              <ShareButton event={event} />
            </div>
          </div>
        </div>
      </div>

      {/* Event description */}
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold mb-4">About this event</h2>
        <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
      </div>

      {/* Organizer info */}
      {event.organizer && (
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Organized by</h3>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{event.organizer.name}</h4>
              {event.organizer.bio && (
                <p className="text-muted-foreground mt-2">{event.organizer.bio}</p>
              )}
              <div className="flex gap-3 mt-3">
                {event.organizer.website && (
                  <a
                    href={event.organizer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {event.organizer.instagram && (
                  <a
                    href={`https://instagram.com/${event.organizer.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tags section with "Because you like..." */}
      {Object.keys(tagsByCategory).length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Because you like...</h3>
            <p className="text-muted-foreground text-sm">
              {/* TODO: Power a real "Because you like..." explanation using ranking signals later */}
              Events with these themes and vibes
            </p>
          </div>
          
          <div className="space-y-4">
            {Object.entries(tagsByCategory).map(([categoryName, tags]) => (
              <div key={categoryName}>
                <h4 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                  {categoryName}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: any) => (
                    <Badge key={tag.id} variant="default">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
