import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { getNeighborhoodLabel } from '@/lib/utils';

// Define a simplified Event type based on the schema
type Event = {
  id: number;
  title: string;
  starts_at: string;
  image_url?: string | null;
  venue_name?: string | null;
  venue_neighborhood?: string | null;
  neighborhood_tag_id?: number | null;
};

interface EventCardProps {
  event: Event;
}

// Neighborhood chip is optional; show “Location TBD” if none.
export default function EventCard({ event }: EventCardProps) {
  const formattedDate = new Date(event.starts_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const [neighborhood, setNeighborhood] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchNeighborhood() {
      const label = await getNeighborhoodLabel(event);
      setNeighborhood(label);
    }
    fetchNeighborhood();
  }, [event]);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={event.image_url || '/placeholder.png'}
            alt={event.title}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-bold truncate">{event.title}</CardTitle>
        <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
        <p className="text-sm text-gray-600 mt-2">{event.venue_name || 'Venue TBD'}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {neighborhood ? (
          <Badge variant="outline">{neighborhood}</Badge>
        ) : (
          <div className="h-6" /> // Placeholder for alignment
        )}
      </CardFooter>
    </Card>
  );
}
