'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabase } from '@/hooks/useSupabase'

interface FormData {
  name: string
  organization: string
  email: string
  socialLink: string
  typesOfEvents: string
  website: string
  phone: string
}

function OrganizerApplicationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useSupabase()
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    organization: '',
    email: '',
    socialLink: '',
    typesOfEvents: '',
    website: '',
    phone: ''
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const returnStep = searchParams.get('returnStep') || '1'
  const returnQuery = searchParams.get('returnQuery') || ''

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Get current user (optional - can be null for anonymous applications)
      const { data: { user } } = await supabase.auth.getUser()

      // Insert into database
      const { error: dbError } = await supabase
        .from('organizer_applications')
        .insert({
          user_id: user?.id || null, // Allow null for anonymous applications
          name: formData.name,
          organization: formData.organization,
          email: formData.email,
          social_link: formData.socialLink || null,
          types_of_events: formData.typesOfEvents,
          website: formData.website || null,
          phone: formData.phone || null
        })

      if (dbError) throw dbError

      // Send notification email
      const emailResponse = await fetch('/api/organizer-application/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!emailResponse.ok) {
        console.error('Email notification failed')
        // Don't fail the whole process if email fails
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Submission error:', err)
      setError('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturnToOnboarding = () => {
    const returnUrl = returnQuery 
      ? `/onboarding/step-${returnStep}?${returnQuery}`
      : `/onboarding/step-${returnStep}`
    router.push(returnUrl)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">Application Submitted!</CardTitle>
            <CardDescription>
              Thank you for your interest in organizing events. We&apos;ll review your application and get back to you soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleReturnToOnboarding} className="w-full">
              Also sign me up as an attendee
            </Button>
            <Button variant="outline" onClick={() => router.push('/events')} className="w-full">
              Explore events
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Organizer Application</CardTitle>
            <CardDescription>
              Tell us about yourself and the events you&apos;d like to organize
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization/Company *</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={handleInputChange('organization')}
                  placeholder="Your organization or company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="typesOfEvents">Types of Events *</Label>
                <textarea
                  id="typesOfEvents"
                  value={formData.typesOfEvents}
                  onChange={handleInputChange('typesOfEvents')}
                  placeholder="Describe the types of events you organize or want to organize..."
                  required
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange('website')}
                    placeholder="https://..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialLink">Social Media</Label>
                <Input
                  id="socialLink"
                  value={formData.socialLink}
                  onChange={handleInputChange('socialLink')}
                  placeholder="Instagram, Twitter, LinkedIn, etc."
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function OrganizerApplicationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrganizerApplicationContent />
    </Suspense>
  )
}
