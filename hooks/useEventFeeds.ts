import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Event type based on the schema
export type Event = {
  id: number;
  title: string;
  description: string;
  starts_at: string;
  ends_at?: string | null;
  venue_name: string;
  address_text: string;
  venue_neighborhood?: string | null;
  neighborhood_tag_id?: number | null;
  ticket_url?: string | null;
  is_21_plus: boolean;
  is_dog_friendly: boolean;
  visibility: 'public' | 'private' | 'unlisted';
  image_url?: string | null;
  created_at: string;
  organizer_id: number;
};

// Hook for "Top For You" - upcoming public events ordered by created_at descending
export function useTopForYouEvents() {
  return useQuery({
    queryKey: ['events', 'top-for-you'],
    queryFn: async (): Promise<Event[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('visibility', 'public')
        .gte('starts_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching top events:', error);
        throw new Error(`Error fetching top events: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook for "Also Hot This Week" - upcoming public events ordered by starts_at ascending
export function useHotThisWeekEvents() {
  return useQuery({
    queryKey: ['events', 'hot-this-week'],
    queryFn: async (): Promise<Event[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('visibility', 'public')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(12);

      if (error) {
        console.error('Error fetching hot events:', error);
        throw new Error(`Error fetching hot events: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook for "New & Noteworthy" - events created within last 10 days
export function useNewAndNoteworthyEvents() {
  return useQuery({
    queryKey: ['events', 'new-noteworthy'],
    queryFn: async (): Promise<Event[]> => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('visibility', 'public')
        .gte('starts_at', new Date().toISOString())
        .gte('created_at', tenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching new events:', error);
        throw new Error(`Error fetching new events: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook for saving/unsaving events
export function useSaveEvent() {
  const saveEvent = async (eventId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('saved_events')
      .upsert({ user_id: user.id, event_id: eventId }, { onConflict: 'user_id,event_id' });

    if (error) {
      console.error('Error saving event:', error);
      throw new Error(`Error saving event: ${error.message}`);
    }
  };

  const unsaveEvent = async (eventId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('saved_events')
      .delete()
      .eq('user_id', user.id)
      .eq('event_id', eventId);

    if (error) {
      console.error('Error unsaving event:', error);
      throw new Error(`Error unsaving event: ${error.message}`);
    }
  };

  return { saveEvent, unsaveEvent };
}

// Hook to check if events are saved by current user
export function useSavedEvents(eventIds: number[]) {
  return useQuery({
    queryKey: ['saved-events', eventIds],
    queryFn: async (): Promise<Set<number>> => {
      if (eventIds.length === 0) return new Set();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return new Set();

      const { data, error } = await supabase
        .from('saved_events')
        .select('event_id')
        .eq('user_id', user.id)
        .in('event_id', eventIds);

      if (error) {
        console.error('Error fetching saved events:', error);
        return new Set();
      }

      return new Set(data?.map(item => item.event_id) || []);
    },
    enabled: eventIds.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
