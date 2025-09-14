// lib/schema-validator.ts
'use server'

import { createClient, SupabaseClient } from '@supabase/supabase-js'

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

async function getTableColumns(
  supabaseAdmin: SupabaseClient,
  tableName: string
): Promise<string[] | null> {
  const { data, error } = await supabaseAdmin.rpc('get_columns', {
    table_name: tableName,
  })

  if (error) {
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

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('[Schema Validator] Using URL:', supabaseUrl)
  console.log('[Schema Validator] URL envs present:', {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SERVICE_ROLE_SET: !!serviceRoleKey,
  })

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      '⚠️  [Schema Validator] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Skipping validation.'
    )
    return
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  console.log('[Schema Validator] Running database schema validation...')

  let allOk = true

  for (const [tableName, expectedColumns] of Object.entries(tableSchemas)) {
    const actualColumns = await getTableColumns(supabaseAdmin, tableName)

    if (tableName === 'events' && actualColumns) {
      console.log('[Schema Validator] events columns:', actualColumns)
    }

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
