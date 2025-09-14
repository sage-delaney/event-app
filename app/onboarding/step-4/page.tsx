'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ProgressBar } from '@/components/onboarding/ProgressBar'
import { useTagsByCategory } from '@/hooks/useTagsByCategory'
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress'
import { initializeOnboardingData, ONBOARDING_STEPS } from '@/lib/onboarding-utils'

function Step4Content() {
  const searchParams = useSearchParams()
  const { tags: timeWindowTags } = useTagsByCategory('Time Window')
  const { tags: occasionTags } = useTagsByCategory('Occasion')
  
  const [initialData] = useState(() => initializeOnboardingData(searchParams))
  const { data, updateData, prevStep, skipToEvents, completeOnboarding, saving } = useOnboardingProgress(initialData)

  const [selectedTimeWindows, setSelectedTimeWindows] = useState<string[]>(data.timeWindows)
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(data.occasions)

  const handleTimeWindowToggle = (slug: string) => {
    const updated = selectedTimeWindows.includes(slug)
      ? selectedTimeWindows.filter(s => s !== slug)
      : [...selectedTimeWindows, slug]
    setSelectedTimeWindows(updated)
  }

  const handleOccasionToggle = (slug: string) => {
    const updated = selectedOccasions.includes(slug)
      ? selectedOccasions.filter(s => s !== slug)
      : [...selectedOccasions, slug]
    setSelectedOccasions(updated)
  }

  const handleFinish = async () => {
    updateData({
      timeWindows: selectedTimeWindows,
      occasions: selectedOccasions
    })
    await completeOnboarding()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <ProgressBar 
          currentStep={4} 
          totalSteps={4} 
          stepTitles={ONBOARDING_STEPS.map(s => s.title)} 
        />

        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Timing & Occasion</h1>
            <p className="mt-2 text-muted-foreground">
              When do you usually go out and what&apos;s the plan?
            </p>
          </div>

          <div className="space-y-8">
            {/* Time Windows Section */}
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">When do you usually go out?</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Select all that apply
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timeWindowTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTimeWindowToggle(tag.slug)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors text-center ${
                      selectedTimeWindows.includes(tag.slug)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-input hover:bg-accent'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Occasions Section */}
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">What is the plan?</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  What types of occasions do you go out for?
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {occasionTags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`occasion-${tag.slug}`}
                      checked={selectedOccasions.includes(tag.slug)}
                      onCheckedChange={() => handleOccasionToggle(tag.slug)}
                    />
                    <Label 
                      htmlFor={`occasion-${tag.slug}`}
                      className="text-sm font-normal cursor-pointer flex-1"
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button variant="ghost" onClick={skipToEvents}>
                Skip for now
              </Button>
            </div>
            
            <Button onClick={handleFinish} disabled={saving}>
              {saving ? 'Saving...' : 'Finish & Explore Events'}
            </Button>
          </div>

          {/* Organizer Link */}
          <div className="text-center pt-4 border-t">
            <a 
              href={`/organizer-application?returnStep=4&returnQuery=${searchParams.toString()}`}
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

export default function Step4Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Step4Content />
    </Suspense>
  )
}
