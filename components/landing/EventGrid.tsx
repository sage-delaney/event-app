import EventCard from './EventCard';
import SkeletonCard from './SkeletonCard';
import { Button } from '@/components/ui/button';

// Define a simplified Event type to match EventCard's expectations
type Event = {
  id: number;
  title: string;
  starts_at: string;
  image_url?: string | null;
  venue_name?: string | null;
  venue_neighborhood?: string | null;
  neighborhood_tag_id?: number | null;
};

interface EventGridProps {
  events: Event[];
  isLoading: boolean;
  isUpdating: boolean;
  usedFallback: boolean;
  isError: boolean;
  onRetry: () => void;
}

export default function EventGrid({
  events,
  isLoading,
  isUpdating,
  usedFallback,
  isError,
  onRetry,
}: EventGridProps) {
  if (isError) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-red-500">Something went wrong</h3>
        <p className="text-gray-500 mt-2">We couldn't fetch events. Please try again.</p>
        <Button onClick={onRetry} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold">No events found</h3>
        <p className="text-gray-500 mt-2">Try a different combination of interests.</p>
        <Button variant="outline" className="mt-4">
          Try another vibe
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {isUpdating && (
        <div className="absolute top-2 right-2 z-10">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Updating...
          </span>
        </div>
      )}
      {usedFallback && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight">New & Noteworthy</h2>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
