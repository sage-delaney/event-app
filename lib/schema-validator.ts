// lib/schema-validator.ts
'use server'

import { createClient } from '@supabase/supabase-js'

// This validator uses the service role key to bypass RLS for schema inspection.
// It should only be used in a server-side environment and only in development.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

const tableSchemas = {
  tag_categories: ['name'],
  tags: ['id', 'category_id', 'name', 'slug'],
  events: [
    'id',
    'title',
    'starts_at',
    'visibility',
    'image_url',
    'venue_name',
    'venue_neighborhood',
    'neighborhood_tag_id',
    'created_at',
  ],
  event_tags: ['event_id', 'tag_id'],
}

async function getTableColumns(tableName: string): Promise<string[] | null> {
  const { data, error } = await supabaseAdmin.rpc('get_columns', {
    table_name: tableName,
  })

  if (error) {
    // A 'relation not found' error (code 42P01) is expected if the table doesn't exist.
    if (error.code !== '42P01') {
      console.error(
        `[Schema Validator] Error fetching columns for table "${tableName}":`,
        error.message
      )
    }
    return null
  }

  return data.map((col: { column_name: string }) => col.column_name)
}

export async function validateSchema() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  if (!serviceRoleKey) {
    console.warn(
      '\n\n⚠️  [Schema Validator] SUPABASE_SERVICE_ROLE_KEY is not set. Skipping schema validation. \n    Please add it to your .env.local file to enable this check.\n\n'
    )
    return
  }

  console.log('[Schema Validator] Running database schema validation...')

  let allOk = true

  for (const [tableName, expectedColumns] of Object.entries(tableSchemas)) {
    const actualColumns = await getTableColumns(tableName)

    if (!actualColumns) {
      console.error(
        `❌ [Schema Validator] FAILED: Table "${tableName}" does not exist.`
      )
      console.log(
        `   SUGGESTION: Create the table with the following columns: ${expectedColumns.join(
          ', '
        )}`
      )
      allOk = false
      continue
    }

    const missingColumns = expectedColumns.filter(
      (col) => !actualColumns.includes(col)
    )

    if (missingColumns.length > 0) {
      console.error(
        `❌ [Schema Validator] FAILED: Table "${tableName}" is missing columns.`
      )
      console.log(`   MISSING COLUMNS: ${missingColumns.join(', ')}`)
      console.log(`   EXPECTED COLUMNS: ${expectedColumns.join(', ')}`)
      allOk = false
    }
  }

  if (allOk) {
    console.log('✅ [Schema Validator] All tables and columns are correct.')
  } else {
    console.error(
      '\n[Schema Validator] Schema validation failed. Please check the errors above.'
    )
  }
}
