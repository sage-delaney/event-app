#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
try {
  const envPath = join(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf8');
  
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  console.warn('⚠️  Could not load .env.local file');
}

// Environment validation
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL environment variable');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('🚀 Starting Supabase MCP Server...');
console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
console.log('🔑 Service role key loaded');

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'schema.validate',
    description: 'Validate database schema and check required tables/columns exist',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'tags.by_category',
    description: 'Get all tags for a specific category (e.g., Music, Vibe)',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Category name (e.g., "Music", "Vibe")',
        },
      },
      required: ['name'],
      additionalProperties: false,
    },
  },
  {
    name: 'events.exact_both_tags',
    description: 'Find upcoming public events that have both specified tags',
    inputSchema: {
      type: 'object',
      properties: {
        music_id: {
          type: 'number',
          description: 'Music tag ID',
        },
        vibe_id: {
          type: 'number',
          description: 'Vibe tag ID',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of events to return (default: 12)',
          default: 12,
        },
      },
      required: ['music_id', 'vibe_id'],
      additionalProperties: false,
    },
  },
  {
    name: 'events.any_of',
    description: 'Find upcoming public events that have either of the specified tags, scored by relevance',
    inputSchema: {
      type: 'object',
      properties: {
        music_id: {
          type: 'number',
          description: 'Music tag ID',
        },
        vibe_id: {
          type: 'number',
          description: 'Vibe tag ID',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of events to return (default: 12)',
          default: 12,
        },
      },
      required: ['music_id', 'vibe_id'],
      additionalProperties: false,
    },
  },
  {
    name: 'events.new_and_noteworthy',
    description: 'Find recent upcoming public events (fallback when no tag matches)',
    inputSchema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'How many days back to look for "new" events (default: 30)',
          default: 30,
        },
        limit: {
          type: 'number',
          description: 'Maximum number of events to return (default: 12)',
          default: 12,
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'seed.demo',
    description: 'Add demo data (tags and events) to the database for development',
    inputSchema: {
      type: 'object',
      properties: {
        force: {
          type: 'boolean',
          description: 'Force re-creation of demo data (default: false)',
          default: false,
        },
      },
      additionalProperties: false,
    },
  },
];

// Create MCP server
const server = new Server(
  {
    name: 'supabase-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    console.log(`🔧 Calling tool: ${name}`, args);

    switch (name) {
      case 'schema.validate':
        return await validateSchema();
      
      case 'tags.by_category':
        return await getTagsByCategory((args as any)?.name);
      
      case 'events.exact_both_tags':
        return await getEventsWithBothTags(
          (args as any)?.music_id, 
          (args as any)?.vibe_id, 
          (args as any)?.limit || 12
        );
      
      case 'events.any_of':
        return await getEventsWithAnyOf(
          (args as any)?.music_id, 
          (args as any)?.vibe_id, 
          (args as any)?.limit || 12
        );
      
      case 'events.new_and_noteworthy':
        return await getNewAndNoteworthyEvents(
          (args as any)?.days || 30, 
          (args as any)?.limit || 12
        );
      
      case 'seed.demo':
        return await seedDemoData((args as any)?.force || false);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`❌ Tool ${name} failed:`, error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ok: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            tool: name,
          }, null, 2),
        },
      ],
    };
  }
});

// Tool implementations
async function validateSchema() {
  const requiredTables = ['events', 'tags', 'tag_categories', 'event_tags'];
  const requiredEventColumns = [
    'id', 'title', 'starts_at', 'visibility', 'venue_name', 
    'neighborhood_tag_id', 'created_at'
  ];

  const results = {
    ok: true,
    data: {
      tables: {} as Record<string, boolean>,
      events_columns: {} as Record<string, boolean>,
      missing_tables: [] as string[],
      missing_columns: [] as string[],
    },
  };

  // Check tables exist
  for (const table of requiredTables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    const exists = !error;
    results.data.tables[table] = exists;
    if (!exists) {
      results.data.missing_tables.push(table);
      results.ok = false;
    }
  }

  // Check events columns
  const { data: columns } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', 'events')
    .eq('table_schema', 'public');

  const existingColumns = new Set(columns?.map(c => c.column_name) || []);
  
  for (const column of requiredEventColumns) {
    const exists = existingColumns.has(column);
    results.data.events_columns[column] = exists;
    if (!exists) {
      results.data.missing_columns.push(column);
      results.ok = false;
    }
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(results, null, 2),
      },
    ],
  };
}

