'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    interests: [] as string[],
    location: ''
  })
  const router = useRouter()

  const interests = [
    'Music', 'Sports', 'Technology', 'Food & Drink', 'Art', 'Business',
    'Health & Wellness', 'Education', 'Travel', 'Gaming', 'Photography', 'Books'
  ]

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleComplete = () => {
    // Here you would typically save the onboarding data to Supabase
    console.log('Onboarding completed:', formData)
    router.push('/events')
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Welcome to EventApp!</h2>
          <p className="mt-2 text-muted-foreground">
            Let's personalize your experience
          </p>
        </div>

        <div className="flex justify-center space-x-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">What's your name?</h3>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              className="w-full rounded-md border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button 
              onClick={() => setStep(2)} 
              className="w-full"
              disabled={!formData.name.trim()}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">What are your interests?</h3>
            <p className="text-center text-muted-foreground">Select all that apply</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    formData.interests.includes(interest)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-input hover:bg-accent'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                className="flex-1"
                disabled={formData.interests.length === 0}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Where are you located?</h3>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, State or Country"
              className="w-full rounded-md border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleComplete} 
                className="flex-1"
                disabled={!formData.location.trim()}
              >
                Complete Setup
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
