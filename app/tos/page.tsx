import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-6">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using EventApp, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Use License</h2>
          <p className="text-muted-foreground">
            Permission is granted to temporarily use EventApp for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. User Account</h2>
          <p className="text-muted-foreground">
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Privacy Policy</h2>
          <p className="text-muted-foreground">
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Prohibited Uses</h2>
          <p className="text-muted-foreground">
            You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts. You may not violate any international, federal, provincial, or state regulations, rules, or laws.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Contact Information</h2>
          <p className="text-muted-foreground">
            If you have any questions about these Terms of Service, please contact us at legal@eventapp.com.
          </p>
        </section>
      </div>

      <div className="text-center pt-8">
        <Button asChild variant="outline">
          <Link href="/auth">Back to Sign In</Link>
        </Button>
      </div>
    </div>
  )
}
