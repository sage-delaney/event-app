'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/hooks/useSupabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type AuthStep = 'phone' | 'code'

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const supabase = useSupabase()
  const router = useRouter()

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/events')
      }
    }
    checkSession()
  }, [supabase, router])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [resendTimer])

  const validateE164Phone = (phoneNumber: string): boolean => {
    // E.164 format: +[country code][number] (max 15 digits total)
    const e164Regex = /^\+[1-9]\d{1,14}$/
    return e164Regex.test(phoneNumber)
  }

  const formatPhoneForDisplay = (phoneNumber: string): string => {
    if (phoneNumber.length < 4) return phoneNumber
    const visiblePart = phoneNumber.slice(0, 3) + phoneNumber.slice(-4)
    const maskedPart = '*'.repeat(phoneNumber.length - 7)
    return visiblePart.slice(0, 3) + maskedPart + visiblePart.slice(3)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateE164Phone(phone)) {
      setError('Please enter a valid phone number in E.164 format (e.g., +15035551234)')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          channel: 'sms',
          shouldCreateUser: true,
        },
      })

      if (error) {
        if (error.message.includes('rate limit')) {
          setError('Too many requests. Please wait before trying again.')
        } else {
          setError(error.message)
        }
      } else {
        setStep('code')
        setResendTimer(30)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (code.length !== 6) {
      setError('Please enter a 6-digit verification code')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: code,
        type: 'sms'
      })

      if (error) {
        if (error.message.includes('expired')) {
          setError('Verification code has expired. Please request a new one.')
        } else if (error.message.includes('invalid')) {
          setError('Invalid verification code. Please try again.')
        } else {
          setError(error.message)
        }
      } else if (data.user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              phone: phone,
              created_at: new Date().toISOString()
            })

          if (insertError) {
            console.error('Error creating profile:', insertError)
          }
          
          // First-time user, go to onboarding
          router.push('/onboarding')
        } else {
          // Returning user, go to events
          router.push('/events')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          channel: 'sms',
          shouldCreateUser: true,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setResendTimer(30)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeNumber = () => {
    setStep('phone')
    setPhone('')
    setCode('')
    setError('')
    setResendTimer(0)
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Sign in to EventApp</h2>
          <p className="mt-2 text-muted-foreground">
            {step === 'phone' 
              ? 'Enter your phone number to receive a verification code'
              : `Enter the 6-digit code sent to ${formatPhoneForDisplay(phone)}`
            }
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+15035551234"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Enter in E.164 format (e.g., +15035551234)
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-foreground">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring text-center text-2xl tracking-widest"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </Button>

            <div className="flex flex-col space-y-2 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                disabled={resendTimer > 0 || loading}
                className="w-full"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={handleChangeNumber}
                className="text-sm"
              >
                Change Number
              </Button>
            </div>
          </form>
        )}

        {error && (
          <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>By signing in, you agree to our</p>
          <div className="space-x-4">
            <Link href="/tos" className="underline hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
