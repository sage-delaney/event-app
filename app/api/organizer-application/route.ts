import { NextRequest, NextResponse } from 'next/server'

// This route is replaced by the new /api/organizer-application/notify route
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint has been moved to /api/organizer-application/notify' },
    { status: 410 }
  )
}
