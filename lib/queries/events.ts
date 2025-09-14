import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Database, Tables } from '@/lib/types/database'

// Type definitions based on our database schema
export type EventCard = {
  id: number
  title: string
  starts_at: string
  ends_at: string | null
  venue_name: string
  address_text: string
  ticket_url: string | null
  created_at: string | null
  neighborhood_tag_id: number | null
  neighborhoodName: string | null
  image_url: string | null
  is_21_plus: boolean | null
  is_dog_friendly: boolean | null
  visibility: string
}

export type EventDetail = Tables<'events'> & {
  organizer: Tables<'organizers'> | null
  tags: Array<{
    id: number
    name: string
    slug: string | null
    category_id: number
    category: {
      name: string
    } | null
  }>
  neighborhoodName: string | null
}

export type EventSection = 'top' | 'hot' | 'new'

export interface GetEventsOptions {
  section: EventSection
  limit?: number
}

/**
 * Flexible query function to get events for different feed sections
 * @param options - Configuration for the query
 * @returns Array of event cards
 */
export async function getEvents(options: GetEventsOptions): Promise<EventCard[]> {
  const { section, limit = 12 } = options
  const supabase = createServerSupabaseClient()
  const now = new Date().toISOString()

  let query = supabase
    .from('events')
    .select(`
      id,
      title,
      starts_at,
      ends_at,
      venue_name,
      address_text,
      ticket_url,
      created_at,
      neighborhood_tag_id,
      image_url,
      is_21_plus,
      is_dog_friendly,
      visibility,
      neighborhood_tag:tags!events_neighborhood_tag_id_fkey(name)
    `)
    .eq('visibility', 'public')
    .gte('starts_at', now)

  // Apply section-specific logic
  switch (section) {
    case 'top':
      // TODO: Replace with rank_for_user(user_id, limit) remote procedure call
      // For now, order by created_at descending (newest events first)
      query = query.order('created_at', { ascending: false })
      break

    case 'hot':
      // TODO: Replace "Also Hot This Week" with a simple trending calculation later
      // For now, order by starts_at ascending (soonest events first)
      query = query.order('starts_at', { ascending: true })
      break

    case 'new':
      // Events created within the last 10 days
      const tenDaysAgo = new Date()
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
      query = query
        .gte('created_at', tenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
      break

    case 'top':
      // TODO: Replace with rank_for_user(user_id, limit) RPC call for personalized ranking
      query = query.order('created_at', { ascending: false })
      break

    default:
      throw new Error(`Invalid section: ${section}`)
  }

  const { data, error } = await query.limit(limit)

  if (error) {
    console.error(`Error fetching ${section} events:`, error)
    throw new Error(`Failed to fetch ${section} events: ${error.message}`)
  }

  // Transform the data to include neighborhoodName
  return (data || []).map((event: any) => ({
    id: event.id,
    title: event.title,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    venue_name: event.venue_name,
    address_text: event.address_text,
    ticket_url: event.ticket_url,
    created_at: event.created_at,
    neighborhood_tag_id: event.neighborhood_tag_id,
    neighborhoodName: event.neighborhood_tag?.name || null,
    image_url: event.image_url,
    is_21_plus: event.is_21_plus,
    is_dog_friendly: event.is_dog_friendly,
    visibility: event.visibility,
  }))
}

/**
 * Get full event details by ID for the detail page
 * @param id - Event ID (string or number)
 * @returns Full event details with organizer and tags
 */
export async function getEventById(id: string | number): Promise<EventDetail | null> {
  const supabase = createServerSupabaseClient()
  const eventId = typeof id === 'string' ? parseInt(id, 10) : id

  if (isNaN(eventId)) {
    throw new Error('Invalid event ID')
  }

  // Get the event with organizer and neighborhood tag
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select(`
      *,
      organizer:organizers(*),
      neighborhood_tag:tags!events_neighborhood_tag_id_fkey(name)
    `)
    .eq('id', eventId)
    .single()

  if (eventError) {
    if (eventError.code === 'PGRST116') {
      // Event not found
      return null
    }
    console.error('Error fetching event:', eventError)
    throw new Error(`Failed to fetch event: ${eventError.message}`)
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
    .eq('event_id', eventId)

  if (tagsError) {
    console.error('Error fetching event tags:', tagsError)
    // Don't throw error for tags, just continue without them
  }

  // Transform tags data
  const tags = (eventTags || []).map((et: any) => ({
    id: et.tag.id,
    name: et.tag.name,
    slug: et.tag.slug,
    category_id: et.tag.category_id,
    category: et.tag.category,
  }))

  return {
    ...event,
    tags,
    neighborhoodName: event.neighborhood_tag?.name || null,
  }
}