async function getTagsByCategory(categoryName: string) {
  const { data: category, error: categoryError } = await supabase
    .from('tag_categories')
    .select(`
      id,
      name,
      tags:tags(id, name, slug)
    `)
    .eq('name', categoryName)
    .single();

  if (categoryError) {
    throw new Error(`Failed to get category "${categoryName}": ${categoryError.message}`);
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          ok: true,
          data: {
            category: category?.name,
            tags: category?.tags || [],
          },
        }, null, 2),
      },
    ],
  };
}

async function getEventsWithBothTags(musicId: number, vibeId: number, limit: number) {
  // Get events that have both tags
  const { data: musicEventTags } = await supabase
    .from('event_tags')
    .select('event_id')
    .eq('tag_id', musicId);

  const { data: vibeEventTags } = await supabase
    .from('event_tags')
    .select('event_id')
    .eq('tag_id', vibeId);

  const musicEventIds = new Set(musicEventTags?.map(et => et.event_id) || []);
  const vibeEventIds = new Set(vibeEventTags?.map(et => et.event_id) || []);
  const commonEventIds = Array.from(musicEventIds).filter(id => vibeEventIds.has(id));

  if (commonEventIds.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ok: true,
            data: {
              events: [],
              count: 0,
              query_type: 'exact_both_tags',
            },
          }, null, 2),
        },
      ],
    };
  }

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .in('id', commonEventIds)
    .eq('visibility', 'public')
    .gte('starts_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          ok: true,
          data: {
            events: events || [],
            count: events?.length || 0,
            query_type: 'exact_both_tags',
          },
        }, null, 2),
      },
    ],
  };
}

async function getEventsWithAnyOf(musicId: number, vibeId: number, limit: number) {
  // Get events with either tag, scored by how many tags they match
  const { data: eventTags } = await supabase
    .from('event_tags')
    .select('event_id, tag_id')
    .in('tag_id', [musicId, vibeId]);

  const eventScores = new Map<number, number>();
  eventTags?.forEach(et => {
    eventScores.set(et.event_id, (eventScores.get(et.event_id) || 0) + 1);
  });

  const eventIds = Array.from(eventScores.keys());

  if (eventIds.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ok: true,
            data: {
              events: [],
              count: 0,
              query_type: 'any_of',
            },
          }, null, 2),
        },
      ],
    };
  }

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .in('id', eventIds)
    .eq('visibility', 'public')
    .gte('starts_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  // Sort by score (2 for both tags, 1 for one tag) then by created_at
  const eventsWithScores = (events || []).map(event => ({
    ...event,
    score: eventScores.get(event.id) || 0,
  })).sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          ok: true,
          data: {
            events: eventsWithScores,
            count: eventsWithScores.length,
            query_type: 'any_of',
          },
        }, null, 2),
      },
    ],
  };
}

async function getNewAndNoteworthyEvents(days: number, limit: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('visibility', 'public')
    .gte('starts_at', new Date().toISOString())
    .gte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch new events: ${error.message}`);
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          ok: true,
          data: {
            events: events || [],
            count: events?.length || 0,
            query_type: 'new_and_noteworthy',
            days_back: days,
          },
        }, null, 2),
      },
    ],
  };
}

async function seedDemoData(force: boolean) {
  // This is a placeholder - we'll implement actual seeding logic
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          ok: true,
          data: {
            message: 'Demo seeding not yet implemented',
            force,
          },
        }, null, 2),
      },
    ],
  };
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('✅ Supabase MCP Server running on stdio');
}

main().catch((error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});
