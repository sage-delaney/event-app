'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { ProgressBar } from '@/components/onboarding/ProgressBar'
import { useTagsByCategory } from '@/hooks/useTagsByCategory'
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress'
import { initializeOnboardingData, ONBOARDING_STEPS } from '@/lib/onboarding-utils'

function Step3Content() {
  const searchParams = useSearchParams()
  const { tags: vibeTags } = useTagsByCategory('Vibe')
  const { tags: activityTags } = useTagsByCategory('Activity')
  
  const [initialData] = useState(() => initializeOnboardingData(searchParams))
  const { data, updateData, nextStep, prevStep, skipToEvents } = useOnboardingProgress(initialData)

  const [selectedVibes, setSelectedVibes] = useState<string[]>(data.vibePreferences)
  const [selectedActivities, setSelectedActivities] = useState<string[]>(data.activityPreferences)
  const [preferDogFriendly, setPreferDogFriendly] = useState(data.preferDogFriendly)

  const handleVibeToggle = (slug: string) => {
    const updated = selectedVibes.includes(slug)
      ? selectedVibes.filter(s => s !== slug)
      : [...selectedVibes, slug]
    setSelectedVibes(updated)
  }

  const handleActivityToggle = (slug: string) => {
    const updated = selectedActivities.includes(slug)
      ? selectedActivities.filter(s => s !== slug)
      : [...selectedActivities, slug]
    setSelectedActivities(updated)
  }

  const handleNext = () => {
    updateData({
      vibePreferences: selectedVibes,
      activityPreferences: selectedActivities,
      preferDogFriendly
    })
    nextStep()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <ProgressBar 
          currentStep={3} 
          totalSteps={4} 
          stepTitles={ONBOARDING_STEPS.map(s => s.title)} 
        />

        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Mood</h1>
            <p className="mt-2 text-muted-foreground">
              What vibes and activities do you enjoy?
            </p>
          </div>

          <div className="space-y-8">
            {/* Vibe Section */}
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">Vibe</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Select the atmospheres you enjoy
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {vibeTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleVibeToggle(tag.slug)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                      selectedVibes.includes(tag.slug)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-input hover:bg-accent'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities Section */}
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">Activities</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  What types of events interest you?
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activityTags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`activity-${tag.slug}`}
                      checked={selectedActivities.includes(tag.slug)}
                      onCheckedChange={() => handleActivityToggle(tag.slug)}
                    />
                    <Label 
                      htmlFor={`activity-${tag.slug}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {tag.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Dog-Friendly Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Prefer dog-friendly events</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Show me events that welcome dogs
                  </p>
                </div>
                <Switch
                  checked={preferDogFriendly}
                  onCheckedChange={setPreferDogFriendly}
                />
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
            
            <Button onClick={handleNext}>
              Continue
            </Button>
          </div>

          {/* Organizer Link */}
          <div className="text-center pt-4 border-t">
            <a 
              href={`/organizer-application?returnStep=3&returnQuery=${searchParams.toString()}`}
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

export default function Step3Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Step3Content />
    </Suspense>
  )
}
