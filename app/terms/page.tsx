import Link from "next/link";
import { ScanLine } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Card<span className="text-gradient">Scan</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-4">Last updated: July 2025</p>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using CardScan Pro, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p>
              CardScan Pro is an AI-powered business card scanner that extracts contact information
              from business card images and helps you manage leads through a pipeline dashboard.
              The service includes card scanning, lead management, and analytics features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials.
              You agree to notify us immediately of any unauthorized use of your account. You must
              be at least 18 years old to use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Acceptable Use</h2>
            <p>
              You agree to use CardScan Pro only for lawful purposes. You will not use the service
              to scan cards containing illegal content, attempt to reverse-engineer the AI extraction
              system, or abuse the service in any way that could disrupt its operation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Intellectual Property</h2>
            <p>
              The CardScan Pro service, including its design, code, and AI models, is owned by us
              and protected by intellectual property laws. You retain ownership of the data you scan
              and create through the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
            <p>
              CardScan Pro is provided &quot;as is&quot; without warranties of any kind. We are not liable
              for any damages arising from your use of the service. Our liability is limited to the
              amount you paid for the service in the preceding 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Termination</h2>
            <p>
              We may terminate or suspend your account at any time for violation of these terms.
              You may delete your account at any time from your Account Settings. Upon termination,
              your right to use the service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service
              after changes constitutes acceptance of the new terms. We will notify you of material
              changes through the app or by email.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
