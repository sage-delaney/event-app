'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'
import { useSupabase } from '@/hooks/useSupabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useSupabase()
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleAuthClick = () => {
    if (user) {
      // User is logged in, go to events
      router.push('/events')
    } else {
      // User is not logged in, go to auth
      router.push('/auth')
    }
  }

  if (loading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-foreground">
                EventApp
              </Link>
            </div>
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-foreground">
              EventApp
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Link href="/profile">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || 'User'} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Button variant="outline" onClick={handleAuthClick}>
                Log in
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
