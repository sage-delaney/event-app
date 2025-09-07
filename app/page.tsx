import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Welcome to EventApp
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Discover, create, and manage events with ease. Connect with your community and never miss out on what matters to you.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/events">Browse Events</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/auth">Get Started</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary rounded-lg mx-auto flex items-center justify-center">
            <span className="text-primary-foreground text-xl">🎉</span>
          </div>
          <h3 className="text-lg font-semibold">Discover Events</h3>
          <p className="text-muted-foreground">Find exciting events happening in your area</p>
        </div>
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary rounded-lg mx-auto flex items-center justify-center">
            <span className="text-primary-foreground text-xl">📱</span>
          </div>
          <h3 className="text-lg font-semibold">Easy Registration</h3>
          <p className="text-muted-foreground">Quick SMS-based authentication to get you started</p>
        </div>
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary rounded-lg mx-auto flex items-center justify-center">
            <span className="text-primary-foreground text-xl">👥</span>
          </div>
          <h3 className="text-lg font-semibold">Connect</h3>
          <p className="text-muted-foreground">Meet like-minded people at events you love</p>
        </div>
      </div>
    </div>
  )
}
