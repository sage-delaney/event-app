/**
 * Format event date and time in a short, readable format using the user's local timezone
 * @param starts_at - ISO string for event start time
 * @param ends_at - Optional ISO string for event end time
 * @returns Formatted date string
 */
export function formatEventDate(starts_at: string, ends_at?: string): string {
  const startDate = new Date(starts_at)
  const endDate = ends_at ? new Date(ends_at) : null

  // Check if start date is valid
  if (isNaN(startDate.getTime())) {
    return 'Invalid date'
  }

  // Format options for start date
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  // Format options for time only (for end time)
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const startFormatted = dateFormatter.format(startDate)

  // If no end date, return just the start date
  if (!endDate || isNaN(endDate.getTime())) {
    return startFormatted
  }

  // Check if end date is on the same day
  const isSameDay = 
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate()

  if (isSameDay) {
    // Same day: "Fri, Dec 15, 7:00 PM - 10:00 PM"
    const endTime = timeFormatter.format(endDate)
    return `${startFormatted} - ${endTime}`
  } else {
    // Different days: "Fri, Dec 15, 7:00 PM - Sat, Dec 16, 10:00 PM"
    const endFormatted = dateFormatter.format(endDate)
    return `${startFormatted} - ${endFormatted}`
  }
}

/**
 * Format a simple date without time
 * @param dateString - ISO string for the date
 * @returns Formatted date string
 */
export function formatSimpleDate(dateString: string): string {
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Format time only
 * @param dateString - ISO string for the date/time
 * @returns Formatted time string
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Invalid time'
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}
