import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { formatEventDate } from '@/lib/date';
import { Calendar, MapPin } from 'lucide-react';

export interface EventCardProps {
  id: number;
  title: string;
  starts_at: string;
  ends_at?: string | null;
  venue_name: string;
  image_url?: string | null;
  is_21_plus?: boolean | null;
  is_dog_friendly?: boolean | null;
  neighborhoodName?: string | null;
  className?: string;
}

export default function EventCard({
  id,
  title,
  starts_at,
  ends_at,
  venue_name,
  image_url,
  is_21_plus,
  is_dog_friendly,
  neighborhoodName,
  className = "",
}: EventCardProps) {
  const formattedDate = formatEventDate(starts_at, ends_at || undefined);

  return (
    <Link href={`/events/${id}`}>
      <Card className={`w-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${className}`}>
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={image_url || '/placeholder.png'}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <CardTitle className="text-lg font-bold line-clamp-2 mb-2">{title}</CardTitle>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{venue_name}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center gap-2 flex-wrap">
            {neighborhoodName && (
              <Badge variant="outline" className="text-xs">
                {neighborhoodName}
              </Badge>
            )}
            {is_21_plus && (
              <Badge variant="secondary" className="text-xs">
                21+
              </Badge>
            )}
            {is_dog_friendly && (
              <Badge variant="secondary" className="text-xs">
                🐕 Friendly
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
