import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from './supabase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// A simplified Event type based on the schema
type Event = {
  venue_neighborhood?: string | null;
  neighborhood_tag_id?: number | null;
};

// A cache for neighborhood lookups to avoid repeated DB calls for the same ID.
const neighborhoodCache = new Map<number, string>();

export async function getNeighborhoodLabel(
  event: Event,
  idToName?: { [key: number]: string }
): Promise<string | null> {
  if (event.venue_neighborhood) {
    return event.venue_neighborhood;
  }

  if (event.neighborhood_tag_id) {
    if (idToName && idToName[event.neighborhood_tag_id]) {
      return idToName[event.neighborhood_tag_id];
    }

    // Check cache first
    if (neighborhoodCache.has(event.neighborhood_tag_id)) {
      return neighborhoodCache.get(event.neighborhood_tag_id) || null;
    }

    // If not in idToName map or cache, do a single lookup
    const { data, error } = await supabase
      .from('tags')
      .select('name')
      .eq('id', event.neighborhood_tag_id)
      .single();

    if (error || !data) {
      console.error('Error fetching neighborhood tag:', error?.message);
      return null;
    }

    // Cache the result
    neighborhoodCache.set(event.neighborhood_tag_id, data.name);
    return data.name;
  }

  return null;
}
