# Supabase MCP Server Setup

This project includes a Model Context Protocol (MCP) server that provides structured access to your Supabase database for AI agents like Windsurf.

## What it does

The MCP server exposes safe, structured tools for database operations:

- `schema.validate` - Check database structure
- `tags.by_category` - Get tags by category (Music, Vibe, etc.)
- `events.exact_both_tags` - Find events with both specified tags
- `events.any_of` - Find events with either tag, scored by relevance
- `events.new_and_noteworthy` - Fallback to recent events
- `seed.demo` - Add sample data for development

## Setup Instructions

### 1. Environment Variables

Make sure your `.env.local` file has:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Start the MCP Server

Run in a separate terminal:
```bash
npm run mcp:supabase
```

You should see:
```
🚀 Starting Supabase MCP Server...
📍 Supabase URL: https://your-project.supabase.co
🔑 Service role key loaded
✅ Supabase MCP Server running on stdio
```

### 3. Configure Windsurf

In Windsurf settings, add a Model Context Protocol server:
- **Name**: Supabase MCP
- **Command**: `npm`
- **Args**: `["run", "mcp:supabase"]`
- **Working Directory**: Your project root

### 4. Test the Connection

Once configured, Windsurf can call tools like:
- `schema.validate` to check your database structure
- `tags.by_category` with `{"name": "Music"}` to get music tags
- `events.exact_both_tags` with `{"music_id": 1, "vibe_id": 2}` to find matching events

## Security

- The MCP server only runs locally in development
- Uses your service role key server-side (never exposed to browser)
- Only exposes the specific tools we define
- Cannot run arbitrary SQL queries

## Troubleshooting

**Server won't start:**
- Check that environment variables are set
- Ensure you're in the project directory
- Verify Supabase credentials are correct

**No tools available in Windsurf:**
- Restart Windsurf after adding the MCP server
- Check the MCP server is running in terminal
- Verify the working directory path is correct

**Database connection errors:**
- Test your Supabase connection in the web dashboard
- Verify the service role key has proper permissions
- Check your database tables exist (events, tags, tag_categories, event_tags)
