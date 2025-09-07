'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users } from 'lucide-react'

// Mock data for events
const mockEvents = [
  {
    id: 1,
    title: 'Tech Meetup: AI & Machine Learning',
    date: '2025-09-15',
    time: '18:00',
    location: 'Downtown Conference Center',
    attendees: 45,
    maxAttendees: 100,
    description: 'Join us for an evening of AI discussions and networking.',
    category: 'Technology'
  },
  {
    id: 2,
    title: 'Food Festival 2025',
    date: '2025-09-20',
    time: '12:00',
    location: 'Central Park',
    attendees: 234,
    maxAttendees: 500,
    description: 'Taste amazing food from local vendors and restaurants.',
    category: 'Food & Drink'
  },
  {
    id: 3,
    title: 'Photography Workshop',
    date: '2025-09-25',
    time: '10:00',
    location: 'Art Studio Downtown',
    attendees: 12,
    maxAttendees: 20,
    description: 'Learn professional photography techniques.',
    category: 'Art'
  }
]

export default function EventsPage() {
  const [filter, setFilter] = useState('all')
  const categories = ['all', 'Technology', 'Food & Drink', 'Art', 'Music', 'Sports']

  const filteredEvents = filter === 'all' 
    ? mockEvents 
    : mockEvents.filter(event => event.category === filter)

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Discover Events</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find exciting events happening in your area. Connect with your community and explore new experiences.
        </p>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={filter === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                  {event.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {event.attendees}/{event.maxAttendees} attending
                </span>
              </div>
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{event.date} at {event.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{event.attendees} people attending</span>
              </div>
            </div>

            <Button className="w-full">
              Join Event
            </Button>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found for the selected category.</p>
        </div>
      )}
    </div>
  )
}
