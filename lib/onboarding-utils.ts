import { supabase } from './supabase'

export interface OnboardingData {
  currentStep: number
  lifestyle: string[]
  firstName: string
  dateOfBirth: string
  musicPreferences: Record<string, number>
  vibePreferences: string[]
  activityPreferences: string[]
  preferDogFriendly: boolean
  timeWindows: string[]
  occasions: string[]
}

export const ONBOARDING_STEPS = [
  { id: 1, title: 'About You', path: '/onboarding/step-1' },
  { id: 2, title: 'Music', path: '/onboarding/step-2' },
  { id: 3, title: 'Mood', path: '/onboarding/step-3' },
  { id: 4, title: 'Timing & Occasion', path: '/onboarding/step-4' }
]

export const MUSIC_SHOW_FIRST = [
  'hip-hop-rap',
  'house', 
  'edm-general',
  'indie-rock-alternative',
  'country',
  'latin',
  'pop'
]

export const MUSIC_SHOW_MORE = [
  'rnb-soul',
  'punk-hardcore', 
  'singer-songwriter',
  'bluegrass-americana',
  'jam-psychedelic',
  'jazz',
  'afrobeats',
  'folk',
  'k-pop',
  'gospel',
  'classical-orchestral'
]

// Initialize onboarding data from landing page "Try now" or fresh start
export function initializeOnboardingData(searchParams: URLSearchParams): OnboardingData {
  const source = searchParams.get('source')
  
  if (source === 'landing') {
    // Pre-seed from landing page selections
    const musicSlug = searchParams.get('musicSlug')
    const vibeSlug = searchParams.get('vibeSlug')
    
    return {
      currentStep: 1,
      lifestyle: [],
      firstName: '',
      dateOfBirth: '',
      musicPreferences: musicSlug ? { [musicSlug]: 10 } : {},
      vibePreferences: vibeSlug ? [vibeSlug] : [],
      activityPreferences: [],
      preferDogFriendly: false,
      timeWindows: [],
      occasions: []
    }
  }
  
  // Check sessionStorage for existing progress
  const stored = sessionStorage.getItem('onboardingProgress')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse stored onboarding data:', e)
    }
  }
  
  // Fresh start
  return {
    currentStep: 1,
    lifestyle: [],
    firstName: '',
    dateOfBirth: '',
    musicPreferences: {},
    vibePreferences: [],
    activityPreferences: [],
    preferDogFriendly: false,
    timeWindows: [],
    occasions: []
  }
}

// Save progress to sessionStorage (auto-save)
export function saveOnboardingProgress(data: OnboardingData) {
  sessionStorage.setItem('onboardingProgress', JSON.stringify(data))
}

// Clear progress from sessionStorage
export function clearOnboardingProgress() {
  sessionStorage.removeItem('onboardingProgress')
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// Map age to age range for backward compatibility
export function getAgeRange(age: number): string {
  if (age >= 18 && age <= 20) return '18-20'
  if (age >= 21 && age <= 24) return '21-24'
  if (age >= 25 && age <= 29) return '25-29'
  if (age >= 30 && age <= 34) return '30-34'
  if (age >= 35 && age <= 39) return '35-39'
  if (age >= 40 && age <= 49) return '40-49'
  if (age >= 50) return '50+'
  return ''
}

// Save completed onboarding to database
export async function saveOnboardingToDatabase(data: OnboardingData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Update profile with basic info
  const age = data.dateOfBirth ? calculateAge(data.dateOfBirth) : null
  
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: data.firstName,
      date_of_birth: data.dateOfBirth || null,
      age: age,
      prefer_dog_friendly: data.preferDogFriendly
    })
    .eq('user_id', user.id)

  if (profileError) throw profileError

  // Get tag IDs for preferences
  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('id, slug, category_id')
    .in('slug', [
      ...data.lifestyle,
      ...Object.keys(data.musicPreferences),
      ...data.vibePreferences,
      ...data.activityPreferences,
      ...data.timeWindows,
      ...data.occasions
    ])

  if (tagsError) throw tagsError

  // Clear existing preferences
  const { error: deleteError } = await supabase
    .from('user_preferences')
    .delete()
    .eq('user_id', user.id)

  if (deleteError) throw deleteError

  // Insert new preferences
  const preferences = []
  
  // Lifestyle (multiselect)
  for (const slug of data.lifestyle) {
    const tag = tags.find(t => t.slug === slug)
    if (tag) {
      preferences.push({
        user_id: user.id,
        tag_id: tag.id,
        weight_int: 1,
        input_type: 'multiselect'
      })
    }
  }

  // Music (sliders)
  for (const [slug, weight] of Object.entries(data.musicPreferences)) {
    const tag = tags.find(t => t.slug === slug)
    if (tag && weight > 0) {
      preferences.push({
        user_id: user.id,
        tag_id: tag.id,
        weight_int: weight,
        input_type: 'slider'
      })
    }
  }

  // Vibes & Activities (multiselect)
  for (const slug of [...data.vibePreferences, ...data.activityPreferences]) {
    const tag = tags.find(t => t.slug === slug)
    if (tag) {
      preferences.push({
        user_id: user.id,
        tag_id: tag.id,
        weight_int: 1,
        input_type: 'multiselect'
      })
    }
  }

  // Time Windows & Occasions (multiselect)
  for (const slug of [...data.timeWindows, ...data.occasions]) {
    const tag = tags.find(t => t.slug === slug)
    if (tag) {
      preferences.push({
        user_id: user.id,
        tag_id: tag.id,
        weight_int: 1,
        input_type: 'multiselect'
      })
    }
  }

  if (preferences.length > 0) {
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert(preferences)

    if (prefsError) throw prefsError
  }
}
