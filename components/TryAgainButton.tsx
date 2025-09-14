'use client'

import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function TryAgainButton() {
  return (
    <Button variant="outline" onClick={() => window.location.reload()}>
      <RefreshCw className="h-4 w-4 mr-2" />
      Try again
    </Button>
  )
}
