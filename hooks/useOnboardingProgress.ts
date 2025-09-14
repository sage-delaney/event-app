import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingData, saveOnboardingProgress, saveOnboardingToDatabase, clearOnboardingProgress } from '@/lib/onboarding-utils'

export function useOnboardingProgress(initialData: OnboardingData) {
  const [data, setData] = useState<OnboardingData>(initialData)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  // Auto-save to sessionStorage whenever data changes
  useEffect(() => {
    saveOnboardingProgress(data)
  }, [data])

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    const nextStepNum = Math.min(data.currentStep + 1, 4)
    updateData({ currentStep: nextStepNum })
    router.push(`/onboarding/step-${nextStepNum}`)
  }

  const prevStep = () => {
    const prevStepNum = Math.max(data.currentStep - 1, 1)
    updateData({ currentStep: prevStepNum })
    router.push(`/onboarding/step-${prevStepNum}`)
  }

  const skipToEvents = () => {
    clearOnboardingProgress()
    router.push('/events')
  }

  const completeOnboarding = async () => {
    setSaving(true)
    try {
      await saveOnboardingToDatabase(data)
      clearOnboardingProgress()
      router.push('/events')
    } catch (error) {
      console.error('Failed to save onboarding:', error)
      // Could show error toast here
    } finally {
      setSaving(false)
    }
  }

  return {
    data,
    updateData,
    nextStep,
    prevStep,
    skipToEvents,
    completeOnboarding,
    saving
  }
}
