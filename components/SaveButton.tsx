'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Heart } from 'lucide-react'

interface SaveButtonProps {
  eventId: number
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export default function SaveButton({ 
  eventId, 
  className = '', 
  variant = 'ghost',
  size = 'sm'
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)
    setError(null)

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        setError('Authentication error')
        return
      }

      if (!user) {
        // User not logged in, redirect to auth with current URL as redirect
        const currentUrl = window.location.href
        router.push(`/auth?redirect=${encodeURIComponent(currentUrl)}`)
        return
      }

      // Optimistically update UI
      setIsSaved(true)

      // Upsert into saved_events with composite conflict key
      const { error: saveError } = await supabase
        .from('saved_events')
        .upsert(
          { 
            user_id: user.id, 
            event_id: eventId 
          },
          { 
            onConflict: 'user_id,event_id' 
          }
        )

      if (saveError) {
        console.error('Save error:', saveError)
        // Revert optimistic update
        setIsSaved(false)
        setError('Failed to save event')
        return
      }

      // Success - keep the saved state
      console.log('Event saved successfully')

    } catch (err) {
      console.error('Unexpected error:', err)
      setIsSaved(false)
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // Clear error after 3 seconds
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={handleSave}
        disabled={isLoading}
        className={`${className} ${isSaved ? 'text-red-500' : ''}`}
      >
        <Heart 
          className={`h-4 w-4 ${isSaved ? 'fill-red-500' : ''} ${size === 'sm' ? 'mr-1' : 'mr-2'}`} 
        />
        {isLoading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
      </Button>
      
      {/* Simple error alert */}
      {error && (
        <div className="absolute top-full left-0 mt-1 z-10 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  )
}
