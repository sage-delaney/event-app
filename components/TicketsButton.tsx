'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface TicketsButtonProps {
  ticketUrl?: string
  className?: string
}

export default function TicketsButton({ ticketUrl, className }: TicketsButtonProps) {
  const handleTickets = () => {
    if (ticketUrl) {
      window.open(ticketUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Button 
      onClick={handleTickets} 
      className={className}
      disabled={!ticketUrl}
    >
      <ExternalLink className="h-4 w-4 mr-2" />
      Get Tickets
    </Button>
  );
}
