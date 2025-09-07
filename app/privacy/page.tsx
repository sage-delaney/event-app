import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-6">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your phone number, name, and event preferences.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
          <p className="text-muted-foreground">
            We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about events and features.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Information Sharing</h2>
          <p className="text-muted-foreground">
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or as required by law.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. SMS Communications</h2>
          <p className="text-muted-foreground">
            By providing your phone number, you consent to receive SMS messages for authentication and event-related communications. Standard message and data rates may apply. You can opt out at any time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Data Security</h2>
          <p className="text-muted-foreground">
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Your Rights</h2>
          <p className="text-muted-foreground">
            You have the right to access, update, or delete your personal information. You may also request that we restrict or stop processing your data.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact us at privacy@eventapp.com.
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
