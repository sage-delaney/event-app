'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ProgressBar } from '@/components/onboarding/ProgressBar'
import { useTagsByCategory } from '@/hooks/useTagsByCategory'
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress'
import { initializeOnboardingData, ONBOARDING_STEPS, MUSIC_SHOW_FIRST, MUSIC_SHOW_MORE } from '@/lib/onboarding-utils'

function Step2Content() {
  const searchParams = useSearchParams()
  const { tags: musicTags } = useTagsByCategory('Music')
  
  const [initialData] = useState(() => initializeOnboardingData(searchParams))
  const { data, updateData, nextStep, prevStep, skipToEvents } = useOnboardingProgress(initialData)

  const [musicPreferences, setMusicPreferences] = useState<Record<string, number>>(data.musicPreferences)
  const [showMore, setShowMore] = useState(false)

  // Organize tags by show first/more
  const showFirstTags = musicTags.filter(tag => MUSIC_SHOW_FIRST.includes(tag.slug))
  const showMoreTags = musicTags.filter(tag => MUSIC_SHOW_MORE.includes(tag.slug))

  const handleSliderChange = (slug: string, value: number[]) => {
    setMusicPreferences(prev => ({ ...prev, [slug]: value[0] }))
  }

  const getSliderValue = (slug: string): number => {
    return musicPreferences[slug] ?? 5 // Default to neutral (5)
  }

  const getSliderLabel = (value: number): string => {
    if (value === 0) return 'Actively dislike'
    if (value === 5) return 'Neutral'
    if (value === 10) return 'Love it'
    if (value < 5) return 'Dislike'
    return 'Like'
  }

  const handleNext = () => {
    updateData({ musicPreferences })
    nextStep()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <ProgressBar 
          currentStep={2} 
          totalSteps={4} 
          stepTitles={ONBOARDING_STEPS.map(s => s.title)} 
        />

        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Your Music</h1>
            <p className="mt-2 text-muted-foreground">
              Rate how much you enjoy different music genres
            </p>
          </div>

          <div className="space-y-6">
            {/* Show First Tags */}
            {showFirstTags.map((tag) => {
              const value = getSliderValue(tag.slug)
              return (
                <div key={tag.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">{tag.name}</Label>
                    <span className="text-sm text-muted-foreground">
                      {getSliderLabel(value)}
                    </span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(val) => handleSliderChange(tag.slug, val)}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Actively dislike</span>
                    <span>Neutral</span>
                    <span>Love it</span>
                  </div>
                </div>
              )
            })}

            {/* Show More Button */}
            {!showMore && showMoreTags.length > 0 && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowMore(true)}
                  className="mt-4"
                >
                  Show more genres ({showMoreTags.length})
                </Button>
              </div>
            )}

            {/* Show More Tags */}
            {showMore && showMoreTags.map((tag) => {
              const value = getSliderValue(tag.slug)
              return (
                <div key={tag.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">{tag.name}</Label>
                    <span className="text-sm text-muted-foreground">
                      {getSliderLabel(value)}
                    </span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(val) => handleSliderChange(tag.slug, val)}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Actively dislike</span>
                    <span>Neutral</span>
                    <span>Love it</span>
                  </div>
                </div>
              )
            })}

            {/* Show Less Button */}
            {showMore && (
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowMore(false)}
                  className="text-sm"
                >
                  Show less
                </Button>
              </div>
            )}
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
              href={`/organizer-application?returnStep=2&returnQuery=${searchParams.toString()}`}
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

export default function Step2Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Step2Content />
    </Suspense>
  )
}
