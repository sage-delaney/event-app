// This is the Louisville event discovery app.
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { personas } from '@/lib/personas';
import { useTagsByCategory } from '@/hooks/useTagsByCategory';
import { useEventsByTwoTags } from '@/hooks/useEventsByTwoTags';
import EventGrid from './EventGrid';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const ages = Array.from({ length: 32 }, (_, i) => i + 18).concat(50);

export default function LandingHero() {
  const router = useRouter();
  const [isInteractive, setIsInteractive] = useState(false);
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(0);

  const [selectedAge, setSelectedAge] = useState<number>(personas[0].age);
  const [selectedMusicSlug, setSelectedMusicSlug] = useState<string>(
    personas[0].musicSlug
  );
  const [selectedVibeSlug, setSelectedVibeSlug] = useState<string>(
    personas[0].vibeSlug
  );

  const { 
    tags: musicTags, 
    slugToId: musicSlugToId, 
    isLoading: isLoadingMusic, 
    isError: isErrorMusic, 
    refetch: refetchMusic 
  } = useTagsByCategory('Music');
  const { 
    tags: vibeTags, 
    slugToId: vibeSlugToId, 
    isLoading: isLoadingVibe, 
    isError: isErrorVibe, 
    refetch: refetchVibe 
  } = useTagsByCategory('Vibe');

  const selectedMusicTagId = useMemo(
    () => (selectedMusicSlug ? musicSlugToId[selectedMusicSlug] : null),
    [selectedMusicSlug, musicSlugToId]
  );
  const selectedVibeTagId = useMemo(
    () => (selectedVibeSlug ? vibeSlugToId[selectedVibeSlug] : null),
    [selectedVibeSlug, vibeSlugToId]
  );

  const { events, isLoading, isUpdating, usedFallback, isError, refetch } = useEventsByTwoTags(
    selectedMusicTagId,
    selectedVibeTagId
  );

  useEffect(() => {
    if (isInteractive) return;

    const interval = setInterval(() => {
      setCurrentPersonaIndex(prevIndex => (prevIndex + 1) % personas.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isInteractive]);

  useEffect(() => {
    if (!isInteractive && musicTags.length > 0 && vibeTags.length > 0) {
      const persona = personas[currentPersonaIndex];
      setSelectedAge(persona.age);
      
      // Use persona slug if it exists in database, otherwise use first available tag
      const musicTag = musicTags.find(t => t.slug === persona.musicSlug) || musicTags[0];
      const vibeTag = vibeTags.find(t => t.slug === persona.vibeSlug) || vibeTags[0];
      
      setSelectedMusicSlug(musicTag?.slug || '');
      setSelectedVibeSlug(vibeTag?.slug || '');
    }
  }, [currentPersonaIndex, isInteractive, musicTags, vibeTags]);

  const handleShuffle = () => {
    if (isInteractive) {
      const randomAge = ages[Math.floor(Math.random() * ages.length)];
      const randomMusic = musicTags[Math.floor(Math.random() * musicTags.length)];
      const randomVibe = vibeTags[Math.floor(Math.random() * vibeTags.length)];
      setSelectedAge(randomAge);
      setSelectedMusicSlug(randomMusic.slug);
      setSelectedVibeSlug(randomVibe.slug);
    } else {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * personas.length);
      } while (randomIndex === currentPersonaIndex);
      setCurrentPersonaIndex(randomIndex);
    }
  };

  const handleTryItOut = () => {
    setIsInteractive(true);
  };

  const musicTagName = musicTags.find(t => t.slug === selectedMusicSlug)?.name || '...';
  const vibeTagName = vibeTags.find(t => t.slug === selectedVibeSlug)?.name || '...';
  
  // Debug: Log available tags and events to console
  console.log('Available music tags:', musicTags.map(t => ({ slug: t.slug, name: t.name })));
  console.log('Available vibe tags:', vibeTags.map(t => ({ slug: t.slug, name: t.name })));
  console.log('Current persona:', { selectedMusicSlug, selectedVibeSlug });
  console.log('Selected tag IDs:', { selectedMusicTagId, selectedVibeTagId });
  console.log('Events query state:', { events, isLoading, isError, isUpdating, usedFallback });

  const handleFindEvents = () => {
    if (selectedMusicTagId && selectedVibeTagId) {
      const prefs = {
        age: selectedAge,
        musicTagId: selectedMusicTagId,
        vibeTagId: selectedVibeTagId,
      };

      sessionStorage.setItem('preOnboardPrefs', JSON.stringify(prefs));

      const params = new URLSearchParams({
        age: selectedAge.toString(),
        musicId: selectedMusicTagId.toString(),
        vibeId: selectedVibeTagId.toString(),
        source: 'landing',
      });

      router.push(`/auth?${params.toString()}`);
    }
  };

  return (
    <div className="w-full py-12 md:py-24">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Find Your Vibe in Louisville
        </h1>
        <div className="mt-8 text-lg text-gray-600">
          I’m a{' '}
          {isInteractive ? (
            <Select
              value={selectedAge.toString()}
              onValueChange={val => setSelectedAge(parseInt(val))}
            >
              <SelectTrigger className="inline-flex w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ages.map(age => (
                  <SelectItem key={age} value={age.toString()}>
                    {age === 50 ? '50+' : age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
                        <span className="font-semibold" aria-disabled="true" tabIndex={-1}>{selectedAge === 50 ? '50+' : selectedAge}</span>
          )}{' '}
          year old in Louisville who’s into{' '}
          {isInteractive ? (
                        <Select
              value={selectedMusicSlug}
              onValueChange={setSelectedMusicSlug}
              disabled={isLoadingMusic || isErrorMusic}
            >
              <SelectTrigger className="inline-flex w-auto">
                                <SelectValue placeholder={isLoadingMusic ? 'Loading...' : 'Music'} />
              </SelectTrigger>
              <SelectContent>
                                {isErrorMusic ? (
                  <div className="p-2 text-red-500">
                    Failed to load music tags.
                    <Button variant="link" onClick={() => refetchMusic()}>Retry</Button>
                  </div>
                ) : (
                  musicTags.map(tag => (
                    <SelectItem key={tag.id} value={tag.slug}>
                      {tag.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          ) : (
                        <span className="font-semibold" aria-disabled="true" tabIndex={-1}>{musicTagName}</span>
          )}{' '}
          and{' '}
          {isInteractive ? (
                        <Select 
              value={selectedVibeSlug} 
              onValueChange={setSelectedVibeSlug}
              disabled={isLoadingVibe || isErrorVibe}
            >
              <SelectTrigger className="inline-flex w-auto">
                                <SelectValue placeholder={isLoadingVibe ? 'Loading...' : 'Vibe'} />
              </SelectTrigger>
              <SelectContent>
                                {isErrorVibe ? (
                  <div className="p-2 text-red-500">
                    Failed to load vibes.
                    <Button variant="link" onClick={() => refetchVibe()}>Retry</Button>
                  </div>
                ) : (
                  vibeTags.map(tag => (
                    <SelectItem key={tag.id} value={tag.slug}>
                      {tag.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          ) : (
                        <span className="font-semibold" aria-disabled="true" tabIndex={-1}>{vibeTagName}</span>
          )}.
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={handleShuffle}>Shuffle</Button>
          {!isInteractive && (
            <Button onClick={handleTryItOut}>Try it out</Button>
          )}
                    <Button variant="default" onClick={handleFindEvents}>Find events</Button>
        </div>
      </div>

      <div className="container mx-auto mt-16">
                <EventGrid
          events={events}
          isLoading={isLoading}
          isUpdating={isUpdating}
          usedFallback={usedFallback}
          isError={isError}
          onRetry={refetch}
        />
      </div>
    </div>
  );
}
