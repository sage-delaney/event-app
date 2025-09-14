import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Define a simplified Event type based on the schema from lib/schema-validator.ts
type Event = {
  id: number;
  title: string;
  starts_at: string;
  visibility: 'public' | 'private' | 'unlisted';
  image_url?: string | null;
  venue_name?: string | null;
  venue_neighborhood?: string | null;
  neighborhood_tag_id?: number | null;
  created_at: string;
};

type QueryResult = {
  events: Event[];
  usedFallback: boolean;
};

// Events join to tags via event_tags.
// Only show upcoming, public events.
async function fetchEventsByTwoTags(
  musicTagId: number,
  vibeTagId: number
): Promise<QueryResult> {
  console.log('Fetching events for tag IDs:', { musicTagId, vibeTagId });
  
  // 1. Get event IDs that have both tags using a subquery approach
  const { data: musicEventTags, error: musicError } = await supabase
    .from('event_tags')
    .select('event_id')
    .eq('tag_id', musicTagId);

  if (musicError) {
    console.error('Error fetching music event tags:', musicError);
    throw new Error(`Error fetching music event tags: ${musicError.message}`);
  }

  const { data: vibeEventTags, error: vibeError } = await supabase
    .from('event_tags')
    .select('event_id')
    .eq('tag_id', vibeTagId);

  if (vibeError) {
    console.error('Error fetching vibe event tags:', vibeError);
    throw new Error(`Error fetching vibe event tags: ${vibeError.message}`);
  }

  // Find events that have both tags
  const musicEventIds = new Set(musicEventTags?.map(et => et.event_id) || []);
  const vibeEventIds = new Set(vibeEventTags?.map(et => et.event_id) || []);
  const commonEventIds = Array.from(musicEventIds).filter(id => vibeEventIds.has(id));

  console.log('Found common event IDs:', commonEventIds);

  if (commonEventIds.length > 0) {
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', commonEventIds)
      .eq('visibility', 'public')
      .gte('starts_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(12);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw new Error(`Error fetching events: ${eventsError.message}`);
    }

    console.log('Found matching events:', events?.length || 0);
    return { events: events || [], usedFallback: false };
  }

  // 2. Fallback Query: New & Noteworthy
  console.log('No events found with both tags, falling back to recent events');
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  const { data: fallbackEvents, error: fallbackError } = await supabase
    .from('events')
    .select('*')
    .eq('visibility', 'public')
    .gte('starts_at', new Date().toISOString())
    .gte('created_at', tenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(12);

  if (fallbackError) {
    console.error('Error fetching fallback events:', fallbackError);
    throw new Error(`Error fetching fallback events: ${fallbackError.message}`);
  }

  console.log('Found fallback events:', fallbackEvents?.length || 0);
  return { events: fallbackEvents || [], usedFallback: true };
}

export function useEventsByTwoTags(
  musicTagId: number | null,
  vibeTagId: number | null
) {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<QueryResult, Error>(
    {
      queryKey: ['events', musicTagId, vibeTagId],
      queryFn: () => {
        if (!musicTagId || !vibeTagId) {
          // This should not happen due to the 'enabled' flag, but as a safeguard:
          return Promise.resolve({ events: [], usedFallback: false });
        }
        return fetchEventsByTwoTags(musicTagId, vibeTagId);
      },
      enabled: !!(musicTagId && vibeTagId), // Only run query if both IDs exist
      placeholderData: (previousData) => previousData, // Keep previous data while refetching
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes
    }
  );

  return {
    events: data?.events || [],
    isLoading,
    isError,
    isUpdating: isFetching && !isLoading, // For showing a subtle 'Updating...' badge
    usedFallback: data?.usedFallback || false,
    refetch,
  };
}
