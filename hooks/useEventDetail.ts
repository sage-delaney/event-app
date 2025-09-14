import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Event } from './useEventFeeds';

// Extended event type with organizer and tags
export type EventDetail = Event & {
  organizer?: {
    id: number;
    name: string;
    slug?: string | null;
    website?: string | null;
    instagram?: string | null;
    bio?: string | null;
  };
  tags?: {
    id: number;
    name: string;
    slug?: string | null;
    category_id: number;
    category?: {
      name: string;
    };
  }[];
};

// Hook to fetch single event with organizer and tags
export function useEventDetail(eventId: string | number) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async (): Promise<EventDetail | null> => {
      // First get the event with organizer
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          organizer:organizers(
            id,
            name,
            slug,
            website,
            instagram,
            bio
          )
        `)
        .eq('id', eventId)
        .single();

      if (eventError) {
        if (eventError.code === 'PGRST116') {
          // Event not found
          return null;
        }
        console.error('Error fetching event:', eventError);
        throw new Error(`Error fetching event: ${eventError.message}`);
      }

      // Get event tags with categories
      const { data: eventTags, error: tagsError } = await supabase
        .from('event_tags')
        .select(`
          tag:tags(
            id,
            name,
            slug,
            category_id,
            category:tag_categories(name)
          )
        `)
        .eq('event_id', eventId);

      if (tagsError) {
        console.error('Error fetching event tags:', tagsError);
        // Don't throw error for tags, just continue without them
      }

      // Flatten the tags structure with proper typing
      const tags = eventTags?.map((et: any) => ({
        id: et.tag.id,
        name: et.tag.name,
        slug: et.tag.slug,
        category_id: et.tag.category_id,
        category: et.tag.category
      })) || [];

      return {
        ...event,
        tags
      };
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook to get related events based on similar tags
// TODO: Replace with proper RPC-based recommendation algorithm
export function useRelatedEvents(eventId: string | number, tags: number[] = []) {
  return useQuery({
    queryKey: ['related-events', eventId, tags],
    queryFn: async (): Promise<Event[]> => {
      if (tags.length === 0) {
        // Fallback to recent events if no tags
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('visibility', 'public')
          .gte('starts_at', new Date().toISOString())
          .neq('id', eventId)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error fetching fallback related events:', error);
          return [];
        }

        return data || [];
      }

      // Get events that share at least one tag
      const { data: relatedEventTags, error: tagsError } = await supabase
        .from('event_tags')
        .select('event_id')
        .in('tag_id', tags)
        .neq('event_id', eventId);

      if (tagsError) {
        console.error('Error fetching related event tags:', tagsError);
        return [];
      }

      const relatedEventIds = Array.from(new Set(relatedEventTags?.map(et => et.event_id) || []));

      if (relatedEventIds.length === 0) {
        return [];
      }

      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .in('id', relatedEventIds)
        .eq('visibility', 'public')
        .gte('starts_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(6);

      if (eventsError) {
        console.error('Error fetching related events:', eventsError);
        return [];
      }

      return events || [];
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
