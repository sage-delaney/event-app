import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { getNeighborhoodLabel } from '@/lib/utils';
import { useSaveEvent } from '@/hooks/useEventFeeds';
import { Heart, Share2, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { Event } from '@/hooks/useEventFeeds';

interface FeedEventCardProps {
  event: Event;
  isSaved?: boolean;
  onSaveToggle?: (eventId: number, isSaved: boolean) => void;
}

export default function FeedEventCard({ event, isSaved = false, onSaveToggle }: FeedEventCardProps) {
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { saveEvent, unsaveEvent } = useSaveEvent();

  const formattedDate = new Date(event.starts_at).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  React.useEffect(() => {
    async function fetchNeighborhood() {
      const label = await getNeighborhoodLabel(event);
      setNeighborhood(label);
    }
    fetchNeighborhood();
  }, [event]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      if (isSaved) {
        await unsaveEvent(event.id);
      } else {
        await saveEvent(event.id);
      }
      onSaveToggle?.(event.id, !isSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const canonicalUrl = `${window.location.origin}/events/${event.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          url: canonicalUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(canonicalUrl);
        // TODO: Show "Link copied." notification
        console.log('Link copied.');
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  const handleTickets = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (event.ticket_url) {
      window.open(event.ticket_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="w-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={event.image_url || '/placeholder.png'}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-bold line-clamp-2 mb-2">{event.title}</CardTitle>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{event.venue_name}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {neighborhood && (
              <Badge variant="outline" className="text-xs">
                {neighborhood}
              </Badge>
            )}
            {event.is_21_plus && (
              <Badge variant="secondary" className="text-xs">
                21+
              </Badge>
            )}
            {event.is_dog_friendly && (
              <Badge variant="secondary" className="text-xs">
                🐕 Friendly
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <Heart 
                className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 w-8 p-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            
            {event.ticket_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTickets}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
