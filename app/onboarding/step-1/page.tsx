'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ProgressBar } from '@/components/onboarding/ProgressBar'
import { useTagsByCategory } from '@/hooks/useTagsByCategory'
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress'
import { initializeOnboardingData, ONBOARDING_STEPS } from '@/lib/onboarding-utils'

function Step1Content() {
  const searchParams = useSearchParams()
  const { tags: lifestyleTags } = useTagsByCategory('Lifestyle')
  
  const [initialData] = useState(() => initializeOnboardingData(searchParams))
  const { data, updateData, nextStep, skipToEvents } = useOnboardingProgress(initialData)

  const [firstName, setFirstName] = useState(data.firstName)
  const [dateOfBirth, setDateOfBirth] = useState(data.dateOfBirth)
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>(data.lifestyle)

  const handleLifestyleToggle = (slug: string) => {
    const updated = selectedLifestyle.includes(slug)
      ? selectedLifestyle.filter(s => s !== slug)
      : [...selectedLifestyle, slug]
    setSelectedLifestyle(updated)
  }

  const handleNext = () => {
    updateData({
      firstName,
      dateOfBirth,
      lifestyle: selectedLifestyle
    })
    nextStep()
  }

  const canProceed = firstName.trim() && dateOfBirth && selectedLifestyle.length > 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <ProgressBar 
          currentStep={1} 
          totalSteps={4} 
          stepTitles={ONBOARDING_STEPS.map(s => s.title)} 
        />

        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">About You</h1>
            <p className="mt-2 text-muted-foreground">
              Tell us a bit about yourself to get started
            </p>
          </div>

          {/* Basic Info */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateOfBirth(e.target.value)}
                />
              </div>
            </div>

            {/* Lifestyle */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Lifestyle</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Select all that apply to you
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lifestyleTags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lifestyle-${tag.slug}`}
                      checked={selectedLifestyle.includes(tag.slug)}
                      onCheckedChange={() => handleLifestyleToggle(tag.slug)}
                    />
                    <Label 
                      htmlFor={`lifestyle-${tag.slug}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {tag.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button variant="ghost" onClick={skipToEvents}>
              Skip for now
            </Button>
            
            <Button onClick={handleNext} disabled={!canProceed}>
              Continue
            </Button>
          </div>

          {/* Organizer Link */}
          <div className="text-center pt-4 border-t">
            <a 
              href={`/organizer-application?returnStep=1&returnQuery=${searchParams.toString()}`}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              I am an organizer
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Step1Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Step1Content />
    </Suspense>
  )
}
