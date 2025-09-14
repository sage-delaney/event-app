'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/hooks/useSupabase'

function OnboardingRouter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useSupabase()

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      // Check if user has completed onboarding (has preferences)
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .limit(1)

      if (preferences && preferences.length > 0) {
        // Returning user with preferences - go to profile or events
        router.push('/events')
        return
      }

      // New user - start onboarding at step 1
      const queryString = searchParams.toString()
      const redirectUrl = queryString 
        ? `/onboarding/step-1?${queryString}`
        : '/onboarding/step-1'
      
      router.push(redirectUrl)
    }

    checkUserAndRedirect()
  }, [router, searchParams, supabase])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Setting up your onboarding...</p>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingRouter />
    </Suspense>
  )
}

