import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    console.log('[DB Doctor] Starting database health check...');
    const supabase = getServerSupabase();

    // 1. Connectivity check
    const { data: timeCheck, error: timeError } = await supabase
      .rpc('select', { query: 'now()' })
      .single();

    if (timeError) {
      console.log('[DB Doctor] Using direct query for time check');
      const { data: directTime } = await supabase
        .from('events')
        .select('created_at')
        .limit(1)
        .single();
      console.log('[DB Doctor] Database connected via direct query');
    } else {
      console.log('[DB Doctor] Database connected via RPC');
    }

    // 2. Get table counts
    const [eventsResult, tagsResult, eventTagsResult, tagCategoriesResult] = await Promise.all([
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('tags').select('*', { count: 'exact', head: true }),
      supabase.from('event_tags').select('*', { count: 'exact', head: true }),
      supabase.from('tag_categories').select('*', { count: 'exact', head: true }),
    ]);

    // 3. Get upcoming public events count
    const { count: upcomingEventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('visibility', 'public')
      .gte('starts_at', new Date().toISOString());

    // 4. Get tag categories with counts
    const { data: tagCategories } = await supabase
      .from('tag_categories')
      .select(`
        id,
        name,
        tags:tags(id, name, slug)
      `);

    // 5. Get events table schema
    const { data: eventsColumns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'events')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    // 6. Sample recent events
    const { data: sampleEvents } = await supabase
      .from('events')
      .select('id, title, starts_at, visibility, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const healthData = {
      connectivity: {
        status: 'connected',
        timestamp: new Date().toISOString(),
      },
      counts: {
        total_events: eventsResult.count || 0,
        upcoming_public_events: upcomingEventsCount || 0,
        tags: tagsResult.count || 0,
        event_tags: eventTagsResult.count || 0,
        tag_categories: tagCategoriesResult.count || 0,
      },
      schema: {
        events_columns: eventsColumns || [],
      },
      tag_categories: tagCategories || [],
      sample_events: sampleEvents || [],
      errors: {
        events: eventsResult.error?.message,
        tags: tagsResult.error?.message,
        event_tags: eventTagsResult.error?.message,
        tag_categories: tagCategoriesResult.error?.message,
      },
    };

    console.log('[DB Doctor] Health check completed successfully');
    console.log('[DB Doctor] Counts:', healthData.counts);

    return NextResponse.json({
      ok: true,
      data: healthData,
    });

  } catch (error) {
    console.error('[DB Doctor] Health check failed:', error);
    
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
