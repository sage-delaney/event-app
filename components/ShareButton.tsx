'use client'

import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonProps {
  event: {
    title: string
    id: number
  }
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export default function ShareButton({ event, variant = "outline" }: ShareButtonProps) {
  const [showCopied, setShowCopied] = useState(false)

  const handleShare = async () => {
    const canonicalUrl = `${window.location.origin}/events/${event.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          url: canonicalUrl,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(canonicalUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  return (
    <Button variant={variant} onClick={handleShare}>
      {showCopied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Link copied
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </>
      )}
    </Button>
  );
}
