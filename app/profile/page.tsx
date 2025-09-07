'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Phone, MapPin, Calendar, LogOut } from 'lucide-react'
import { useSupabase } from '@/hooks/useSupabase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Event enthusiast and community builder. Love connecting with people through shared experiences.',
    joinedDate: '2025-01-15'
  })
  
  const supabase = useSupabase()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSave = () => {
    // Here you would typically save the profile data to Supabase
    console.log('Saving profile:', profile)
    setIsEditing(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <Avatar className="h-24 w-24 mx-auto">
          <AvatarImage src="/placeholder-avatar.jpg" alt={profile.name} />
          <AvatarFallback className="text-2xl">
            <User className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          <p className="text-muted-foreground">Member since {new Date(profile.joinedDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <Button
            variant="outline"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Full Name</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              ) : (
                <p className="text-foreground">{profile.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </label>
              <p className="text-foreground">{profile.email}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Phone</span>
              </label>
              <p className="text-foreground">{profile.phone}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              ) : (
                <p className="text-foreground">{profile.location}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Bio</label>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            ) : (
              <p className="text-foreground">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">My Events</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">Tech Meetup: AI & Machine Learning</h3>
              <p className="text-sm text-muted-foreground flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>September 15, 2025</span>
              </p>
            </div>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Attending</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">Photography Workshop</h3>
              <p className="text-sm text-muted-foreground flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>September 25, 2025</span>
              </p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Registered</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={handleSignOut} className="flex items-center space-x-2">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  )
}
